from typing import List

from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from app.database import async_session_maker
from app.models.finance import Bond, AssetValuation
from app.services.risk_engine import risk_engine_service
from app.tools.risk import calculate_climate_var
from app.tools.compliance import verify_green_bond_compliance
from app.tools.actuarial import calculate_expected_annual_loss
from app.services.bond_analysis_service import bond_analysis_service


@tool
async def analyze_bond_tool(bond_id: str) -> dict:
    """
    Perform a complete institutional bond risk assessment.

    Given a bond ID, this tool automatically:
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
        # 1. Fetch bond and verify existence
        stmt = select(Bond).where(Bond.id == bond_id)
        result = await session.execute(stmt)
        bond = result.scalar_one_or_none()
        
        if not bond:
            return {"error": f"Bond ID {bond_id} not found."}

        # 2. Pass session and internal DB rating to the service
        # This solves the 'argument missing' Pylance issues
        return await bond_analysis_service.analyze_bond(
            session=session,
            bond_id=bond.id,
            credit_rating=bond.credit_rating 
        )

# ==========================================================
# Climate Value at Risk
# ==========================================================

@tool
async def climate_value_at_risk_tool(bond_isin: str) -> dict:
    """
    Calculates Climate-Adjusted Value at Risk for the selected bond
    using live profile data from the database.
    """
    async with async_session_maker() as session:
        # Use joinedload to fetch the related profiles in a single query
        stmt = (
            select(Bond)
            .options(
                joinedload(Bond.market_profile),
                joinedload(Bond.climate_profile)
            )
            .where(Bond.isin == bond_isin)
        )
        
        result = await session.execute(stmt)
        bond = result.scalar_one_or_none()

        if bond is None:
            return {
                "status": "error",
                "message": f"Bond '{bond_isin}' not found."
            }

        # Ensure we have the necessary profiles to perform the calculation
        if not bond.market_profile or not bond.climate_profile:
            return {
                "status": "error",
                "message": f"Risk profiles incomplete for bond '{bond_isin}'."
            }

        # Map the calculation to the actual model data
        nominal_exposure = float(bond.face_value)
        base_volatility = float(bond.market_profile.volatility)
        
        # Scaling the normalized physical risk score to match the calculation logic
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
# Green Compliance
# ==========================================================

@tool
async def green_compliance_verification_tool(
    bond_id: str,
    coupon_rate: float,
    documented_milestones: List[str],
) -> dict:
    
    """
    Verifies if a bond meets green compliance standards based on bond type, 
    coupon rate, and specific project milestones.
    """

    async with async_session_maker() as session:
        stmt = select(Bond).where(Bond.id == bond_id)
        result = await session.execute(stmt)
        bond = result.scalar_one_or_none()

        if bond is None:
            return {
                "status": "error",
                "message": f"Bond '{bond_id}' not found."
            }

        return verify_green_bond_compliance(
            bond_type=bond.bond_type.value,
            coupon_rate=coupon_rate,
            documented_milestones=documented_milestones,
            credit_rating=bond.credit_rating
        )


# ==========================================================
# Expected Annual Loss
# ==========================================================

@tool
async def actuarial_expected_loss_tool(
    asset_valuation: float,
    structural_vulnerability_alpha: float,
    hazard_probability: float,
) -> dict:
    
    """
    Calculates the expected annual loss for an asset given its valuation, 
    vulnerability alpha, and the probability of a hazard occurring.
    """

    return calculate_expected_annual_loss(
        asset_valuation=asset_valuation,
        structural_vulnerability_alpha=structural_vulnerability_alpha,
        hazard_probability=hazard_probability,
    )


# ==========================================================
# Historical Valuation
# ==========================================================

@tool
async def get_asset_valuation(bond_isin: str) -> List[dict]:
    """
    Returns historical valuation data for the selected bond.
    """
    async with async_session_maker() as session:
        # 1. Fetch the specific bond first
        bond = (
            await session.execute(
                select(Bond).where(Bond.isin == bond_isin)
            )
        ).scalar_one_or_none()

        if bond is None:
            return [{"error": f"Bond '{bond_isin}' not found"}]

        # 2. Query valuations using the bond's primary key
        valuation_stmt = (
            select(AssetValuation)
            .where(AssetValuation.bond_id == bond.id)
            .order_by(AssetValuation.valuation_date)
        )

        rows = (await session.execute(valuation_stmt)).scalars().all()

        # 3. Format the result
        return [
            {
                "Date": row.valuation_date.strftime("%Y-%m-%d"),
                "Valuation": float(row.valuation),
            }
            for row in rows
        ]

# ==========================================================
# Risk Engine Orchestration Tool
# ==========================================================

@tool
async def generate_hedging_strategy_tool(bond_id: int) -> dict:
    """
    Orchestrates the retrieval of bond risk profiles, calculates option Greeks,
    and synthesizes an AI-driven hedging playbook for a specific bond.
    
    Args:
        bond_id: The primary key ID of the bond in the database.
        
    Returns:
        A dictionary containing the calculated Greeks and the AI-generated strategy.
    """
    async with async_session_maker() as session:
        try:
            # We call the service method directly within the session context
            result = await risk_engine_service.generate_strategy(session, bond_id)
            return result
        except ValueError as e:
            # Catch expected business logic errors (missing profiles, etc.)
            return {"status": "error", "message": str(e)}
        except Exception as e:
            # Catch unexpected errors
            return {"status": "error", "message": "An internal error occurred during strategy generation."}