from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.finance import (
    Bond,
    ClimateRiskProfile,
    TransitionRiskProfile,
    MarketRiskProfile,
    RiskProfile,
    HedgeOption,
)
from app.tools.actuarial import calculate_expected_annual_loss
from app.tools.compliance import verify_green_bond_compliance
from app.tools.risk import calculate_climate_var
from sqlalchemy.orm import joinedload


class BondAnalysisService:
    async def analyze_bond(
        self, session: AsyncSession, bond_id: int, credit_rating: str
    ):
        # 1. Fetch Bond
        result = await session.execute(
            select(Bond)
            .options(
                joinedload(Bond.climate_profile),
                joinedload(Bond.transition_profile),
                joinedload(Bond.market_profile),
                joinedload(Bond.risk_profile),
            )
            .where(Bond.id == bond_id)
        )
        bond = result.scalar_one_or_none()
        if not bond:
            raise ValueError("Bond not found")

        # 2. Validate/Update Rating
        rating = bond.credit_rating

        if credit_rating:
            rating = credit_rating
            bond.credit_rating = credit_rating

        # 3. Analytics Execution
        milestones = bond.metadata_json.get("milestones", [])
        climate_data = {
            "flood_score": 0.2,
            "wildfire_score": 0.1,
            "heat_score": 0.5,
            "drought_score": 0.3,
            "overall_physical_risk": 0.27,
            "physical_risk_level": "LOW",
        }
        transition_data = {
            "carbon_intensity": 120.5,
            "industry": "Energy",
            "sector": "Renewables",
            "country": "DE",
            "eu_taxonomy_eligible": True,
            "transition_risk_score": 0.4,
        }
        
        
        market_data = {
            "duration": 5.2,
            "yield_rate": 0.045,
            "spread": 0.012,
            "volatility": 0.15,
            "liquidity_score": 0.8,

            
            "latest_price": float(bond.face_value),
            "recommended_strike": float(bond.face_value) * 0.95,
            "time_to_maturity": (
                bond.maturity_date
                - datetime.utcnow().replace(tzinfo=bond.maturity_date.tzinfo)
            ).days / 365.25,
        }

        avg_hazard = sum([v for k, v in climate_data.items() if "score" in k]) / 4

        climate_var = calculate_climate_var(
            float(bond.face_value), 0.05, avg_hazard * 20
        )
        expected_loss = calculate_expected_annual_loss(
            float(bond.face_value), 0.15, avg_hazard / 100
        )
        compliance = verify_green_bond_compliance(
            str(bond.bond_type),
            float(bond.coupon_rate),
            milestones,
            credit_rating=rating,
        )

        overall_risk_score = (
            climate_data["overall_physical_risk"] * 30
            + transition_data["transition_risk_score"] * 20
            + market_data["volatility"] * 20
            + (0.01 * 30)
        )
        risk_data = {
            "probability_of_default": 0.01,
            "loss_given_default": 0.4,
            "climate_var": climate_var["computed_climate_var_usd"],
            "expected_annual_loss": expected_loss["expected_annual_loss_usd"],
            "overall_risk_score": round(overall_risk_score, 2),
            "investment_grade": True,
            "green_bond_compliant": (
                compliance["framework_alignment_status"] == "COMPLIANT"
            ),
        }

        # 4. Upsert Profiles (Data staged in the session, no commits here)
        await self._upsert_profile(session, ClimateRiskProfile, bond_id, climate_data)
        await self._upsert_profile(
            session, TransitionRiskProfile, bond_id, transition_data
        )
        await self._upsert_profile(session, MarketRiskProfile, bond_id, market_data)
        await self._upsert_profile(session, RiskProfile, bond_id, risk_data)

        recommendation = (
            "buy"
            if risk_data["overall_risk_score"] >= 70
            else "hold"
        )

        return {
            "creditRating": bond.credit_rating,

            "riskMetrics": {
                "climateVar": risk_data["climate_var"],
                "expectedLoss": risk_data["expected_annual_loss"],
                "probabilityOfDefault": risk_data["probability_of_default"],
                "lossGivenDefault": risk_data["loss_given_default"],
                "overallScore": risk_data["overall_risk_score"],
            },

            "recommendation": recommendation,

            "climateMetrics": {
                "floodScore": climate_data["flood_score"],
                "wildfireScore": climate_data["wildfire_score"],
                "heatScore": climate_data["heat_score"],
                "droughtScore": climate_data["drought_score"],
                "overallPhysicalRisk": climate_data["overall_physical_risk"],
                "physicalRiskLevel": climate_data["physical_risk_level"],
            },

            "transitionMetrics": {
                "carbonIntensity": transition_data["carbon_intensity"],
                "industry": transition_data["industry"],
                "sector": transition_data["sector"],
                "country": transition_data["country"],
                "euTaxonomyEligible": transition_data["eu_taxonomy_eligible"],
                "transitionRiskScore": transition_data["transition_risk_score"],
            },

            "marketMetrics": {
                "duration": market_data["duration"],
                "yieldRate": market_data["yield_rate"],
                "spread": market_data["spread"],
                "volatility": market_data["volatility"],
                "liquidityScore": market_data["liquidity_score"],
            },

            "compliance": compliance,
        }
                    
    async def _upsert_profile(self, session, model_class, bond_id, data):
        result = await session.execute(
            select(model_class).where(model_class.bond_id == bond_id)
        )
        profile = result.scalar_one_or_none()
        if profile:
            for key, value in data.items():
                setattr(profile, key, value)
        else:
            session.add(model_class(bond_id=bond_id, **data))

    async def upsert_hedging(
        self, session: AsyncSession, bond_id: int, hedge_data: dict
    ):
        """
        Generic upsert for HedgeOption.
        """
        result = await session.execute(
            select(HedgeOption).where(HedgeOption.bond_id == bond_id)
        )
        hedge = result.scalar_one_or_none()

        if hedge:
            for key, value in hedge_data.items():
                setattr(hedge, key, value)
        else:
            session.add(HedgeOption(bond_id=bond_id, **hedge_data))


bond_analysis_service = BondAnalysisService()