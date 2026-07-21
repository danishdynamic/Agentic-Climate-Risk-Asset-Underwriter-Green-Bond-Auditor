import logging
import json
from typing import Dict, Any
from fastapi import APIRouter, status , HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableConfig
from app.agents.orchestrator import get_financial_risk_agent
from langchain_core.messages import ToolMessage
from app.database import async_session_maker, get_db
from app.models.finance import Bond
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.services.bond_analysis_service import bond_analysis_service
from ...tools.credit_rating import CreditRating
from app.services.risk_engine import risk_engine_service
from app.api.schemas.assets import AssetSummary
from app.agents.tools import (
    analyze_bond_tool,
    climate_value_at_risk_tool,
    green_compliance_verification_tool,
    actuarial_expected_loss_tool,
    generate_hedging_strategy_tool,
    get_asset_valuation,
)




router = APIRouter(prefix="/agent", tags=["Stateful Risk Agent"])
logger = logging.getLogger("risk_backend.agent")

class AgentQueryRequest(BaseModel):
    user_query: str
    thread_id: str

class BondAnalysisRequest(BaseModel):
    bond_isin: str
    credit_rating: str

# --- Helper: Professional Summary Formatter ---
def format_audit_for_stakeholders(audit_data: dict) -> str:
    justification = audit_data.get("verified_audit_justification", "No justification provided.")
    vulnerabilities = audit_data.get("detected_vulnerabilities", [])
    
    formatted_text = f"### Environmental Audit Executive Summary\n\n{justification}\n\n**Identified Risk Factors:**\n"
    for risk in vulnerabilities:
        formatted_text += f"- {risk}\n"
    return formatted_text

# --- Endpoints ---

@router.post("/analyze-bond")
async def analyze_bond(request: BondAnalysisRequest):
    if request.credit_rating and not CreditRating.is_valid(request.credit_rating):
        raise HTTPException(status_code=422, detail="Invalid credit rating.")

    async with async_session_maker() as session:
        result = await session.execute(select(Bond.id).where(Bond.isin == request.bond_isin))
        bond_id = result.scalar_one_or_none()
        if not bond_id:
            raise HTTPException(status_code=404, detail="Bond ISIN not found")

        try:
            analysis = await bond_analysis_service.analyze_bond(session, bond_id, request.credit_rating)
            analysis = jsonable_encoder(analysis)
            await session.commit()
            return {"status": "success", "data": analysis}
            
        except ValueError as e:
            # Business logic errors (e.g., Bond not found)
            await session.rollback() 
            raise HTTPException(status_code=404, detail=str(e))
            
        except IntegrityError:
            # Database constraint violations (e.g., unique ISIN)
            await session.rollback()
            raise HTTPException(status_code=422, detail="Database integrity violation.")
            
        except Exception as e:
            # Catch-all for unexpected failures (AI API timeouts, connection drops)
            await session.rollback()
            # Log the actual error for your internal debugging
            logger.error(f"Unexpected analysis failure: {str(e)}")
            raise HTTPException(status_code=500, detail="An internal processing error occurred.")
        
@router.post("/bonds/{bond_id}/hedge")
async def generate_and_save_hedge(bond_id: int, db: AsyncSession = Depends(get_db)):
    try:
        # 1. Generate the strategy (AI/Math intensive)
        strategy = await risk_engine_service.generate_strategy(db, bond_id)
        
        # 2. Persist the strategy
        await bond_analysis_service.upsert_hedging(db, bond_id, strategy["hedge_option"])
        
        # 3. Commit the transaction
        await db.commit()
        
        return {
            "status": "success",
            "message": "Hedge strategy generated and persisted",
            "strategy": strategy
        }
        
    except Exception as e:
        # Rollback ensures no partial data is committed if upsert fails
        await db.rollback()
        logger.error(f"Failed to generate/save hedge for bond {bond_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process hedging strategy.")
    

@router.get("/assets", status_code=status.HTTP_200_OK)
async def get_assets():
    async with async_session_maker() as session:
        # 1. Fetch full Bond objects instead of just the ISIN
        stmt = select(Bond)
        result = await session.execute(stmt)
        
        # 2. Extract the list of Bond objects from the result
        bonds = result.scalars().all()
        
        # 3. Map bonds to AssetSummary objects
        assets = [
            AssetSummary(
                id=bond.id, 
                isin=bond.isin,
                asset_name=bond.asset_name,
                bond_type=bond.bond_type.value
                    if hasattr(bond.bond_type, "value")
                    else bond.bond_type,
                credit_rating=bond.credit_rating,
                coupon_rate=float(bond.coupon_rate),
            )
            for bond in bonds
        ]
        
        return {
            "assets": assets
        }

@router.get("/tools")
async def list_agent_tools():
    """
    Returns the list of available tools to the frontend
    so it knows what the agent is capable of.
    """
    return [
        {"name": "climate_var", "description": "Calculates climate-adjusted VaR"},
        {"name": "valuation_table", "description": "Retrieves historical bond valuation data"}
    ]


@router.post("/execute-tool", status_code=status.HTTP_200_OK)
async def execute_tool(payload: dict) -> Dict[str, Any]:
    """
    Unified Dispatcher Endpoint.
    
    Accepts a single consistent public interface from the frontend, 
    matching any feature block to its respective LangChain tool via 'bond_isin'.
    
    Architecture: Frontend ➔ Router ➔ LangChain Tool ➔ Service Layer ➔ DB
    """
    tool_name = payload.get("tool_name")
    params = payload.get("params", {})
    bond_isin = params.get("bond_isin")
    
    # 1. Enforce rigorous payload data contract validation
    if not tool_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing parameter: 'tool_name' is required."
        )
        
    if not bond_isin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing parameter: 'bond_isin' is required inside 'params'."
        )

    # 2. Expanded Mapping: Every tool follows the exact same pattern: tool.ainvoke({"bond_isin": bond_isin})
    tool_mapping = {
        "analyze_bond": analyze_bond_tool,
        "climate_var": climate_value_at_risk_tool,
        "green_compliance": green_compliance_verification_tool,
        "expected_loss": actuarial_expected_loss_tool,
        "hedging": generate_hedging_strategy_tool,
        "valuation_table": get_asset_valuation,
    }

    tool = tool_mapping.get(tool_name)
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Tool '{tool_name}' is not recognized by the dispatcher."
        )

    try:
        logger.info(f"Dispatching frontend request to tool '{tool_name}' for ISIN: {bond_isin}")
        
        # 3. Safe, uniform invocation across all services
        result = await tool.ainvoke({"bond_isin": bond_isin})
        return result
        
    except Exception as e:
        # Automatically tracks, parses, and logs the full error traceback safely
        logger.exception("Dispatcher execution failed for tool '%s' on ISIN %s", tool_name, bond_isin)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Internal tool execution error: {str(e)}"
        )
        

@router.post("/query-stream", status_code=status.HTTP_200_OK)
async def query_risk_agent_stream(payload: AgentQueryRequest):
    
    async def event_stream():
        agent = get_financial_risk_agent()
        execution_config = RunnableConfig(configurable={"thread_id": payload.thread_id})
        
        try:
            async for event in agent.astream_events(
                {"messages": [HumanMessage(content=payload.user_query)]},
                config=execution_config,
                version="v2"
            ):
                event_type = event["event"]
                tool_name = event.get("name")

                # 1. Cleanly trap Tool Interception Initations
                if event_type == "on_tool_start":
                   # logger.info(type(event["data"]))
                   # logger.info(repr(event["data"]))

                    yield json.dumps(jsonable_encoder({
                        "type": "tool_start", 
                        "tool": tool_name,
                        "input": event["data"].get("input") 
                    })) + "\n"
                
            
                elif event_type == "on_chat_model_stream":
                    chunk = event["data"].get("chunk")

                    if chunk and hasattr(chunk, "content"):
                        for block in chunk.content:
                            if (
                                isinstance(block, dict)
                                and block.get("type") == "text"
                                and block.get("text")
                            ):
                                yield json.dumps({
                                    "type": "text",
                                    "content": block["text"]
                                }) + "\n"
                
                # 3. Handle Tool Completion and map outputs to React components
                elif event_type == "on_tool_end":
                    #logger.info(type(event["data"]))
                    #logger.info(repr(event["data"]))

                    tool_output = event["data"].get("output")

                    # Added diagnostic logs for tool output right before JSON serialization blocks for debugging
                    # logger.info(type(tool_output))
                    # logger.info(repr(tool_output))

                    if isinstance(tool_output, ToolMessage):
                        content = tool_output.content

                        if isinstance(content, str):
                            try:
                                tool_output = json.loads(content)
                            except json.JSONDecodeError:
                                tool_output = content
                        else:
                            # Already structured (list/dict)
                            tool_output =  jsonable_encoder(content)

                    if tool_name == "climate_value_at_risk_tool":
                        yield json.dumps({
                            "type": "tool_result",
                            "tool": "climate_var",
                            "data": tool_output
                        }) + "\n"

                    elif tool_name == "green_compliance_verification_tool":
                        yield json.dumps({
                            "type": "tool_result",
                            "tool": "compliance",
                            "data": tool_output
                        }) + "\n"

                    elif tool_name == "actuarial_expected_loss_tool":
                        yield json.dumps({
                            "type": "tool_result",
                            "tool": "expected_loss",
                            "data": tool_output
                        }) + "\n"

                    elif tool_name == "get_asset_valuation":
                        yield json.dumps({
                            "type": "tool_result",
                            "tool": "valuation_table",
                            "data": tool_output
                        }) + "\n"
                    
        
                    elif tool_name == "analyze_bond_tool":
                        yield json.dumps({
                            "type": "tool_result",
                            "tool": "analyze_bond",
                            "data": tool_output
                        }) + "\n"

                    elif tool_name == "generate_hedging_strategy_tool":
                        yield json.dumps({
                            "type": "tool_result",
                            "tool": "hedging_strategy",
                            "data": tool_output
                        }) + "\n"

        except json.JSONDecodeError as e:
            logger.error(f"Streaming error: {str(e)}")
            yield json.dumps({"type": "error", "content": str(e)}) + "\n"


    return StreamingResponse(event_stream(), media_type="application/x-ndjson")

@router.post("/inject-context")
async def inject_agent_context(payload: Dict[str, Any]):
    thread_id = payload.get("thread_id")
    context = payload.get("context")

    if not thread_id or not context:
        return {
            "status": "error",
            "message": "Missing thread_id or context",
        }

    clean_summary = format_audit_for_stakeholders(context)

    try:
        agent = get_financial_risk_agent()

        config = RunnableConfig(
            configurable={"thread_id": thread_id}
        )

        await agent.ainvoke(
            {
                "messages": [
                    HumanMessage(
                        content=(
                            "Compliance Audit Results:\n\n"
                            f"{clean_summary}\n\n"
                            "Please retain these audit findings and use them "
                            "when answering future risk, compliance, ESG, "
                            "environmental strategy, or mitigation questions."
                        )
                    )
                ]
            },
            config=config,
        )

        return {
            "status": "success",
            "message": "Context injected successfully",
        }

    except Exception as e:
        logger.error(
            f"Injection failed: {str(e)}",
            exc_info=True,
        )

        return {
            "status": "error",
            "message": f"Injection failed: {str(e)}",
        }