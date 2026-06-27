from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware, HumanInTheLoopMiddleware
from langgraph.checkpoint.memory import InMemorySaver

from app.config import settings
from app.agents.tools import (
    climate_value_at_risk_tool,
    green_compliance_verification_tool,
    actuarial_expected_loss_tool
)

# Global in-memory checkpoint saver to maintain threads across API requests
agent_memory_bank = InMemorySaver()

def get_financial_risk_agent():
    """
    Compiles a stateful LangChain agent packed with automated memory 
    management and human-in-the-loop safety rails.
    """
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL_ID,
        temperature=0.0,
        google_api_key=settings.GOOGLE_API_KEY.get_secret_value()
    )
    
    tools = [
        climate_value_at_risk_tool,
        green_compliance_verification_tool,
        actuarial_expected_loss_tool
    ]
    
    # Define our behavioral middleware hooks
    middleware_pipeline = [
        # 1. Automatically compresses long conversation strings when token limits near
        SummarizationMiddleware(model=llm),
        
        # 2. Automatically pauses the agent if it attempts to execute a heavy pricing calculation
        HumanInTheLoopMiddleware(
            interrupt_on={"actuarial_expected_loss_tool": True}
        )
    ]
    
    # Compile the complete harness
    agent = create_agent(
        model=llm,
        tools=tools,
        middleware=middleware_pipeline,
        checkpointer=agent_memory_bank, # Links our conversational persistence engine
        system_prompt=(
            "You are an expert institutional quantitative risk officer and green finance auditor. "
            "Evaluate assets using your available tools and provide explicit risk summaries."
        )
    )
    
    return agent