from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.auditor import auditor_service
from app.services.risk_engine import risk_engine_service
from app.models.finance import CreditRating

router = APIRouter(prefix="/audit", tags=["Compliance & Risk Underwriting"])

class AuditExecutionRequest(BaseModel):
    isin: str = Field(..., min_length=12, max_length=12, examples=["US1234567890"])
    instruction: str = Field(..., examples=["Verify carbon capture milestones against emission reductions"])

class QuantitativeHedgeRequest(BaseModel):
    isin: str
    credit_rating: str
    hazard_score: float = Field(..., ge=0.0, le=100.0)
    financial_exposure: float = Field(..., gt=0.0)
    underlying_price: float = Field(..., gt=0.0)
    strike_price: float = Field(..., gt=0.0)
    time_to_maturity: float = Field(..., gt=0.0, description="Time expressed in fractional years")
    risk_free_rate: float = Field(..., ge=0.0)
    implied_volatility: float = Field(..., gt=0.0)

@router.post("/underwrite", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def execute_underwriting_assessment(
    request: AuditExecutionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Launches our self-reflective, two-stage compliance audit.
    Retrieves vector contexts, builds the draft report, and runs an adversarial verification step.
    """
    try:
        audit_report = await auditor_service.execute_underwriting_audit(
            db=db, bond_isin=request.isin, user_instruction=request.instruction
        )
        return audit_report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Orchestrated compliance audit loop failed: {str(e)}"
        )

@router.post("/calculate-hedging-strategy", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def compute_risk_hedging_playbook(request: QuantitativeHedgeRequest):
    """
    Combines deterministic financial modeling with generative analysis.
    Computes Black-Scholes Greeks and uses Gemini to map out hedging adjustments.
    """
    try:
        # 1. Compute exact Option sensitivities (Greeks)
        greeks = risk_engine_service._calculate_european_greeks(
            S=request.underlying_price,
            K=request.strike_price,
            T=request.time_to_maturity,
            r=request.risk_free_rate,
            sigma=request.implied_volatility,
            option_type="put" # Standard choice for downstream asset risk protection
        )

        # 2. Feed sensitivities to Gemini to formulate macro strategy text
        strategy_playbook = await risk_engine_service.generate_mitigation_strategy(
            isin=request.isin,
            credit_rating=CreditRating(request.credit_rating),
            hazard_score=request.hazard_score,
            financial_exposure=request.financial_exposure,
            greeks=greeks
        )

        # 3. Consolidate numerical parameters alongside descriptive output
        return {
            "computed_greeks": greeks,
            "strategic_playbook": strategy_playbook
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quantitative derivative strategy pipeline encountered a fault: {str(e)}"
        )