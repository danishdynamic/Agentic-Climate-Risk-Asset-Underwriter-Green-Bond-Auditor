from typing import List, Optional
import logging

from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from fastapi.encoders import jsonable_encoder
from app.database import async_session_maker
from app.models.finance import Bond, AssetValuation
from app.services.risk_engine import risk_engine_service
from app.tools.risk import calculate_climate_var
from app.tools.compliance import verify_green_bond_compliance
from app.tools.actuarial import calculate_expected_annual_loss
from app.services.bond_analysis_service import bond_analysis_service

logger = logging.getLogger(__name__)


# ==========================================================
# Database Query Helper
# ==========================================================

async def get_bond_by_isin(session, bond_isin: str, options: Optional[list] = None) -> Optional[Bond]:
    """
    Shared utility function to eliminate query boilerplate across tools.
    Supports optional eager relationship loading.
    """
    stmt = select(Bond).where(Bond.isin == bond_isin)
    if options:
        stmt = stmt.options(*options)
    return (await session.execute(stmt)).scalar_one_or_none()


# ==========================================================
# 1. Institutional Bond Risk Assessment
# ==========================================================

@tool
async def analyze_bond_tool(bond_isin: str) -> dict:
    """
    Perform a complete institutional bond risk assessment.

    Given a bond ISIN, this tool automatically:
    - retrieves all bond information
    - evaluates climate risk
    - evaluates transition risk
    - evaluates market risk
    - calculates Climate VaR
    - calculates Expected Annual Loss
    - evaluates Green Bond compliance
    - calculates the overall ESG/Risk score

    Always use this tool whenever the user asks to analyse, assess,
    evaluate, underwrite, review, or calculate the risk of a bond.
    """
    async with async_session_maker() as session:
        bond = await get_bond_by_isin(session, bond_isin)
        if not bond:
            return {"error": f"Bond ISIN {bond_isin} not found."}

        result = await bond_analysis_service.analyze_bond(
            session=session,
            bond_id=bond.id,
            credit_rating=bond.credit_rating,
        )

        return jsonable_encoder(result)
# ==========================================================
# 2. Climate Value at Risk
# ==========================================================

@tool
async def climate_value_at_risk_tool(bond_isin: str) -> dict:
    """
    Calculates Climate-Adjusted Value at Risk for the selected bond
    using live profile data from the database.
    """
    async with async_session_maker() as session:
        # Pass relationship requirements cleanly via the options list wrapper
        bond = await get_bond_by_isin(
            session, 
            bond_isin, 
            options=[joinedload(Bond.market_profile), joinedload(Bond.climate_profile)]
        )

        if not bond:
            return {"error": f"Bond ISIN {bond_isin} not found."}

        if not bond.market_profile or not bond.climate_profile:
            return {"error": f"Risk profiles incomplete for bond '{bond_isin}'."}

        nominal_exposure = float(bond.face_value)
        base_volatility = float(bond.market_profile.volatility)
        hazard_score = float(bond.climate_profile.overall_physical_risk) * 100

        var = calculate_climate_var(
            nominal_exposure=nominal_exposure,
            base_volatility=base_volatility,
            hazard_score=hazard_score,
        )

        return {
            "bond_isin": bond.isin,
            "asset_name": bond.asset_name,
            "bond_type": bond.bond_type.value,
            "credit_rating": bond.credit_rating,
            "market_volatility_used": base_volatility,
            "physical_risk_score_used": hazard_score,
            **var,
        }


# ==========================================================
# 3. Green Compliance Verification
# ==========================================================

@tool
async def green_compliance_verification_tool(bond_isin: str) -> dict:
    """
    Verifies if a bond meets green compliance standards using its ISIN.
    All required metrics (bond type, coupon rate, documented milestones, and credit rating)
    are fetched internally from the database.
    """
    async with async_session_maker() as session:
        bond = await get_bond_by_isin(session, bond_isin)
        if not bond:
            return {"error": f"Bond ISIN {bond_isin} not found."}

        # Cast coupon_rate to float to insulate against future Decimal serialization issues
        return verify_green_bond_compliance(
            bond_type=bond.bond_type.value,
            coupon_rate=float(bond.coupon_rate),
            documented_milestones=bond.metadata_json.get("milestones", []),
            credit_rating=bond.credit_rating,
        )


# ==========================================================
# 4. Historical Valuation
# ==========================================================

@tool
async def get_asset_valuation(bond_isin: str) -> List[dict]:
    """
    Returns historical valuation data for the selected bond.
    """
    async with async_session_maker() as session:
        bond = await get_bond_by_isin(session, bond_isin)
        if not bond:
            return [{"error": f"Bond ISIN {bond_isin} not found."}]

        valuation_stmt = (
            select(AssetValuation)
            .where(AssetValuation.bond_id == bond.id)
            .order_by(AssetValuation.valuation_date)
        )
        rows = (await session.execute(valuation_stmt)).scalars().all()

        return [
            {
                "Date": row.valuation_date.strftime("%Y-%m-%d"),
                "Valuation": float(row.valuation),
            }
            for row in rows
        ]


# ==========================================================
# 5. Actuarial Expected Annual Loss (Restored)
# ==========================================================

@tool
async def actuarial_expected_loss_tool(bond_isin: str) -> dict:
    """
    Calculates the Expected Annual Loss for a bond identified by its ISIN.
    Fetches internal climate risk metrics and pricing valuations automatically from the database.
    """
    async with async_session_maker() as session:
        # Eagerly load the climate profile metrics and historical valuations
        bond = await get_bond_by_isin(
            session,
            bond_isin,
            options=[joinedload(Bond.climate_profile), joinedload(Bond.valuations)]
        )
        
        if not bond:
            return {"error": f"Bond ISIN {bond_isin} not found."}

        # 1. Determine asset valuation (use latest valuation row, fallback to face_value)
        latest_val = max(
            bond.valuations,
            key=lambda v: v.valuation_date,
            default=None,
        )
        asset_valuation = float(latest_val.valuation) if latest_val else float(bond.face_value)

        # 2. Safely extract climate risk params from climate_profile
        cp = bond.climate_profile
        
        # NOTE: Adjust property lookups if your DB column names vary 
        # (e.g., if you map 'structural_vulnerability_alpha' from 'overall_physical_risk')
        structural_vulnerability_alpha = float(getattr(cp, "structural_vulnerability_alpha", 0.5)) if cp else 0.5
        hazard_probability = float(getattr(cp, "hazard_probability", 0.01)) if cp else 0.01

        try:
            # Invoke using the exact parameter keys required by the calculation function
            loss_result = calculate_expected_annual_loss(
                asset_valuation=asset_valuation,
                structural_vulnerability_alpha=structural_vulnerability_alpha,
                hazard_probability=hazard_probability
            )

            return {
                "bond_isin": bond.isin,
                "asset_name": bond.asset_name,
                "bond_type": bond.bond_type.value,
                **loss_result
            }
            
        except Exception as e:
            logger.exception("Actuarial loss engine calculation failed for %s", bond_isin)
            return {"error": str(e)}


# ==========================================================
# 6. Risk Engine Orchestration / Hedging Strategy
# ==========================================================

@tool
async def generate_hedging_strategy_tool(bond_isin: str) -> dict:
    """
    Generates an AI-driven hedging strategy for a bond identified by its ISIN.
    """
    async with async_session_maker() as session:
        bond = await get_bond_by_isin(session, bond_isin)
        if not bond:
            return {"error": f"Bond ISIN {bond_isin} not found."}

        try:
            return await risk_engine_service.generate_strategy(
                session=session,
                bond_id=bond.id,
            )

        except Exception as e:
            # logger.exception automatically packs and prints stack traces cleanly
            logger.exception("Hedging engine failed for %s", bond_isin)
            return {"error": str(e)}