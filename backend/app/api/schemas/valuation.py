from pydantic import BaseModel, Field
from datetime import date

class ValuationResponse(BaseModel):
    id: int
    bond_id: int
    valuation_date: date
    valuation: float = Field(..., gt=0)

    class Config:
        from_attributes = True