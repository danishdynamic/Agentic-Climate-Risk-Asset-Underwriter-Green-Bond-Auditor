import json
import logging
from typing import Dict, Any
from google import genai
from google.genai import types
from app.config import settings

logger = logging.getLogger("risk_backend.evaluator")

class RAGEvaluator:
    def __init__(self):
        self.ai_client = genai.Client(api_key=settings.GOOGLE_API_KEY.get_secret_value())
        self.eval_model = "gemini-3.1-flash-lite"  # Use a larger reasoning model for scoring tasks

    async def grade_rag_alignment(
        self, context: str, query: str, generation: str
    ) -> Dict[str, Any]:
        """
        Grades the output of the RAG pipeline on a scale from 1 to 5.
        """
        prompt = f"""
        You are an expert AI quality assurance judge. Rate the performance of a financial 
        RAG system based on the following criteria:

        [Raw Source Context Provided]:
        {context}

        [User Inquiry Request]:
        {query}

        [Generated Output Response Under Review]:
        {generation}

        ASSIGNMENT:
        Evaluate and provide two scores from 1 to 5 (where 5 is perfect):
        1. Faithfulness: Is the output completely supported by the context, without introducing outside information or hallucinations?
        2. Relevance: Does the output directly answer the user's specific inquiry?

        Output your evaluation in this exact JSON format:
        {{
            "faithfulness_score": 5,
            "relevance_score": 5,
            "justification": "Detailed summary explanation of your scoring choices"
        }}
        """
        try:
            response = self.ai_client.models.generate_content(
                model=self.eval_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.0
                )
            )
            return json.loads(response.text or "{}")
        except Exception as e:
            logger.error(f"RAG alignment evaluation failed: {str(e)}")
            return {"faithfulness_score": 1, "relevance_score": 1, "justification": f"Error running evaluation: {str(e)}"}

rag_evaluator = RAGEvaluator()