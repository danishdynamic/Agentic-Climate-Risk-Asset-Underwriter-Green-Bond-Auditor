import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from google import genai

from app.config import settings
from app.services.quota_manager import quota_manager

logger = logging.getLogger("risk_backend.ingestion")

def chunk_text_by_words(text_content: str, chunk_size: int = 150, overlap: int = 30) -> List[str]:
    """
    Splits long narrative profiles into dense overlapping context blocks.
    Ensures sentence continuity across boundaries without breaking words mid-flight.
    """
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
        # Initialize the official Google GenAI SDK client
        # It automatically resolves settings.GOOGLE_API_KEY from environment state
        self.ai_client = genai.Client(api_key=settings.GOOGLE_API_KEY.get_secret_value())
        self.embedding_model = "text-embedding-004"  # Strict 768-dimension blueprint target

    async def process_and_vectorize_asset(self, db: AsyncSession, bond_id: int, raw_text: str) -> int:
        """
        Token-checks, splits, embeds, and commits text chunks into pgvector.
        Returns the total number of vector chunks processed.
        """
        # 1. Structural Chunk Segmentation
        text_chunks = chunk_text_by_words(raw_text, chunk_size=150, overlap=30)
        if not text_chunks:
            logger.info("Empty asset documentation text received. Skipping generation.")
            return 0

        chunks_created = 0

        # 2. Sequential Processing to Respect the 15 RPM / 3,860 TPM Window
        for chunk in text_chunks:
            # Conservative token heuristic: ~4 characters per token
            estimated_tokens = max(len(chunk) // 4, 1)

            # Pre-flight Guardrail Check: Block if window capacity is breached
            await quota_manager.acquire_quota(estimated_tokens=estimated_tokens)

            try:
                # 3. Request Vector Space from Gemini
                response = self.ai_client.models.embed_content(
                    model=self.embedding_model,
                    contents=chunk
                )
                
                # Extract the 768 float array values
                vector_embedding = response.embeddings[0].values if response.embeddings else []

                # 4. Write Directly to DB Using Native PostgreSQL String-to-Vector Cast
                # This keeps code clean and decouples it from complex native python pgvector wrappers
                query = text("""
                    INSERT INTO asset_chunks (bond_id, chunk_content, embedding)
                    VALUES (:bond_id, :content, CAST(:embedding AS vector))
                """)
                
                await db.execute(query, {
                    "bond_id": bond_id,
                    "content": chunk,
                    "embedding": str(vector_embedding) # Cast list to Postgres standard vector string format: "[0.1,0.2,...]"
                })
                
                chunks_created += 1

            except Exception as e:
                logger.error(f"Failed to generate embedding matrix for chunk: {str(e)}")
                raise e

        # Commit entire pipeline transaction upon sequence completion
        await db.commit()
        logger.info(f"Successfully processed asset {bond_id}: Created {chunks_created} vector entities.")
        return chunks_created

# Instantiate service singleton
ingestion_service = IngestionService()