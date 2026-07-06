from typing import List
from pydantic import BaseModel, Field

class OptimizationResult(BaseModel):
    """
    Data validation contract for the ResponseOptimizer output payload.
    Enforces strict structural boundaries when communicating with Gemini.
    """
    optimized_response: str = Field(
        ..., 
        description="The polished financial response, maximizing clarity, removing typos, and smoothing transitions while strictly adhering to the raw source context."
    )
    optimization_applied: bool = Field(
        default=True,
        description="Indicates whether text processing and polishing was successfully executed by the model engine."
    )
    refinements_made: List[str] = Field(
        default=[], 
        description="A list of specific stylistic, structural, or clarity improvements applied to the raw response."
    )