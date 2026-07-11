from typing import Dict, Any

def calculate_expected_annual_loss(
    asset_valuation: float, 
    structural_vulnerability_alpha: float, 
    hazard_probability: float
) -> Dict[str, Any]:
    """
    Computes Expected Annual Loss (EAL) using an actuarial damage function 
    adjusted for climate-driven loss severities.
    """
    # Force float constraints
    val = float(asset_valuation)                   
    alpha = float(structural_vulnerability_alpha)  
    prob = float(hazard_probability)               
    
    # Actuarial damage function curve calculation
    implied_severity = min(max(alpha * 1.15, 0.0), 1.0)
    expected_annual_loss = val * implied_severity * prob
    
    return {
        "computed_loss_severity_coefficient": round(implied_severity, 4),
        "annualized_hazard_probability": round(prob, 4),
        "expected_annual_loss_usd": round(expected_annual_loss, 2)
    }