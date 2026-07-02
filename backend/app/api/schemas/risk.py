from pydantic import BaseModel
from typing import Optional

class ClimateRiskResponse(BaseModel):
    bond_id: int
    flood_score: float
    wildfire_score: float
    overall_physical_risk: float
    
    class Config:
        from_attributes = True

class RiskProfileResponse(BaseModel):
    bond_id: int
    probability_of_default: float
    overall_risk_score: float
    
    class Config:
        from_attributes = True