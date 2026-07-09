import re
from datetime import datetime
from enum import Enum  # Fix 1: Added missing Enum import
from typing_extensions import Self
from pydantic import BaseModel, Field, field_validator, model_validator
from app.models.finance import BondAssetType
from app.tools.credit_rating import CreditRating

class BondUnderwritingCreate(BaseModel):
    isin: str = Field(..., description="12-character alphanumeric ISIN")
    asset_name: str = Field(..., max_length=255)
    bond_type: BondAssetType
    credit_rating: CreditRating  
    face_value: float = Field(..., gt=0)
    coupon_rate: float = Field(..., ge=0, le=1.0, description="Fraction, e.g., 0.055 for 5.5%")
    maturity_date: datetime
    full_climate_history: str
    metadata: dict = Field(default_factory=dict)

    # Fix 2: Relocated validators to the correct model
    @field_validator("isin")
    @classmethod
    def validate_isin_format(cls, value: str) -> str:
        # Standard ISIN regex: 2 letters, 9 alphanumeric, 1 digit
        if not re.match(r"^[A-Z]{2}[A-Z0-9]{9}[0-9]$", value.strip().upper()):
            raise ValueError("Invalid ISIN pattern formatting.")
        return value.strip().upper()

    @model_validator(mode="after")
    def enforce_speculative_hurdle_rate(self) -> Self:
        """
        Cross-field safety rule:
        If the asset is NOT investment grade, reject if coupon is below 6.00% (0.06).
        """
        if not self.credit_rating.is_investment_grade:
            if self.coupon_rate < 0.06:
                raise ValueError(
                    f"Risk Hurdle Failure: Speculative asset rating ({self.credit_rating.value}) "
                    f"requires a coupon yield premium of at least 6.00%. "
                    f"Received: {self.coupon_rate * 100:.2f}%."
                )
        return self

class ComplianceStatus(str, Enum):
    COMPLIANT = "compliant"
    REVIEW = "review"
    NON_COMPLIANT = "non-compliant"

class UnderwritingResponse(BaseModel):
    riskScore: float
    complianceStatus: ComplianceStatus
    findings: list[str]
    optimizationNotes: list[str]