import logging
from google import genai
from google.genai import types
from app.config import settings
from app.api.schemas.optimizer import OptimizationResult

logger = logging.getLogger("risk_backend.optimizer")

class ResponseOptimizer:
    def __init__(self):
        self.ai_client = genai.Client(api_key=settings.GOOGLE_API_KEY.get_secret_value())
        # Low-latency operational model choice optimized for structural compliance tasks
        self.opt_model = "gemini-2.5-flash"  

    async def optimize(
        self,
        query: str,
        context: str,
        response: str
    ) -> OptimizationResult:
        """
        Refines generated RAG text using structural system rules, 
        low-variability processing controls, and strict structured schemas.
        """
        
        # Core prompt structured with instruction sets at the apex to maximize attention weight
        prompt = f"""
        ROLE & SYSTEM RULES:
        You are a senior institutional financial editor. Your ONLY responsibility is improving readability, 
        grammatical precision, syntax flow, and formatting of the [Generated Response Under Review].

        CRITICAL CONSTRAINTS:
        - NEVER: invent outside information, infer missing financial values, estimate numerical figures, 
          change risk recommendations, modify numeric risk scores, or alter regulatory compliance findings.
        - Only improve formatting, wording, clarity, and readability.
        - Every observation in your text MUST be strictly traceable to the provided [Retrieved Context].
        - Return ONLY valid JSON matching the provided response schema definition.
        - Do NOT include markdown blocks (e.g. do not wrap in ```json).
        - Do NOT include conversational text, pleasantries, or outside explanations.

        ----------------------------------
        USER INQUIRY QUERY:
        {query}

        ----------------------------------
        RETRIEVED CONTEXT:
        {context}

        ----------------------------------
        GENERATED RESPONSE UNDER REVIEW:
        {response}
        """

        try:
            # response_payload variable name maintained to avoid shadowing the 'response' input parameter
            response_payload = self.ai_client.models.generate_content(
                model=self.opt_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=OptimizationResult,
                    temperature=0.1  # Highly conservative temperature setting to completely suppress creative drift
                )
            )

            if response_payload.text:
                validated_result = OptimizationResult.model_validate_json(response_payload.text)
                logger.info("Response optimization pipeline completed successfully.")
                return validated_result
            
            raise ValueError("Optimization model generated an empty response payload string.")

        except Exception as e:
            # Logs full stack internally for security forensics without exposing system code paths to user interfaces
            logger.exception("Response optimizer execution cycle failed.")
            
            # Safe analytical fallback schema execution block
            return OptimizationResult(
                optimized_response=response,
                optimization_applied=False,
                refinements_made=["Optimization skipped."]
            )

# Instantiate the service singleton for global application consumption
response_optimizer = ResponseOptimizer()