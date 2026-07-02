import asyncio
import sys
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.database import async_session_maker, engine
from app.models.finance import BondAsset, BondAssetType, CreditRating, OptionExerciseStyle
from app.services.ingestion import ingestion_service
from app.services.auditor import auditor_service
from app.services.risk_engine import risk_engine_service


# Configure clear telemetry tracking output
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("pipeline_test")

# Sample climate-financial narrative representing an institutional third-party asset prospectus
MOCK_CLIMATE_REPORT = """
The North Atlantic Wind Energy project bond (ISIN: US1234567890) is structured to back the deployment 
of 45 next-generation offshore wind turbine stations. Project site engineering evaluations show a 
moderate physical climate hazard rating, specifically scoring a 42 out of 100 on the global storm-surge 
vulnerability index due to its location in coastal shelf zones. Financial modeling shows a gross nominal 
capital exposure of $50,000,000 USD. Current environmental impact audits verify that the asset meets 
all standard carbon capture and displacement milestones, reducing net localized equivalent carbon footprint 
by 120,000 metric tons annually. The project maintains a highly resilient cash flow barrier, though 
extreme sea-level rising patterns beyond 1.2 meters present a long-tail operational vulnerability to 
onshore distribution nodes over a 15-year horizon.
"""

async def run_integration_pipeline():
    logger.info("Initializing system integration test pipeline...")
    
    async with async_session_maker() as db:
        # 1. Clean up any leftover test telemetry from previous runs
        logger.info("Purging existing test records to ensure a clean database environment...")
        await db.execute(text("TRUNCATE TABLE asset_chunks CASCADE;"))
        await db.execute(text("TRUNCATE TABLE bond_assets CASCADE;"))
        await db.commit()

        # 2. Seed Core Asset Definition
        logger.info("Seeding test asset profile: North Atlantic Wind Energy Bond...")
        test_bond = BondAsset(
            isin="US1234567890",
            asset_name="North Atlantic Wind Energy Bond",
            bond_type=BondAssetType.CORPORATE,
            credit_rating=CreditRating.AA_MINUS,
            coupon_rate=0.0475 # 4.75% coupon yield
        )
        db.add(test_bond)
        await db.commit()
        await db.refresh(test_bond)
        logger.info(f"Asset successfully logged with primary surrogate ID: {test_bond.id}")

        # 3. Test Ingestion and pgvector Embedding Matrix Generation
        logger.info("Launching chunking pipeline and calling Gemini gemini-embedding-2...")
        chunks_indexed = await ingestion_service.process_and_vectorize_asset(
            db=db, 
            bond_id=test_bond.id, 
            raw_text=MOCK_CLIMATE_REPORT
        )
        logger.info(f"Ingestion successful. {chunks_indexed} vector entries stored in pgvector index.")

        # 4. Run the Dual-Stage Self-Reflecting Compliance Audit Agent
        logger.info("Launching automated underwriting agent loop via Gemini-3.1-Flash-Lite...")
        audit_instruction = "Verify storm surge risk values and calculate carbon displacement compliance flags."
        
        audit_result = await auditor_service.execute_underwriting_audit(
            db=db, 
            bond_isin=test_bond.isin, 
            user_instruction=audit_instruction
        )
        
        print("\n" + "="*60)
        print("          GEMINI AUTOMATED COMPLIANCE AUDIT REPORT          ")
        print("="*60)
        print(f"Hallucinations Corrected: {audit_result.get('contains_hallucinations_corrected')}")
        print(f"\nAudit Evaluation:\n{audit_result.get('verified_audit_justification')}")
        print(f"\nFlagged Vulnerabilities: {audit_result.get('detected_vulnerabilities')}")
        print("="*60 + "\n")

        # 5. Test Black-Scholes Mathematical Engine and AI Strategy Interface
        logger.info("Running quantitative options pricing and derivative hedging alignment pass...")
        
        # Calculate Option sensitivities (Greeks)
        greeks = risk_engine_service.calculate_option_greeks(
            S=98.50,         # Underlying asset spot price equivalent
            K=95.00,         # Put Option strike hedge floor boundary
            T=0.75,          # 9 months remaining to option expiration (fractional years)
            r=0.0425,        # Risk-free Treasury yield curve anchor (4.25%)
            sigma=0.22,      # Implied asset price volatility proxy index (22%)
            exercise_style=OptionExerciseStyle.EUROPEAN,
            option_type="put"
        )
        
        # Pass metrics to Gemini to formulate macro hedging adjustments
        hedging_blueprint = await risk_engine_service.generate_mitigation_strategy(
            isin=test_bond.isin,
            credit_rating=test_bond.credit_rating,
            hazard_score=42.0, # Pulled from our report data matrix
            financial_exposure=50000000.00,
            greeks=greeks
        )

        print("="*60)
        print("         DERIVATIVE HEDGING & EXPOSURE BALANCING PROFILE       ")
        print("="*60)
        print(f"Computed Analytical Greeks: {greeks}")
        print(f"\nStrategic Summary:\n{hedging_blueprint.get('risk_assessment_summary')}")
        print(f"\nActionable Directives: {hedging_blueprint.get('hedging_actionable_directives')}")
        print(f"\nRecommended CDS Buffer: {hedging_blueprint.get('recommended_credit_default_swap_bps_buffer')} bps")
        print("="*60 + "\n")

if __name__ == "__main__":
    # Ensure environment vars are available before execution loop starts
    try:
        asyncio.run(run_integration_pipeline())
        logger.info("Integration pipeline completed successfully. All components operational.")
    except Exception as error:
        logger.critical(f"Pipeline test aborted due to a fatal error: {str(error)}", exc_info=True)
        sys.exit(1)
    finally:
        # Force pool engine disconnect for clean workspace collection
        asyncio.run(engine.dispose())

