from pydantic import BaseModel

class AssetSummary(BaseModel):
    id: int
    isin: str
    asset_name: str
    bond_type: str
    credit_rating: str
    coupon_rate: float

    class Config:
        from_attributes = True