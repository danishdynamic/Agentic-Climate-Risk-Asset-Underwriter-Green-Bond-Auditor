import json
import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from google import genai
from google.genai import types

from app.config import settings
from app.services.quota_manager import quota_manager

logger = logging.getLogger("risk_backend.retriever")

class RetrieverService:
    def __init__(self):
        # Resolve client orchestration via official GenAI SDK mapping
        self.ai_client = genai.Client(api_key=settings.GOOGLE_API_KEY.get_secret_value())
        self.generation_model = settings.GEMINI_MODEL_ID
        self.embedding_model = "text-embedding-004"

    async def translate_query(self, user_query: str) -> Tuple[str, Dict[str, Any]]:
        """
        Uses Gemini to parse structured metadata parameters out of natural conversation.
        Decouples semantic search optimization from transactional parameter mapping.
        """
        prompt = f"""
        You are an advanced financial data engine. Analyze the incoming user query targeting 
        our climate risk bond database. Extract logical metadata constraints and compile a 
        refined semantic search query optimized for vector-space similarity lookups.

        User Query: "{user_query}"

        Return a valid JSON object matching this structure exactly:
        {{
            "semantic_query": "Rephrased or expanded query string maximizing contextual terms",
            "filters": {{
                "bond_type": "CORPORATE" or "SOVEREIGN" or null,
                "credit_rating": "AAA", "BBB-", etc. or null,
                "min_coupon_rate": float or null
            }}
        }}
        """
        
        # Guardrail check against 3,860 TPM window ceiling
        estimated_tokens = len(prompt) // 4
        await quota_manager.acquire_quota(estimated_tokens=estimated_tokens)
        
        try:
            response = self.ai_client.models.generate_content(
                model=self.generation_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            
            data = json.loads(response.text or "{}")
            semantic_query = data.get("semantic_query", user_query)
            filters = data.get("filters", {})
            return semantic_query, filters
            
        except Exception as e:
            logger.error(f"Query translation pipeline failed; falling back to raw lookup string. Details: {str(e)}")
            return user_query, {}

    async def retrieve_relevant_chunks(
        self, db: AsyncSession, user_query: str, limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Translates string requests, extracts structural filter bounds, performs
        HNSW vector lookup, and yields consolidated contextual metadata blocks.
        """
        # 1. Perform Intent Translation
        semantic_query, filters = await self.translate_query(user_query)
        logger.info(f"Retriever Target Map -> Semantic: '{semantic_query}' | Extracted Filters: {filters}")

        # 2. Vectorize Search String via text-embedding-004
        estimated_tokens = len(semantic_query) // 4
        await quota_manager.acquire_quota(estimated_tokens=estimated_tokens)
        
        embed_response = self.ai_client.models.embed_content(
            model=self.embedding_model,
            contents=semantic_query
        )
        query_vector = embed_response.embeddings[0].values if embed_response.embeddings else []

        # 3. Dynamic SQL Construction Combining Vectors & Categorical Indexes
        base_sql = """
            SELECT 
                ac.id as chunk_id,
                ac.chunk_content,
                b.isin,
                b.asset_name,
                b.bond_type,
                b.credit_rating,
                b.coupon_rate,
                (ac.embedding <=> CAST(:query_vector AS vector)) as distance
            FROM asset_chunks ac
            JOIN bond_assets b ON ac.bond_id = b.id
            WHERE 1=1
        """
        
        params: Dict[str, Any] = {"query_vector": str(query_vector)}
        
        # Inject exact matching conditional clauses
        if filters.get("bond_type"):
            base_sql += " AND b.bond_type = :bond_type"
            params["bond_type"] = filters["bond_type"]
            
        if filters.get("credit_rating"):
            base_sql += " AND b.credit_rating = :credit_rating"
            params["credit_rating"] = filters["credit_rating"]

        if filters.get("min_coupon_rate") is not None:
            base_sql += " AND b.coupon_rate >= :min_coupon_rate"
            params["min_coupon_rate"] = float(filters["min_coupon_rate"])

        # Cosine distance order (closest match yields minimum directional distance)
        base_sql += " ORDER BY distance ASC LIMIT :limit"
        params["limit"] = limit

        # 4. Fetch rows over the asynchronous connection handler
        result = await db.execute(text(base_sql), params)
        rows = result.mappings().all()
        
        return [dict(row) for row in rows]

retriever_service = RetrieverService()