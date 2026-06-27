import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routers import assets, audit, agent  

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("risk_backend.main")

@asynccontextmanager
async def app_lifespan(app: FastAPI):
    logger.info("Initializing Climate Risk Application Engine...")
    logger.info(f"Targeting active Gemini LLM deployment: {settings.GEMINI_MODEL_ID}")
    yield
    logger.info("Shutting down Climate Risk Application Engine resources cleanly...")

app = FastAPI(
    title="Climate Risk & Quantitative Hedging Backend",
    version="1.0.0",
    description="Institutional-grade system using Gemini-3.1-Flash-Lite for automated green bond audits and derivative risk balancing.",
    lifespan=app_lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global application exception intercepted: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error_type": "INTERNAL_SERVER_FATAL",
            "message": "An unhandled execution error occurred inside the risk engine orchestration layer."
        }
    )

# --- Active Endpoint Router Mounting Layer ---
app.include_router(assets.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")
app.include_router(agent.router, prefix="/api/v1")

@app.get("/health", tags=["System Health"])
async def system_health_check():
    return {
        "status": "healthy",
        "engine_state": "operational",
        "quota_allowance": "synchronized"
    }