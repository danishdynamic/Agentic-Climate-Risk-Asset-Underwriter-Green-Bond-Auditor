import re
from datetime import datetime
from typing import Optional
from typing_extensions import Self
from pydantic import BaseModel, Field, field_validator, model_validator
from app.models.finance import BondAssetType

# Standard credit rating matrix ordered from highest quality to non-investment grade/speculative
VALID_RATINGS = ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+", "BB", "BB-", "B+", "B", "B-", "CCC", "CC", "C", "D"]
INVESTMENT_GRADE_RATINGS = ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-"]

class BondUnderwritingCreate(BaseModel):
    isin: str = Field(..., description="12-character alphanumeric International Securities Identification Number")
    asset_name: str = Field(..., max_length=255)
    bond_type: BondAssetType
    credit_rating: str
    face_value: float = Field(..., gt=0)
    coupon_rate: float = Field(..., ge=0, le=1.0, description="Expressed as a float fraction, e.g., 0.0550 for 5.5%")
    maturity_date: datetime
    full_climate_history: str
    metadata_json: dict = Field(default_factory=dict)

    @field_validator("isin")
    @classmethod
    def validate_isin_format(cls, value: str) -> str:
        """Enforces uniform uppercase 12-char pattern check via native regex."""
        clean_val = value.strip().upper()
        pattern = re.compile(r"^[A-Z]{2}[A-Z0-9]{9}[0-9]$")
        if not pattern.match(clean_val):
            raise ValueError("Invalid ISIN pattern formatting.")
        return clean_val

    @field_validator("credit_rating")
    @classmethod
    def validate_rating_tier(cls, value: str) -> str:
        """Ensures corporate or sovereign scale strictly fits standardized rating matrices."""
        clean_val = value.strip().upper()
        if clean_val not in VALID_RATINGS:
            raise ValueError(f"Credit rating must be a valid tier within scale: {VALID_RATINGS}")
        return clean_val

    @model_validator(mode="after")
    def enforce_speculative_hurdle_rate(self) -> Self:
        """
        Cross-field safety rule:
        If an incoming asset is non-investment grade (BB+ down to D),
        instantly reject it if the coupon rate falls below a mandatory 6.00% (0.0600) risk-premium barrier.
        """
        rating = self.credit_rating
        coupon = self.coupon_rate
        
        if rating not in INVESTMENT_GRADE_RATINGS:
            if coupon < 0.0600:
                raise ValueError(
                    f"Risk Hurdle Failure: Speculative asset rating ({rating}) requires a coupon "
                    f"yield premium of at least 6.00% (0.0600). Received: {coupon * 100:.2f}%."
                )
        return self