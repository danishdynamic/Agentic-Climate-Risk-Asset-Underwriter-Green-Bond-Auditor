import inspect
import time
import functools
from typing import Any, Callable, Dict, Optional, TypeVar
from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage
import logging

F = TypeVar("F", bound=Callable[..., Any])
logger = logging.getLogger("risk_backend.metrics")

class LLMUsageMetrics(BaseModel):
    """Container for tracking token spend and LLM performance."""
    input_tokens: int = Field(default=0, description="Total prompt/input tokens consumed")
    output_tokens: int = Field(default=0, description="Total completion/output tokens generated")
    total_tokens: int = Field(default=0, description="Aggregated token footprint")
    execution_latency_sec: float = Field(default=0.0, description="Time taken for the API roundtrip")


def track_execution_latency(metric_name: str) -> Callable[[F], F]:
    """
    Decorator to benchmark the performance of heavy financial execution blocks
    (e.g., Black-Scholes calculations, vector space comparisons).
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            start_time = time.perf_counter()
            try:
                return func(*args, **kwargs)
            finally:
                elapsed = time.perf_counter() - start_time
                logger.info("%s completed in %.4fs", metric_name, elapsed)
                
        @functools.wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            start_time = time.perf_counter()
            try:
                return await func(*args, **kwargs)
            finally:
                elapsed = time.perf_counter() - start_time
                print(f"[Telemetry] {metric_name} (Async) completed in {elapsed:.4f}s")

        return async_wrapper if inspect.iscoroutinefunction(func) else sync_wrapper  # type: ignore
    return decorator

def extract_agent_token_usage(response_state: Dict[str, Any], elapsed_time: float = 0.0) -> LLMUsageMetrics:
    """
    Parses structural metadata out of a LangChain/LangGraph response state 
    to track token metrics reliably without crashing on missing attributes.
    """
    messages = response_state.get("messages", [])
    if not messages:
        return LLMUsageMetrics(execution_latency_sec=elapsed_time)
    
    last_message = messages[-1]
    
    # Check for modern LangChain v1 response usage metadata structures
    if isinstance(last_message, BaseMessage) and hasattr(last_message, "response_metadata"):
        metadata = last_message.response_metadata
        token_usage = metadata.get("token_usage", {}) or metadata.get("usage", {})
        
        if token_usage:
            return LLMUsageMetrics(
                input_tokens=token_usage.get("prompt_tokens", 0) or token_usage.get("input_tokens", 0),
                output_tokens=token_usage.get("completion_tokens", 0) or token_usage.get("output_tokens", 0),
                total_tokens=token_usage.get("total_tokens", 0),
                execution_latency_sec=elapsed_time
            )
            
    return LLMUsageMetrics(execution_latency_sec=elapsed_time)