import math
import json
import logging
from typing import Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy import select
from google import genai
from google.genai import types

from app.config import settings
from app.services.quota_manager import quota_manager
from app.models.finance import (
    OptionExerciseStyle, 
    Bond
)
from app.services.metrics import track_execution_latency
from app.services.hedging_engine import hedging_engine
from app.tools.risk import calculate_climate_var
from app.tools.actuarial import calculate_expected_annual_loss
from app.tools.compliance import verify_green_bond_compliance

logger = logging.getLogger("risk_backend.risk_engine")


def standard_normal_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def standard_normal_pdf(x: float) -> float:
    return math.exp(-0.5 * x**2) / math.sqrt(2.0 * math.pi)


class ActuarialRiskEngine:
    """The Quantitative Pricing Engine handles mathematical models and data orchestration."""
    
    def __init__(self):
        self.ai_client = genai.Client(
            api_key=settings.GOOGLE_API_KEY.get_secret_value()
        )
        self.generation_model = settings.GEMINI_MODEL_ID

    @track_execution_latency("Risk_Metrics_Computation")
    async def compute_risk_metrics(self, bond: Bond, market: Any, climate: Any, risk: Any) -> Dict[str, Any]:
        """Consolidates and computes comprehensive quantitative risk, environmental, and compliance metrics."""
        # --- 1. Quantitative Modeling Preparation ---
        nominal_exposure = float(bond.face_value)
        base_volatility = float(market.volatility) if market else 0.2
        hazard_score = float(climate.overall_physical_risk) if climate else 0.27
        
        # Calculate climate Value at Risk (VaR)
        c_var_dict = calculate_climate_var(
            nominal_exposure=nominal_exposure,
            base_volatility=base_volatility,
            hazard_score=hazard_score,
        )
        
        # Calculate Actuarial Expected Annual Loss
        asset_value = float(bond.face_value)
        hazard_probability = float(climate.overall_physical_risk / 100) if climate else float(0.27 / 100)
        severity = float(risk.loss_given_default) if risk else 0.40
        
        expected_loss_dict = calculate_expected_annual_loss(
            asset_valuation=asset_value,
            structural_vulnerability_alpha=severity,
            hazard_probability=hazard_probability,
        )
        
        # Safely extract numerical primitives from the tool dicts
        raw_c_var = c_var_dict["computed_climate_var_usd"]
        raw_expected_loss = expected_loss_dict["expected_annual_loss_usd"]

        # Calculate derived overall blended risk score matrix
        prob_default = float(risk.probability_of_default) if risk else 0.01
        blended_value = float((prob_default * 0.6) + (hazard_score * 0.4))
        overall_score = round(blended_value, 4)

        # --- 2. Green Bond Compliance Tool Call ---
        # Safe extraction of variables matching the tool's expected types
        bond_type_str = str(bond.bond_type) if bond.bond_type else "CORPORATE"
        coupon_rate_val = float(bond.coupon_rate) if bond.coupon_rate else 0.0
        credit_rating_str = str(bond.credit_rating) if bond.credit_rating else "BBB"
        documented_milestones = bond.metadata_json.get("milestones", []) if bond.metadata_json else []

        compliance_results = verify_green_bond_compliance(
            bond_type=bond_type_str,
            coupon_rate=coupon_rate_val,
            documented_milestones=documented_milestones,
            credit_rating=credit_rating_str
        )

        return {
            "climate_var": round(float(raw_c_var), 2),
            "expected_loss": round(float(raw_expected_loss), 2),
            "overall_score": overall_score,
            "probability_default": prob_default,
            "lgd": severity,
            "compliance": compliance_results
        }

    @track_execution_latency("Greeks_Calculation")
    def calculate_option_greeks(
        self,
        S: float,
        K: float,
        T: float,
        r: float,
        sigma: float,
        exercise_style: OptionExerciseStyle,
        option_type: str = "put",
    ) -> Dict[str, float]:
        """Orchestration router for Greek calculations."""
        if exercise_style == OptionExerciseStyle.EUROPEAN:
            return self._calculate_black_scholes(S, K, T, r, sigma, option_type)
        elif exercise_style == OptionExerciseStyle.AMERICAN:
            return self._calculate_american_binomial_fallback(
                S, K, T, r, sigma, option_type
            )
        else:
            raise ValueError(f"Unsupported exercise style: {exercise_style}")

    def _calculate_black_scholes(
        self, S: float, K: float, T: float, r: float, sigma: float, option_type: str
    ) -> Dict[str, float]:
        """Analytical Black-Scholes implementation."""
        if T <= 0:
            return {"delta": 0.0, "gamma": 0.0, "vega": 0.0, "theta": 0.0, "rho": 0.0}

        d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
        d2 = d1 - sigma * math.sqrt(T)
        pdf_d1, cdf_d1, cdf_d2 = (
            standard_normal_pdf(d1),
            standard_normal_cdf(d1),
            standard_normal_cdf(d2),
        )

        if option_type.lower() == "call":
            delta, theta, rho = (
                cdf_d1,
                (-S * pdf_d1 * sigma) / (2.0 * math.sqrt(T))
                - r * K * math.exp(-r * T) * cdf_d2,
                K * T * math.exp(-r * T) * cdf_d2,
            )
        else:
            delta, theta, rho = (
                cdf_d1 - 1.0,
                (-S * pdf_d1 * sigma) / (2.0 * math.sqrt(T))
                + r * K * math.exp(-r * T) * standard_normal_cdf(-d2),
                -K * T * math.exp(-r * T) * standard_normal_cdf(-d2),
            )

        return {
            "delta": round(delta, 6),
            "gamma": round(pdf_d1 / (S * sigma * math.sqrt(T)), 6),
            "vega": round(S * math.sqrt(T) * pdf_d1, 6),
            "theta": round(theta / 365.0, 6),
            "rho": round(rho / 100.0, 6),
        }

    def _calculate_american_binomial_fallback(
        self, S: float, K: float, T: float, r: float, sigma: float, option_type: str
    ) -> Dict[str, float]:
        """Baseline approximation for American options."""
        greeks = self._calculate_black_scholes(S, K, T, r, sigma, option_type)
        greeks["delta"] = round(greeks["delta"] * 1.05, 6)
        return greeks

    @track_execution_latency("AI_Mitigation_Synthesis")
    async def generate_mitigation_strategy(
        self,
        isin: str,
        credit_rating: str,
        hazard_score: float,
        financial_exposure: float,
        greeks: Dict[str, float],
        recommendation: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Synthesizes hedging playbooks using strictly provided numerical inputs and rules decisions."""
        prompt = f"""
        You are an elite risk management officer. Synthesize a hedging playbook explaining the quantitative choice.
        - You are NOT allowed to modify the supplied Greeks or recommendations. Use them exactly as provided.
        - Only recommend: Hedge ratio, CDS overlay, Duration adjustment, Sector diversification, Climate mitigation, Rebalancing frequency.
        - Do not estimate numerical Greeks yourself.
        
        Asset Profile:
        - ISIN: {isin}, Rating: {credit_rating}
        - Physical Hazard Score: {hazard_score}, Net Exposure: ${financial_exposure:,.2f}
        - Greeks: {greeks}
        
        Quantitative Engine Recommendations:
        - Strategy Type Chosen: {recommendation["option_type"].value} Option
        - Exercise Style Assigned: {recommendation["option_style"].value}
        - System Engine Confidence Level: {recommendation["confidence"] * 100:.1f}%
        - Structural Triggers Identified: {", ".join(recommendation["reasons"]) if recommendation["reasons"] else "None (Baseline)"}
        
        Return a strict JSON object:
        {{
           "risk_assessment_summary": "A cohesive executive explanation leveraging the supplied engine updates, reasons, and type choices without inventing new quantitative metrics...", 
           "hedging_actionable_directives": ["..."], 
           "recommended_credit_default_swap_bps_buffer": 0.0
        }}
        """

        await quota_manager.acquire_quota(estimated_tokens=len(prompt) // 4)
        try:
            response = self.ai_client.models.generate_content(
                model=self.generation_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json", temperature=0.2
                ),
            )
            return json.loads(response.text or "{}")
        except Exception as e:
            logger.error(f"AI hedging synthesis layer failed: {str(e)}")
            return {
                "risk_assessment_summary": "Generation error during playbook construction.",
                "hedging_actionable_directives": ["Maintain current hedge"],
                "recommended_credit_default_swap_bps_buffer": 0.0,
            }

    @track_execution_latency("Strategy_Generation")
    async def generate_strategy(
        self, session: AsyncSession, bond_id: int
    ) -> Dict[str, Any]:
        """Orchestrates data collection, scoring evaluation, and DB serialization pipeline."""
        stmt = (
            select(Bond)
            .options(
                joinedload(Bond.market_profile),
                joinedload(Bond.climate_profile),
                joinedload(Bond.risk_profile),
            )
            .where(Bond.id == bond_id)
        )

        result = await session.execute(stmt)
        bond = result.scalar_one_or_none()

        if not bond:
            raise ValueError(f"Bond ID {bond_id} not found.")

        if not bond.market_profile:
            raise ValueError(f"Market profile for bond {bond_id} is missing")

        if not bond.risk_profile:
            raise ValueError(f"Risk profile for bond {bond_id} is missing")

        market = bond.market_profile
        climate = bond.climate_profile
        risk = bond.risk_profile

        if not market or not climate or not risk:
            raise ValueError(
                f"Bond {bond_id} has missing required profiles (Market/Climate/Risk)."
            )

        # 1. Compute foundational quantitative risk metrics
        computed_risk = await self.compute_risk_metrics(
            bond=bond,
            market=market,
            climate=climate,
            risk=risk
        )

        S = float(market.latest_price)
        K = (market.recommended_strike if market.recommended_strike > 0
             else market.latest_price * 0.95 )
        T = max(0.01, float(market.time_to_maturity))
        sigma = max(0.05, float(market.volatility))
        r = max(0.03, float(market.yield_rate))

        # 2. Extract structured business rule recommendations
        recommendation = hedging_engine.recommend_hedge(
            bond=bond,
            market=market,
            climate=climate,
            risk=risk,
        )

        # 3. Calculate mathematical option sensitivities
        greeks = self.calculate_option_greeks(
            S=S,
            K=K,
            T=T,
            r=r,
            sigma=sigma,
            exercise_style=recommendation["option_style"],
            option_type=recommendation["option_type"].value.lower(),
        )

        # 4. Synthesize AI playbook insights
        playbook = await self.generate_mitigation_strategy(
            isin=bond.isin,
            credit_rating=str(bond.credit_rating),
            hazard_score=float(climate.overall_physical_risk),
            financial_exposure=(
                float(bond.face_value) * (1 - float(risk.probability_of_default))
            ),
            greeks=greeks,
            recommendation=recommendation
        )

        
        await hedging_engine.upsert_hedge(
        session=session, bond_id=bond.id, greeks=greeks, 
        recommendation=recommendation, market=market, bond=bond)

        return {
            "computed_risk_metrics": computed_risk,
            "hedge_option": {
                "recommended": True,
                "option_style": recommendation["option_style"].value,
                "option_type": recommendation["option_type"].value,
                "model_name": self.generation_model,
                "recommended_at": datetime.now().isoformat(),
                "confidence": recommendation["confidence"],
                "reasons": recommendation["reasons"],
                **greeks,
            },
            "playbook": playbook,
        }


risk_engine_service = ActuarialRiskEngine()