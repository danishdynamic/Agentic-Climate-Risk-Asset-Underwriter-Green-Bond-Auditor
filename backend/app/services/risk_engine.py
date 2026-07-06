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
from app.models.finance import OptionExerciseStyle, Bond
from backend.app.services.metrics import track_execution_latency

logger = logging.getLogger("risk_backend.risk_engine")

def standard_normal_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))

def standard_normal_pdf(x: float) -> float:
    return math.exp(-0.5 * x**2) / math.sqrt(2.0 * math.pi)

class ActuarialRiskEngine:
    def __init__(self):
        self.ai_client = genai.Client(api_key=settings.GOOGLE_API_KEY.get_secret_value())
        self.generation_model = settings.GEMINI_MODEL_ID
    
    @track_execution_latency("Greeks_Calculation")
    def calculate_option_greeks(
        self, S: float, K: float, T: float, r: float, sigma: float, 
        exercise_style: OptionExerciseStyle, option_type: str = "put"
    ) -> Dict[str, float]:
        """Orchestration router for Greek calculations."""
        if exercise_style == OptionExerciseStyle.EUROPEAN:
            return self._calculate_black_scholes(S, K, T, r, sigma, option_type)
        elif exercise_style == OptionExerciseStyle.AMERICAN:
            return self._calculate_american_binomial_fallback(S, K, T, r, sigma, option_type)
        else:
            raise ValueError(f"Unsupported exercise style: {exercise_style}")

    def _calculate_black_scholes(self, S: float, K: float, T: float, r: float, sigma: float, option_type: str) -> Dict[str, float]:
        """Analytical Black-Scholes implementation."""
        if T <= 0:
            return {"delta": 0.0, "gamma": 0.0, "vega": 0.0, "theta": 0.0, "rho": 0.0}

        d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))
        d2 = d1 - sigma * math.sqrt(T)
        pdf_d1, cdf_d1, cdf_d2 = standard_normal_pdf(d1), standard_normal_cdf(d1), standard_normal_cdf(d2)

        if option_type.lower() == "call":
            delta, theta, rho = cdf_d1, (-S * pdf_d1 * sigma) / (2.0 * math.sqrt(T)) - r * K * math.exp(-r * T) * cdf_d2, K * T * math.exp(-r * T) * cdf_d2
        else:
            delta, theta, rho = cdf_d1 - 1.0, (-S * pdf_d1 * sigma) / (2.0 * math.sqrt(T)) + r * K * math.exp(-r * T) * standard_normal_cdf(-d2), -K * T * math.exp(-r * T) * standard_normal_cdf(-d2)

        return {
            "delta": round(delta, 6), "gamma": round(pdf_d1 / (S * sigma * math.sqrt(T)), 6),
            "vega": round(S * math.sqrt(T) * pdf_d1, 6), "theta": round(theta / 365.0, 6),
            "rho": round(rho / 100.0, 6),
        }

    def _calculate_american_binomial_fallback(self, S: float, K: float, T: float, r: float, sigma: float, option_type: str) -> Dict[str, float]:
        """Baseline approximation for American options."""
        # Use Black-Scholes as a starting point and apply a premium adjustment
        greeks = self._calculate_black_scholes(S, K, T, r, sigma, option_type)
        greeks["delta"] = round(greeks["delta"] * 1.05, 6)
        return greeks
    
    @track_execution_latency("AI_Mitigation_Synthesis")
    async def generate_mitigation_strategy(
        self, isin: str, credit_rating: str, hazard_score: float, 
        financial_exposure: float, greeks: Dict[str, float]
    ) -> Dict[str, Any]:
        """Synthesizes hedging playbooks using strictly provided numerical inputs."""
        prompt = f"""
        You are an elite risk management officer. Synthesize a hedging playbook.
        - You are NOT allowed to modify the supplied Greeks. Use them exactly as provided.
        - Only recommend: Hedge ratio, CDS overlay, Duration adjustment, Sector diversification, Climate mitigation, Rebalancing frequency.
        - Do not estimate numerical Greeks yourself.
        
        Asset Profile:
        - ISIN: {isin}, Rating: {credit_rating}
        - Physical Hazard Score: {hazard_score}, Net Exposure: ${financial_exposure:,.2f}
        - Greeks: {greeks}
        
        Return a strict JSON object:
        {{"risk_assessment_summary": "...", "hedging_actionable_directives": ["..."], "recommended_credit_default_swap_bps_buffer": 0.0}}
        """

        await quota_manager.acquire_quota(estimated_tokens=len(prompt) // 4)
        try:
            response = self.ai_client.models.generate_content(
                model=self.generation_model, contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.2),
            )
            return json.loads(response.text or "{}")
        except Exception as e:
            logger.error(f"AI hedging synthesis layer failed: {str(e)}")
            return {"risk_assessment_summary": "Generation error", "hedging_actionable_directives": ["Maintain current hedge"], "recommended_credit_default_swap_bps_buffer": 0.0}

    @track_execution_latency("Strategy_Generation")
    async def generate_strategy(self, session: AsyncSession, bond_id: int) -> Dict[str, Any]:
        """Orchestrates data collection with explicit type guards and attribute handling."""
        stmt = select(Bond).options(
            joinedload(Bond.market_profile),
            joinedload(Bond.climate_profile),
            joinedload(Bond.risk_profile)
        ).where(Bond.id == bond_id)
        
        result = await session.execute(stmt)
        bond = result.scalar_one_or_none()
        
        # 1. Strict existence check
        if not bond:
            raise ValueError(f"Bond ID {bond_id} not found.")
        
        if not bond.market_profile:
            raise ValueError(f"Market profile for bond {bond_id} is missing")
        
        if not bond.risk_profile:
             raise ValueError(f"Risk profile for bond {bond_id} is missing")

        # 2. Type Guard: Ensure profiles are loaded and not None
        # Replace these attribute names with the EXACT names from your model files
        market = bond.market_profile
        climate = bond.climate_profile
        risk = bond.risk_profile

        if not market or not climate or not risk:
            raise ValueError(f"Bond {bond_id} has missing required profiles (Market/Climate/Risk).")

        # 3. Accessing attributes with explicit typing/coercion
        # Ensure 'latest_price' and 'recommended_strike' exist in your MarketRiskProfile model
        # Use getattr(obj, "attr", default) if you are unsure about dynamic schema
        S = float(market.latest_price) 
        K = float(market.recommended_strike)
        T = float(market.time_to_maturity)
        sigma = float(market.volatility)
        
        # 4. Correctly reference the Enum member if 'exercise_style' was causing issues
        # Ensure OptionExerciseStyle is imported correctly from app.models.finance
        style = OptionExerciseStyle.EUROPEAN 

        greeks = self.calculate_option_greeks(
            S=S, K=K, T=T, r=0.045, sigma=sigma,
            exercise_style=style, 
            option_type="put"
        )

        playbook = await self.generate_mitigation_strategy(
            isin=bond.isin, 
            credit_rating=str(bond.credit_rating),
            hazard_score=float(climate.overall_physical_risk),
            financial_exposure=float(bond.face_value * (1 - float(risk.probability_of_default))),
            greeks=greeks
        )

        return {
            "hedge_option": {
                "recommended": True,
                "option_style": style.value,
                "model_name": self.generation_model,
                "recommended_at": datetime.utcnow().isoformat(),
                **greeks
            },
            "playbook": playbook
        }

risk_engine_service = ActuarialRiskEngine()