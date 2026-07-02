from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.models.finance import BondAssetType
from app.tools.credit_rating import CreditRating
from datetime import datetime

class AssetCreate(BaseModel):
    isin: str = Field(..., min_length=12, max_length=12)
    asset_name: str = Field(..., max_length=255)
    bond_type: BondAssetType
    credit_rating: CreditRating
    coupon_rate: float = Field(..., ge=0, le=1.0)
    face_value: float = Field(..., gt=0)
    maturity_date: datetime
    full_climate_history: str
    metadata_json: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AssetResponse(BaseModel):
    id: int
    isin: str
    asset_name: str
    bond_type: BondAssetType
    credit_rating: CreditRating
    
    class Config:
        from_attributes = True