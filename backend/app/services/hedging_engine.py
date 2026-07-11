import logging
from app.models.finance import (
    OptionExerciseStyle, 
    Bond, 
    OptionType,
    MarketRiskProfile,
    ClimateRiskProfile,
    RiskProfile, HedgeOption
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


logger = logging.getLogger("risk_backend.hedging_engine")


class HedgingEngine:
    """Handles portfolio decision and business rules logic for hedging strategies."""

    def recommend_hedge(
        self,
        bond: Bond,
        market: MarketRiskProfile,
        climate: ClimateRiskProfile,
        risk: RiskProfile,
    ) -> dict:
        """Evaluates underwriting criteria to suggest optimal structure matrix, reasons, and confidence."""
        score = 0
        reasons = []

        # High PD?
        if risk.probability_of_default > 0.04:
            score += 3
            reasons.append("High Default Probability")

        # High Climate VaR?
        if risk.climate_var > 100:
            score += 2
            reasons.append("High Climate VaR")

        # High Physical Risk?
        if climate.overall_physical_risk > 0.5:
            score += 2
            reasons.append("High Physical Risk")

        # High Volatility?
        if market.volatility > 0.30:
            score += 1
            reasons.append("High Volatility")

        # Real-world Credit Rating assessment with prefix checking
        rating = str(bond.credit_rating).upper()
        if rating.startswith("CCC"):
            score += 3
            reasons.append("Speculative Grade Below B")
        elif rating.startswith("BB"):
            score += 2
            reasons.append("Non-Investment Grade BB")
        elif rating.startswith("BBB"):
            score += 1
            reasons.append("Investment Grade Below BBB")

        # Determine directional Option Strategy
        if score >= 5:
            option_type = OptionType.PUT
        else:
            option_type = OptionType.CALL

        # Risk-driven early exercise valuation styling
        if (
            risk.probability_of_default > 0.05
            or climate.overall_physical_risk > 0.70
        ):
            style = OptionExerciseStyle.AMERICAN
        else:
            style = OptionExerciseStyle.EUROPEAN

        # Calculate engine confidence score
        confidence = round(min(score / 10.0, 1.0), 2)

        return {
            "option_type": option_type,
            "option_style": style,
            "score": score,
            "reasons": reasons,
            "confidence": round(confidence, 4)
        }
    
    async def upsert_hedge(self, session: AsyncSession, bond_id: int, greeks: dict, recommendation: dict, market: Any, bond: Any) -> HedgeOption:
        """Saves or updates a HedgeOption entry to prevent duplicate rows per bond."""
        stmt = select(HedgeOption).where(HedgeOption.bond_id == bond_id)
        result = await session.execute(stmt)
        hedge = result.scalar_one_or_none()

        if not hedge:
            hedge = HedgeOption(bond_id=bond_id)
            session.add(hedge)

        hedge.recommended = True
        hedge.option_style = recommendation["option_style"]
        hedge.option_type = recommendation["option_type"]
        hedge.strike_price = market.recommended_strike if market.recommended_strike > 0 else market.latest_price * 0.95
        hedge.expiration_date = bond.maturity_date
        hedge.implied_volatility = max(0.05, float(market.volatility))
        hedge.risk_free_rate = max(0.03, float(market.yield_rate))
        hedge.time_to_maturity = max(0.01, float(market.time_to_maturity))
        hedge.delta = greeks["delta"]
        hedge.gamma = greeks["gamma"]
        hedge.vega = greeks["vega"]
        hedge.theta = greeks["theta"]
        hedge.rho = greeks["rho"]

        await session.commit()
        return hedge


hedging_engine = HedgingEngine()