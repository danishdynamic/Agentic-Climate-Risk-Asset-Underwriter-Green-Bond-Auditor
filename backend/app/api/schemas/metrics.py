
from pydantic import BaseModel, Field
from datetime import date

class RAGEvaluationMetrics(BaseModel):
    """Tracks precision and grounding benchmarks across RAG pipeline cycles."""
    faithfulness_score: float = Field(..., ge=0.0, le=1.0)
    context_relevance_score: float = Field(..., ge=0.0, le=1.0)
    answer_relevance_score: float = Field(..., ge=0.0, le=1.0)