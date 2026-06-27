import time
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig 
from app.agents.orchestrator import get_financial_risk_agent
from app.api.routers.metrics import track_execution_latency, extract_agent_token_usage

router = APIRouter(prefix="/agent", tags=["Stateful Risk Agent"])

class AgentQueryRequest(BaseModel):
    user_query: str
    thread_id: str

@router.post("/query", status_code=status.HTTP_200_OK)
@track_execution_latency("Stateful Risk Agent Endpoint Loop")
async def query_risk_agent(payload: AgentQueryRequest):
    try:
        agent = get_financial_risk_agent()
        
        # Fix 3: Construct the dictionary using the typed schema class
        execution_config = RunnableConfig(
            configurable={"thread_id": payload.thread_id}
        )

        # 2. Record the high-precision timestamp immediately before invoking the agent
        start_time = time.perf_counter()
        
        response = await agent.ainvoke(
            {"messages": [HumanMessage(content=payload.user_query)]},
            config=execution_config
        )

        # 3. Calculate exact latency for the roundtrip run
        duration = time.perf_counter() - start_time
        
        # 4. Safely pull token metadata footprints out of the final graph state
        usage_stats = extract_agent_token_usage(response, elapsed_time=duration)
        
        # 5. Log metrics (or pass usage_stats to your internal application database)
        print(f"[Telemetry] Thread {payload.thread_id} spent {usage_stats.total_tokens} total tokens.")
        
        if "interrupt" in response:
            return {
                "status": "requires_human_approval",
                "thread_id": payload.thread_id,
                "interrupt_details": response["interrupt"],
                "message": "The agent was paused before executing a high-impact actuarial calculation."
            }
        
        final_output_message = response["messages"][-1].content
        
        return {
            "status": "completed",
            "thread_id": payload.thread_id,
            "output": final_output_message
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stateful agent execution error: {str(e)}"
        )