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
        }

        avg_hazard = sum([v for k, v in climate_data.items() if "score" in k]) / 4
        #avg_hazard = (
              #  climate_data["flood_score"]
              #  + climate_data["wildfire_score"]
              #  + climate_data["heat_score"]
              #  + climate_data["drought_score"]
           # ) / 4
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

        # 4. Upsert
        await self._upsert_profile(session, ClimateRiskProfile, bond_id, climate_data)
        await self._upsert_profile(
            session, TransitionRiskProfile, bond_id, transition_data
        )
        await self._upsert_profile(session, MarketRiskProfile, bond_id, market_data)
        await self._upsert_profile(session, RiskProfile, bond_id, risk_data)

        return {
            "bond": {
                "isin": bond.isin,
                "asset_name": bond.asset_name,
                "credit_rating": bond.credit_rating,
            },
            "climate": climate_data,
            "transition": transition_data,
            "market": market_data,
            "risk": risk_data,
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
        # Find existing hedge strategy for this bond
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
