from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.finance import (
    Bond,
    ClimateRiskProfile,
    TransitionRiskProfile,
    MarketRiskProfile,
)
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.services.retriever import retriever_service
from app.services.ingestion import ingestion_service
from app.services.metrics import track_execution_latency
import logging

router = APIRouter(prefix="/assets", tags=["Assets & Ingestion"])
logger = logging.getLogger("risk_backend.assets")


class SearchResult(BaseModel):
    chunk_id: int
    chunk_content: str
    isin: str
    asset_name: str
    bond_type: str
    credit_rating: str
    coupon_rate: float
    distance: float


class VectorSearchResponse(BaseModel):
    results: List[SearchResult]


class VectorSearchRequest(BaseModel):
    query: str = Field(
        ..., examples=["Find green corporate bonds with a coupon rate over 4.5%"]
    )
    limit: Optional[int] = Field(default=5, ge=1, le=20)


class IngestAssetRequest(BaseModel):
    isin: str = Field(..., min_length=12, max_length=12, examples=["US1234567890"])
    asset_name: str = Field(..., examples=["North Atlantic Wind Energy Bond"])
    bond_type: str = Field(..., examples=["CORPORATE"])  # CORPORATE or SOVEREIGN
    credit_rating: str = Field(..., examples=["AA-"])
    coupon_rate: float = Field(..., ge=0.0, examples=[4.75])


@track_execution_latency("semantic_search")
@router.post( "/search", response_model=VectorSearchResponse, status_code=status.HTTP_200_OK)
async def semantic_metadata_search(
    request: VectorSearchRequest, db: AsyncSession = Depends(get_db)
):
    try:
        logger.info(f"Starting retrieval for query: {request.query}")

        results = await retriever_service.retrieve_relevant_chunks(
            db=db, user_query=request.query, limit=request.limit or 5
        )

        logger.info(
            f"Retrieval complete. Found {len(results) if results else 0} items."
        )

        sanitized_results = []
        for item in results or []:
            sanitized_results.append(
                {
                    "chunk_id": int(item.get("chunk_id", 0)),
                    "chunk_content": str(item.get("chunk_content", "")),
                    "isin": str(item.get("isin", "")),
                    "asset_name": str(item.get("asset_name", "")),
                    "bond_type": str(item.get("bond_type", "")),
                    "credit_rating": str(item.get("credit_rating", "")),
                    "coupon_rate": float(item.get("coupon_rate", 0.0)),
                    "distance": float(item.get("distance", 0.0)),
                }
            )

        logger.info("Sanitization complete. Returning response.")
        return {"results": sanitized_results}

    except Exception as e:
        logger.error(f"CRITICAL ERROR during search: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def _upsert_profile(db: AsyncSession, model, bond_id: int, data: dict):
    """Helper to update existing profile or create a new one."""
    stmt = select(model).where(model.bond_id == bond_id)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if existing:
        for key, value in data.items():
            setattr(existing, key, value)
    else:
        new_profile = model(bond_id=bond_id, **data)
        db.add(new_profile)
    await db.flush()


@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_structured_asset(
    isin: str = Form(...),
    asset_name: str = Form(...),
    bond_type: str = Form(...),
    credit_rating: str = Form(...),
    coupon_rate: float = Form(...),
    face_value: float = Form(...),
    country: str = Form(...),
    sector: str = Form(...),
    industry: str = Form(...),
    duration: float = Form(...),
    yield_rate: float = Form(...),
    spread: float = Form(...),
    volatility: float = Form(...),
    liquidity_score: float = Form(...),
    flood_score: float = Form(...),
    wildfire_score: float = Form(...),
    heat_score: float = Form(...),
    drought_score: float = Form(...),
    carbon_intensity: float = Form(...),
    eu_taxonomy_eligible: bool = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        # 1. Fetch existing or create new bond
        result = await db.execute(select(Bond).where(Bond.isin == isin))
        bond = result.scalars().first()
        
        if not bond:
            bond = Bond(
                isin=isin,
                asset_name=asset_name,
                bond_type=bond_type,
                credit_rating=credit_rating,
                face_value=face_value,
                coupon_rate=coupon_rate,
                maturity_date=datetime.now(timezone.utc),
            )
            db.add(bond)
            await db.flush()

        # 2. Upsert normalized profiles
        await _upsert_profile(db, MarketRiskProfile, bond.id, {
            "duration": duration, "yield_rate": yield_rate, "spread": spread,
            "volatility": volatility, "liquidity_score": liquidity_score
        })

        await _upsert_profile(db, ClimateRiskProfile, bond.id, {
            "flood_score": flood_score, "wildfire_score": wildfire_score,
            "heat_score": heat_score, "drought_score": drought_score
        })

        await _upsert_profile(db, TransitionRiskProfile, bond.id, {
            "carbon_intensity": carbon_intensity, "industry": industry,
            "sector": sector, "country": country, "eu_taxonomy_eligible": eu_taxonomy_eligible
        })

        # 3. Process Vectorization
        raw_text = await ingestion_service.extract_text_from_file(file)
        chunks_created = await ingestion_service.process_and_vectorize_asset(
            db=db,
            bond_isin=isin,
            raw_text=raw_text,
            metadata={"sector": sector, "country": country, "green": eu_taxonomy_eligible},
        )

        await db.commit()
        return {
            "status": "SUCCESS",
            "bond_id": bond.id,
            "chunks_processed": chunks_created,
        }

    except Exception as e:
        await db.rollback()
        logger.exception(f"Failed to ingest asset {isin}")
        raise HTTPException(
            status_code=500,
            detail=f"Ingestion failed: {str(e)}"
        )
