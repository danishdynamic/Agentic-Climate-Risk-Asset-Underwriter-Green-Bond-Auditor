from pydantic import BaseModel, Field
from app.models.finance import OptionExerciseStyle

class DerivativeHedgeCreate(BaseModel):
    bond_id: int
    strike_price: float = Field(..., gt=0)
    implied_volatility: float = Field(..., ge=0)
    time_to_maturity: float = Field(..., ge=0)
    exercise_style: OptionExerciseStyle = OptionExerciseStyle.EUROPEAN

class DerivativeHedgeResponse(BaseModel):
    id: int
    bond_id: int
    strike_price: float
    implied_volatility: float
    exercise_style: OptionExerciseStyle
    
    class Config:
        from_attributes = True