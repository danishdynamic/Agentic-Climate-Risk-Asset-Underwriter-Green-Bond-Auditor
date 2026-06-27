from datetime import datetime
from enum import Enum as PyEnum
from typing import List, Optional
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Boolean, Enum, Float, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

class Base(DeclarativeBase):
    """Base class for all database models."""
    pass

class BondAssetType(str, PyEnum):
    CORPORATE = "CORPORATE"
    FINANCIAL = "FINANCIAL"
    SOVEREIGN = "SOVEREIGN"

class OptionExerciseStyle(str, PyEnum):
    AMERICAN = "AMERICAN"
    EUROPEAN = "EUROPEAN"

class CreditRating(str, PyEnum):
    """
    Standard international credit risk scaling brackets.
    Inherits from str to enforce plain-text formatting in JSON responses.
    """
    AAA = "AAA"
    AA_PLUS = "AA+"
    AA = "AA"
    AA_MINUS = "AA-"
    A_PLUS = "A+"
    A = "A"
    A_MINUS = "A-"
    BBB_PLUS = "BBB+"
    BBB = "BBB"
    BBB_MINUS = "BBB-"
    BB_PLUS = "BB+"
    BB = "BB"
    BB_MINUS = "BB-"
    B_PLUS = "B+"
    B = "B"
    B_MINUS = "B-"
    CCC = "CCC"
    CC = "CC"
    C = "C"
    D = "D"


class Bond(Base):
    __tablename__ = "bonds"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    isin: Mapped[str] = mapped_column(String(12), unique=True, nullable=False)
    asset_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bond_type: Mapped[BondAssetType] = mapped_column(nullable=False)
    credit_rating: Mapped[str] = mapped_column(String(10), nullable=False)
    face_value: Mapped[float] = mapped_column(Numeric(16, 4), nullable=False)
    coupon_rate: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    maturity_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    full_climate_history: Mapped[str] = mapped_column(nullable=False)
    metadata_json: Mapped[dict] = mapped_column("metadata", type_=JSONB, server_default=text("'{}'::jsonb"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    # Relationships
    risk_profile: Mapped[Optional["RiskProfile"]] = relationship(back_populates="bond", uselist=False)
    hedge_options: Mapped[List["HedgeOption"]] = relationship(back_populates="bond")

class BondAsset(Base):
    __tablename__ = "bond_assets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    isin: Mapped[str] = mapped_column(String(12), unique=True, index=True, nullable=False)
    asset_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Map to native database Enum types backed by our Python class definitions
    bond_type: Mapped[BondAssetType] = mapped_column(
        Enum(BondAssetType, name="bond_asset_type_enum"), nullable=False
    )
    credit_rating: Mapped[CreditRating] = mapped_column(
        Enum(CreditRating, name="credit_rating_enum"), nullable=False
    )
    
    coupon_rate: Mapped[float] = mapped_column(Float, nullable=False)

    # Relationships linked to downstream evaluation tracking tables
    text_chunks = relationship("AssetDocumentChunk", back_populates="asset", cascade="all, delete-orphan")
    hedging_options = relationship("DerivativeHedge", back_populates="underlying_asset", cascade="all, delete-orphan")


class RiskProfile(Base):
    __tablename__ = "risk_profiles"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    bond_id: Mapped[int] = mapped_column(ForeignKey("bonds.id", ondelete="CASCADE"), unique=True)
    probability_of_default: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    loss_given_default: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    is_investment_grade: Mapped[bool] = mapped_column(Boolean, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    # Relationship back to parent
    bond: Mapped["Bond"] = relationship(back_populates="risk_profile")


class HedgeOption(Base):
    __tablename__ = "hedge_options"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    bond_id: Mapped[int] = mapped_column(ForeignKey("bonds.id", ondelete="CASCADE"))
    option_style: Mapped[OptionExerciseStyle] = mapped_column(nullable=False)
    strike_price: Mapped[float] = mapped_column(Numeric(16, 4), nullable=False)
    expiration_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Greeks for risk management tracking
    delta: Mapped[float] = mapped_column(Numeric(9, 6), default=0.000000)
    gamma: Mapped[float] = mapped_column(Numeric(9, 6), default=0.000000)
    vega: Mapped[float] = mapped_column(Numeric(9, 6), default=0.000000)
    theta: Mapped[float] = mapped_column(Numeric(9, 6), default=0.000000)
    rho: Mapped[float] = mapped_column(Numeric(9, 6), default=0.000000)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

    # Relationship back to parent
    bond: Mapped["Bond"] = relationship(back_populates="hedge_options")

class DerivativeHedge(Base):
    __tablename__ = "derivative_hedges"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    bond_id: Mapped[int] = mapped_column(ForeignKey("bond_assets.id", ondelete="CASCADE"), nullable=False)
    
    strike_price: Mapped[float] = mapped_column(Float, nullable=False)
    implied_volatility: Mapped[float] = mapped_column(Float, nullable=False)
    time_to_maturity: Mapped[float] = mapped_column(Float, nullable=False)
    
    exercise_style: Mapped[OptionExerciseStyle] = mapped_column(
        Enum(OptionExerciseStyle, name="option_exercise_style_enum"), 
        default=OptionExerciseStyle.EUROPEAN, 
        nullable=False
    )

    underlying_asset = relationship("BondAsset", back_populates="hedging_options")