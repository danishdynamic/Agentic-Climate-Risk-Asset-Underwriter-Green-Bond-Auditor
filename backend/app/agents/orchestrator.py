from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver
from app.config import settings
from app.agents.tools import (
    analyze_bond_tool,
    get_asset_valuation,
    climate_value_at_risk_tool,
    green_compliance_verification_tool,
    actuarial_expected_loss_tool,
    generate_hedging_strategy_tool
)

# Global in-memory checkpoint saver
agent_memory_bank = InMemorySaver()

def get_financial_risk_agent():
    """
    Compiles a stateful agent using the v1.0+ factory pattern.
    """
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL_ID,
        temperature=0.0,
        google_api_key=settings.GOOGLE_API_KEY.get_secret_value()
    )
    
    tools = [
        analyze_bond_tool,
        get_asset_valuation,
        climate_value_at_risk_tool,
        green_compliance_verification_tool,
        actuarial_expected_loss_tool,
        generate_hedging_strategy_tool
    ]
    
    # 1. Define the system prompt directly as a string. 
    # 2. Note: Modern create_agent infers the agent type from the tools/model.
    system_prompt = (
        "You are an institutional quantitative risk officer specializing in green bonds, climate risk, credit underwriting and portfolio risk. "
        "CRITICAL: Always check your conversation history for 'Compliance Audit Results' before "
        "asking the user for data. If audit results exist in your history, use them immediately "
        "to answer the user's questions about risk mitigation and environmental strategy."
    )

    # 3. Use the simplified factory pattern
    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=system_prompt,
        checkpointer=agent_memory_bank
    )
    
    return agent