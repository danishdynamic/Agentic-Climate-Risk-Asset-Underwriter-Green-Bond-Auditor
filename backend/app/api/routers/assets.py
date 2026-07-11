from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.finance import (
    Bond,
    ClimateRiskProfile,
    TransitionRiskProfile,
    MarketRiskProfile, RiskProfile, HedgeOption, OptionExerciseStyle, OptionType
)
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import json
from sqlalchemy import text
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
    country: str | None = Form(None),
    sector: str = Form(...),
    industry: str = Form(...),
    duration: float | None = Form(None),
    yield_rate: float | None = Form(None),
    spread: float | None = Form(None),
    volatility: float | None = Form(None),
    liquidity_score: float | None = Form(None),
    latest_price: float = Form(...),
    recommended_strike: float = Form(...),
    time_to_maturity: float = Form(...),
    overall_physical_risk: float = Form(...),
    physical_risk_level: str = Form(...),
    transition_risk_score: float = Form(...),
    probability_of_default: float = Form(...),
    loss_given_default: float = Form(...),
    climate_var: float = Form(...),
    expected_annual_loss: float = Form(...),
    overall_risk_score: float = Form(...),
    investment_grade: bool = Form(...),
    green_bond_compliant: bool = Form(...),
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

        # 2. Upsert expanded MarketRiskProfile
        await _upsert_profile(
            db,
            MarketRiskProfile,
            bond.id,
            {
                "duration": duration,
                "yield_rate": yield_rate,
                "spread": spread,
                "volatility": volatility,
                "liquidity_score": liquidity_score,
                "latest_price": latest_price,
                "recommended_strike": recommended_strike,
                "time_to_maturity": time_to_maturity,
            }
        )

        # 3. Upsert expanded ClimateRiskProfile
        await _upsert_profile(
            db,
            ClimateRiskProfile,
            bond.id,
            {
                "flood_score": flood_score,
                "wildfire_score": wildfire_score,
                "heat_score": heat_score,
                "drought_score": drought_score,
                "overall_physical_risk": overall_physical_risk,
                "physical_risk_level": physical_risk_level,
            }
        )

        # 4. Upsert expanded TransitionRiskProfile
        await _upsert_profile(
            db,
            TransitionRiskProfile,
            bond.id,
            {
                "carbon_intensity": carbon_intensity,
                "industry": industry,
                "sector": sector,
                "country": country,
                "eu_taxonomy_eligible": eu_taxonomy_eligible,
                "transition_risk_score": transition_risk_score,
            }
        )

        # 5. Upsert newly populated RiskProfile
        await _upsert_profile(
            db,
            RiskProfile,
            bond.id,
            {
                "probability_of_default": probability_of_default,
                "loss_given_default": loss_given_default,
                "climate_var": climate_var,
                "expected_annual_loss": expected_annual_loss,
                "overall_risk_score": overall_risk_score,
                "investment_grade": investment_grade,
                "green_bond_compliant": green_bond_compliant,
            }
        )

        # 6. Populate HedgeOption if it doesn't already exist
        hedge_result = await db.execute(
            select(HedgeOption).where(HedgeOption.bond_id == bond.id)
        )
        existing_hedge = hedge_result.scalars().first()

        if not existing_hedge:
            db.add(
                HedgeOption(
                    bond_id=bond.id,
                    option_style=OptionExerciseStyle.EUROPEAN,
                    option_type=OptionType.PUT,
                    strike_price=recommended_strike,
                    implied_volatility=volatility,
                    time_to_maturity=time_to_maturity,
                )
            )

        # 7. Process Vectorization (With JSON metadata pipeline intact)
        raw_text = await ingestion_service.extract_text_from_file(file)
        chunks_created = await ingestion_service.process_and_vectorize_asset(
            db=db,
            bond_isin=isin,
            raw_text=raw_text,
            metadata={
                "sector": sector, 
                "country": country, 
                "green": eu_taxonomy_eligible
            },
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