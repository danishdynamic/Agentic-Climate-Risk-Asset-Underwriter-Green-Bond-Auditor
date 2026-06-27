from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.retriever import retriever_service

router = APIRouter(prefix="/assets", tags=["Assets & Ingestion"])

class VectorSearchRequest(BaseModel):
    query: str = Field(..., examples=["Find green corporate bonds with a coupon rate over 4.5%"])
    limit: Optional[int] = Field(default=5, ge=1, le=20)

class IngestAssetRequest(BaseModel):
    isin: str = Field(..., min_length=12, max_length=12, examples=["US1234567890"])
    asset_name: str = Field(..., examples=["North Atlantic Wind Energy Bond"])
    bond_type: str = Field(..., examples=["CORPORATE"])  # CORPORATE or SOVEREIGN
    credit_rating: str = Field(..., examples=["AA-"])
    coupon_rate: float = Field(..., ge=0.0, examples=[4.75])

@router.post("/search", response_model=List[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def semantic_metadata_search(
    request: VectorSearchRequest, 
    db: AsyncSession = Depends(get_db)
):
    """
    Executes an isolated HNSW vector matching lookup.
    Translates unstructured search phrases into database queries.
    """
    try:
        results = await retriever_service.retrieve_relevant_chunks(
            db=db, user_query=request.query, limit=request.limit if request.limit is not None else 5
        )
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Vector similarity retrieval path errored: {str(e)}"
        )

@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_structured_asset(
    payload: IngestAssetRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Direct endpoint for seeding asset data. 
    In production, this handles payloads forwarded by Kafka event triggers.
    """
    # Placeholder insertion routing — interacts with your SQLAlchemy models
    return {
        "status": "QUEUED_FOR_INDEXING",
        "isin": payload.isin,
        "message": "Asset metadata logged. Awaiting text chunk vector generation loop."
    }