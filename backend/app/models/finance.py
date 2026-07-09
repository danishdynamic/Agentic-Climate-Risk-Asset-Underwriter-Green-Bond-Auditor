from datetime import datetime
from enum import Enum as PyEnum
from typing import List, Optional
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Boolean, text, func
from sqlalchemy.dialects.postgresql import ENUM as PGEnum, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

class Base(DeclarativeBase):
    pass

# --- Enums ---
class BondAssetType(str, PyEnum):
    CORPORATE = "CORPORATE"
    FINANCIAL = "FINANCIAL"
    SOVEREIGN = "SOVEREIGN"

class OptionExerciseStyle(str, PyEnum):
    AMERICAN = "AMERICAN"
    EUROPEAN = "EUROPEAN"


# --- Master Table ---
class Bond(Base):
    __tablename__ = "bonds"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    isin: Mapped[str] = mapped_column(String(12), unique=True, nullable=False)
    asset_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bond_type: Mapped[BondAssetType] = mapped_column(PGEnum(BondAssetType, name="bond_asset_type"), nullable=False)
    credit_rating: Mapped[str] = mapped_column(String(10), nullable=False)
    face_value: Mapped[float] = mapped_column(Numeric(16, 4), nullable=False)
    coupon_rate: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    maturity_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    # Relationships
    climate_profile: Mapped[Optional["ClimateRiskProfile"]] = relationship(back_populates="bond")
    transition_profile: Mapped[Optional["TransitionRiskProfile"]] = relationship(back_populates="bond")
    market_profile: Mapped[Optional["MarketRiskProfile"]] = relationship(back_populates="bond")
    risk_profile: Mapped[Optional["RiskProfile"]] = relationship(back_populates="bond")
    hedge_options: Mapped[List["HedgeOption"]] = relationship(back_populates="bond")

    valuations: Mapped[List["AssetValuation"]] = relationship(
        back_populates="bond", 
        cascade="all, delete-orphan"
    )
    asset_chunks: Mapped[List["AssetDocumentChunk"]] = relationship(
        back_populates="bond", 
        cascade="all, delete-orphan"
    )

# --- Normalized Risk Profiles ---

class ClimateRiskProfile(Base):
    __tablename__ = "climate_risk_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    bond_id: Mapped[int] = mapped_column(ForeignKey("bonds.id", ondelete="CASCADE"), unique=True)
    flood_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    wildfire_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    heat_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    drought_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    overall_physical_risk: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    physical_risk_level: Mapped[str] = mapped_column(String(20)) # LOW, MEDIUM, HIGH, SEVERE
    updated_at: Mapped[datetime] = mapped_column(server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))
    bond: Mapped["Bond"] = relationship(back_populates="climate_profile")

class TransitionRiskProfile(Base):
    __tablename__ = "transition_risk_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    bond_id: Mapped[int] = mapped_column(ForeignKey("bonds.id", ondelete="CASCADE"), unique=True)
    carbon_intensity: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    industry: Mapped[str] = mapped_column(String(100))
    sector: Mapped[str] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100))
    eu_taxonomy_eligible: Mapped[bool] = mapped_column(Boolean, default=False)
    transition_risk_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    updated_at: Mapped[datetime] = mapped_column(server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))
    bond: Mapped["Bond"] = relationship(back_populates="transition_profile")

class MarketRiskProfile(Base):
    __tablename__ = "market_risk_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    bond_id: Mapped[int] = mapped_column(
        ForeignKey("bonds.id", ondelete="CASCADE"),
        unique=True
    )

    duration: Mapped[float] = mapped_column(Numeric(8, 4), default=0)
    yield_rate: Mapped[float] = mapped_column(Numeric(8, 4), default=0)
    spread: Mapped[float] = mapped_column(Numeric(8, 4), default=0)
    volatility: Mapped[float] = mapped_column(Numeric(8, 4), default=0)
    liquidity_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)

    latest_price: Mapped[float] = mapped_column(Numeric(16, 4), default=0)
    recommended_strike: Mapped[float] = mapped_column(Numeric(16, 4), default=0)
    time_to_maturity: Mapped[float] = mapped_column(Numeric(8, 4), default=0)

    updated_at: Mapped[datetime] = mapped_column(
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP")
    )

    bond: Mapped["Bond"] = relationship(back_populates="market_profile")

class RiskProfile(Base):
    __tablename__ = "risk_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    bond_id: Mapped[int] = mapped_column(ForeignKey("bonds.id", ondelete="CASCADE"), unique=True)
    probability_of_default: Mapped[float] = mapped_column(Numeric(6, 4))
    loss_given_default: Mapped[float] = mapped_column(Numeric(6, 4))
    climate_var: Mapped[float] = mapped_column(Numeric(16, 4), default=0)
    expected_annual_loss: Mapped[float] = mapped_column(Numeric(16, 4), default=0)
    overall_risk_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    investment_grade: Mapped[bool] = mapped_column(Boolean)
    green_bond_compliant: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))
    bond: Mapped["Bond"] = relationship(back_populates="risk_profile")

# --- Hedging ---
class HedgeOption(Base):
    __tablename__ = "hedge_options"
    id: Mapped[int] = mapped_column(primary_key=True)
    bond_id: Mapped[int] = mapped_column(ForeignKey("bonds.id", ondelete="CASCADE"))
    recommended: Mapped[bool] = mapped_column(Boolean, default=False)
    option_style: Mapped[OptionExerciseStyle] = mapped_column(PGEnum(OptionExerciseStyle, name="option_exercise_style"))
    strike_price: Mapped[float] = mapped_column(Numeric(16, 4))
    expiration_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    implied_volatility: Mapped[float] = mapped_column(Numeric(9, 6), default=0)
    risk_free_rate: Mapped[float] = mapped_column(Numeric(9, 6), default=0)
    time_to_maturity: Mapped[float] = mapped_column(Numeric(9, 6), default=0)
    bond: Mapped["Bond"] = relationship(back_populates="hedge_options")
    delta = mapped_column(Numeric(9, 6), default=0)
    gamma = mapped_column(Numeric(9, 6), default=0)
    vega = mapped_column(Numeric(9, 6), default=0)
    theta = mapped_column(Numeric(9, 6), default=0)
    rho = mapped_column(Numeric(9, 6), default=0)

class AssetValuation(Base):
    __tablename__ = "asset_valuations"
    id: Mapped[int] = mapped_column(primary_key=True)
    bond_id: Mapped[int] = mapped_column(ForeignKey("bonds.id", ondelete="CASCADE"))
    valuation_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    valuation: Mapped[float] = mapped_column(Numeric(16, 4))
    bond: Mapped["Bond"] = relationship(back_populates="valuations")

class AssetDocumentChunk(Base):
    __tablename__ = "asset_chunks"
    id: Mapped[int] = mapped_column(primary_key=True)
    bond_id: Mapped[int] = mapped_column(ForeignKey("bonds.id", ondelete="CASCADE"))
    chunk_content: Mapped[str] = mapped_column()
    embedding: Mapped["Vector"] = mapped_column(Vector(768), nullable=False)
    chunk_metadata: Mapped[dict] = mapped_column("metadata", type_=JSONB, server_default=text("'{}'::jsonb"))
    bond: Mapped["Bond"] = relationship(back_populates="asset_chunks")