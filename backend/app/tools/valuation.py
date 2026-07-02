import logging
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app.models.finance import AssetValuation, Bond

# Set up logging for the valuation module
logger = logging.getLogger("risk_backend.valuation")

async def get_asset_valuation(bond_isin: str) -> List[Dict[str, Any]]:
    """
    Retrieve historical valuation data for a bond by its ISIN.
    Queries the Bond table for ID resolution and AssetValuation for historical trends.
    """
    async with async_session_maker() as session:
        try:
            # 1. Retrieve the internal bond ID via ISIN
            stmt = select(Bond.id).where(Bond.isin == bond_isin)
            result = await session.execute(stmt)
            bond_id = result.scalar_one_or_none()
            
            if not bond_id:
                logger.warning(f"Valuation request failed: Bond ISIN {bond_isin} not found.")
                return [{"error": "Bond not found"}]
                
            # 2. Retrieve valuations sorted by date (newest first)
            val_stmt = (
                select(AssetValuation)
                .where(AssetValuation.bond_id == bond_id)
                .order_by(AssetValuation.valuation_date.desc())
            )
            val_result = await session.execute(val_stmt)
            valuations = val_result.scalars().all()
            
            if not valuations:
                return []

            # 3. Format data for the frontend
            return [
                {
                    "date": r.valuation_date.strftime("%Y-%m-%d"), 
                    "valuation": float(r.valuation),
                    "formatted_valuation": f"${float(r.valuation):,.2f}"
                } 
                for r in valuations
            ]
            
        except Exception as e:
            logger.error(f"Error fetching valuations for {bond_isin}: {str(e)}")
            return [{"error": "An internal error occurred retrieving valuation data."}]

async def get_latest_valuation(bond_id: int) -> float:
    """
    Utility to get the most recent valuation as a single float.
    Useful for analytics calculations.
    """
    async with async_session_maker() as session:
        stmt = (
            select(AssetValuation.valuation)
            .where(AssetValuation.bond_id == bond_id)
            .order_by(AssetValuation.valuation_date.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        val = result.scalar_one_or_none()
        return float(val) if val else 0.0