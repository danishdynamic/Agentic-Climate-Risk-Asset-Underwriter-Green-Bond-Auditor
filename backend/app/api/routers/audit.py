from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.auditor import auditor_service
from app.services.risk_engine import risk_engine_service

router = APIRouter(prefix="/audit", tags=["Compliance & Risk Underwriting"])

class AuditExecutionRequest(BaseModel):
    isin: str = Field(..., min_length=12, max_length=12, examples=["US1234567890"])
    instruction: str = Field(..., examples=["Verify carbon capture milestones against emission reductions"])

class HedgingStrategyRequest(BaseModel):
    bond_id: int = Field(..., description="Internal database ID of the target bond")

@router.post("/underwrite", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def execute_underwriting_assessment(
    request: AuditExecutionRequest, db: AsyncSession = Depends(get_db)
):
    try:
        audit_report = await auditor_service.execute_underwriting_audit(
            db=db, bond_isin=request.isin, user_instruction=request.instruction
        )
        return audit_report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Orchestrated compliance audit loop failed: {str(e)}",
        )

@router.post("/calculate-hedging-strategy", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def compute_risk_hedging_playbook(
    request: HedgingStrategyRequest, 
    db: AsyncSession = Depends(get_db)
):
    """
    Refactored: Now triggers the full DB-reliant strategy pipeline 
    using the provided session.
    """
    try:
        # We now use the unified generate_strategy method which handles:
        # 1. DB fetching (joined loads)
        # 2. Greek calculation (analytical/binomial)
        # 3. AI playbook synthesis
        playbook = await risk_engine_service.generate_strategy(
            session=db, 
            bond_id=request.bond_id
        )
        return playbook
    
    except ValueError as ve:
        # Handle cases where bond_id doesn't exist or profiles are missing
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail=str(ve))
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quantitative derivative strategy pipeline fault: {str(e)}",
        )