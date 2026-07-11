import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from google import genai
import fitz  
import io
import json
from fastapi import UploadFile, HTTPException
from google.genai import types

from app.config import settings
from app.services.quota_manager import quota_manager

logger = logging.getLogger("risk_backend.ingestion")

def chunk_text_by_words(text_content: str, chunk_size: int = 150, overlap: int = 30) -> List[str]:
    """Splits long narrative profiles into dense overlapping context blocks."""
    words = text_content.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunks.append(" ".join(chunk_words))
        i += chunk_size - overlap
    return chunks

class IngestionService:
    def __init__(self):
        self.ai_client = genai.Client(api_key=settings.GOOGLE_API_KEY.get_secret_value())
        self.embedding_model = "gemini-embedding-2"
        self.embed_config = types.EmbedContentConfig(output_dimensionality=768)


    async def extract_text_from_file(self, file: UploadFile) -> str:
        filename = file.filename or ""
        content = await file.read()
        
        if filename.lower().endswith(".pdf"):
            with fitz.open(stream=io.BytesIO(content), filetype="pdf") as doc:
                text_list = [str(page.get_text() or "") for page in doc]
                return "\n".join(text_list)
        
        elif filename.lower().endswith(".txt"):
            return content.decode("utf-8")
        
        else:
            raise ValueError(f"Unsupported file format: {filename}")

    async def process_and_vectorize_asset(self, db: AsyncSession, bond_isin: str, raw_text: str, metadata: dict) -> int:
        """
        Resolves ISIN to internal ID, then chunks, embeds, and commits to pgvector.
        """
        # 1. Resolve ISIN to internal database integer ID
        result = await db.execute(text("SELECT id FROM bonds WHERE isin = :isin"), {"isin": bond_isin})
        bond_row = result.fetchone()

        if not bond_row:
            raise ValueError(f"Bond with ISIN {bond_isin} not found in master records.")
        
        internal_bond_id = bond_row[0]

        # 2. Structural Chunk Segmentation
        text_chunks = chunk_text_by_words(raw_text, chunk_size=150, overlap=30)
        if not text_chunks:
            logger.info("Empty asset documentation text received. Skipping generation.")
            return 0

        chunks_created = 0

        # 3. Sequential Processing
        for chunk in text_chunks:
            estimated_tokens = max(len(chunk) // 4, 1)
            await quota_manager.acquire_quota(estimated_tokens=estimated_tokens)

            try:
                response = self.ai_client.models.embed_content(
                    model=self.embedding_model,
                    contents=chunk,
                    config=self.embed_config
                )
                vector_embedding = response.embeddings[0].values if response.embeddings else []

                # 4. Insert into DB using internal_bond_id
                query = text("""
                    INSERT INTO asset_chunks (bond_id, chunk_content, embedding)
                    VALUES (:bond_id, :content, CAST(:embedding AS vector))
                """)

                await db.execute(query, {
                    "bond_id": internal_bond_id,
                    "content": chunk,
                    "embedding": str(vector_embedding),
                    "metadata": json.dumps(metadata)
                })
                
                chunks_created += 1

            except Exception as e:
                logger.error(f"Failed to generate embedding for chunk: {str(e)}")
                raise e

        # Finalize
        await db.commit()
        logger.info(f"Successfully processed ISIN {bond_isin} (Internal ID: {internal_bond_id}): Created {chunks_created} entities.")
        return chunks_created

ingestion_service = IngestionService()