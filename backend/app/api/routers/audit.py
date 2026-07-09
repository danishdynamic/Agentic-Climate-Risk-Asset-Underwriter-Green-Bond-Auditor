from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.services.auditor import auditor_service
from app.services.risk_engine import risk_engine_service
from app.api.schemas.underwriting import UnderwritingResponse
from app.models.finance import Bond

router = APIRouter(prefix="/audit", tags=["Compliance & Risk Underwriting"])

class AuditExecutionRequest(BaseModel):
    isin: str = Field(..., min_length=12, max_length=12, examples=["US1234567890"])
    instruction: str = Field(..., examples=["Verify carbon capture milestones against emission reductions"])

class HedgingStrategyRequest(BaseModel):
    bond_isin: str = Field(..., min_length=12, max_length=12, examples=["US1234567890"])

@router.post("/underwrite", response_model=UnderwritingResponse, status_code=status.HTTP_200_OK)
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
    Resolves the target bond entity via its unique ISIN string, then routes 
    the resolved primary key down into the quantitative derivative hedging engine.
    """
    try:
        # 1. Resolve bond identity via incoming ISIN character string
        result = await db.execute(
            select(Bond.id).where(Bond.isin == request.bond_isin)
        )
        bond_id = result.scalar_one_or_none()
        
        if not bond_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bond ISIN not found"
            )

        # 2. Pipeline execution using verified bond identifier
        playbook = await risk_engine_service.generate_strategy(
            session=db, 
            bond_id=bond_id
        )
        return playbook

    except HTTPException:
        # Forward explicit HTTP status exceptions cleanly without catch-all distortion
        raise
    
    except ValueError as ve:
        # Handle backend model logic discrepancies (e.g. missing sub-profiles)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=str(ve)
        )
    
    except Exception as e:
        # Fallback processing failure handler
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quantitative derivative strategy pipeline fault: {str(e)}",
        )