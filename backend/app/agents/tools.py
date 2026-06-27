from typing import List
from langchain_core.tools import tool

# Import the core math logic we wrote previously
from app.tools.risk import calculate_climate_var
from app.tools.compliance import verify_green_bond_compliance
from app.tools.actuarial import calculate_expected_annual_loss

@tool
def climate_value_at_risk_tool(nominal_exposure: float, base_volatility: float, hazard_score: float) -> dict:
    """
    Calculates the Climate-Adjusted Value at Risk (VaR) for a financial asset.
    Use this tool when you need to calculate potential portfolio losses under severe climate shocks.
    """
    return calculate_climate_var(
        nominal_exposure=nominal_exposure,
        base_volatility=base_volatility,
        hazard_score=hazard_score
    )

@tool
def green_compliance_verification_tool(bond_type: str, coupon_rate: float, documented_milestones: List[str]) -> dict:
    """
    Validates whether an asset complies with international Green Bond Principles and the EU Taxonomy.
    Use this tool when evaluating compliance milestones or ESG frameworks.
    """
    return verify_green_bond_compliance(
        bond_type=bond_type,
        coupon_rate=coupon_rate,
        documented_milestones=documented_milestones
    )

@tool
def actuarial_expected_loss_tool(asset_valuation: float, structural_vulnerability_alpha: float, hazard_probability: float) -> dict:
    """
    Computes the Climate-Adjusted Expected Annual Loss (EAL) for risk pricing.
    Use this tool when calculating insurance thresholds or credit default swap (CDS) premium buffers.
    """
    return calculate_expected_annual_loss(
        asset_valuation=asset_valuation,
        structural_vulnerability_alpha=structural_vulnerability_alpha,
        hazard_probability=hazard_probability
    )