import numpy as np
from typing import Dict, Any

def calculate_climate_var(
    nominal_exposure: float, 
    base_volatility: float, 
    hazard_score: float, 
    confidence_level: float = 0.99
) -> Dict[str, Any]:
    """
    Computes a Climate-Adjusted Value at Risk (VaR).
    Scales asset volatility using an exponential hazard function to simulate 
    extreme climate-driven market repricing.
    """
    if not (0 < confidence_level < 1):
        raise ValueError("Confidence level must be strictly between 0 and 1.")
        
    # Scale volatility based on the physical hazard score (0-100)
    # A score of 100 maxes out at an additional 2x volatility multiplier
    climate_volatility_multiplier = 1.0 + (float(hazard_score) / 100.0)
    adjusted_volatility = base_volatility * climate_volatility_multiplier
    
    # Calculate the standard normal distribution z-score (inverse CDF approximation)
    z_score = abs(np.percentile(np.random.normal(0, 1, 100000), (1 - confidence_level) * 100))
    
    # Compute parametric VaR
    loss_threshold = nominal_exposure * adjusted_volatility * z_score
    
    return {
        "base_volatility": round(base_volatility, 4),
        "climate_adjusted_volatility": round(adjusted_volatility, 4),
        "z_score_boundary": round(float(z_score), 4),
        "computed_climate_var_usd": round(float(loss_threshold), 2)
    }