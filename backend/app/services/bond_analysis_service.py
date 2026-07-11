from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from ..models.finance import (
    Bond,
    ClimateRiskProfile,
    TransitionRiskProfile,
    MarketRiskProfile,
    RiskProfile,
    HedgeOption,
)
# Core Domain Service Delegations
from app.services.risk_engine import risk_engine_service
from app.services.compliance_service import compliance_service


class BondAnalysisService:
    async def analyze_bond(
        self, session: AsyncSession, bond_id: int, credit_rating: str
    ) -> Dict[str, Any]:
        # 1. Fetch Bond with eager relationships loaded
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

        # 2. Validate/Update Rating Staging
        if credit_rating:
            bond.credit_rating = credit_rating

        # 3. Extract Milestones and Build Contextual Dicts
        milestones = bond.metadata_json.get("milestones", []) if bond.metadata_json else []
        
        climate_data = {
            "flood_score": bond.climate_profile.flood_score if bond.climate_profile else 0.0,
            "wildfire_score": bond.climate_profile.wildfire_score if bond.climate_profile else 0.1,
            "heat_score": bond.climate_profile.heat_score if bond.climate_profile else 0.5,
            "drought_score": bond.climate_profile.drought_score if bond.climate_profile else 0.3,
            "overall_physical_risk": bond.climate_profile.overall_physical_risk if bond.climate_profile else 0.27,
            "physical_risk_level": bond.climate_profile.physical_risk_level if bond.climate_profile else "LOW",
        }

        transition_data = {
            "carbon_intensity": bond.transition_profile.carbon_intensity if bond.transition_profile else 0.0,
            "industry": bond.transition_profile.industry if bond.transition_profile else "",
            "sector": bond.transition_profile.sector if bond.transition_profile else "",
            "country": bond.transition_profile.country if bond.transition_profile else "",
            "eu_taxonomy_eligible": bond.transition_profile.eu_taxonomy_eligible if bond.transition_profile else False,
            "transition_risk_score": bond.transition_profile.transition_risk_score if bond.transition_profile else 0.0,
        }
        
        market_data = {
            "duration": bond.market_profile.duration if bond.market_profile else 5.0,
            "yield_rate": bond.market_profile.yield_rate if bond.market_profile else 0.03,
            "spread": bond.market_profile.spread if bond.market_profile else 0.01,
            "volatility": bond.market_profile.volatility if bond.market_profile else 0.2,
            "liquidity_score": bond.market_profile.liquidity_score if bond.market_profile else 0.75,
            "latest_price": bond.market_profile.latest_price if bond.market_profile else bond.face_value,
            "recommended_strike": bond.market_profile.recommended_strike if bond.market_profile else bond.face_value * 0.95,
            "time_to_maturity": bond.market_profile.time_to_maturity if bond.market_profile else 5.0,
        }

        # 4. Analytics & Compliance Execution via Unified Engines
        # Passing relation child tables directly down to match risk_engine signature demands
        risk_metrics = await risk_engine_service.compute_risk_metrics(
            bond=bond,
            market=bond.market_profile,
            climate=bond.climate_profile,
            risk=bond.risk_profile,
        )
        
        # Compliance evaluation pipeline delegation
        compliance = await compliance_service.evaluate(
            bond=bond,
            milestones=milestones,
        )
        
        risk_data = {
            "probability_of_default": risk_metrics.get("probability_default", 0.01),
            "loss_given_default": risk_metrics.get("lgd", 0.40),
            "climate_var": risk_metrics.get("climate_var", 0.0),
            "expected_annual_loss": risk_metrics.get("expected_loss", 0.0),
            "overall_risk_score": risk_metrics.get("overall_score", 0.0),
            "investment_grade": bond.risk_profile.investment_grade if bond.risk_profile else True,
            "green_bond_compliant": compliance.get("compliant", False) if isinstance(compliance, dict) else False,
        }
        
        # 5. Profile Sync Execution (State remains staged within active Session transaction)
        await self._upsert_profile(session, ClimateRiskProfile, bond_id, climate_data)
        await self._upsert_profile(session, TransitionRiskProfile, bond_id, transition_data)
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
                    
    async def _upsert_profile(self, session: AsyncSession, model_class: Any, bond_id: int, data: dict) -> None:
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
    ) -> None:
        """Generic upsert abstraction targeting downstream options strategies persistence."""
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