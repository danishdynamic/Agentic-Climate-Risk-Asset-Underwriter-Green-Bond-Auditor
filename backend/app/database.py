from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings

# 1. Use create_async_engine (note the 'postgresql+asyncpg' driver requirement)
engine = create_async_engine(
    settings.DATABASE_URL, 
    pool_size=15, 
    max_overflow=25,
    pool_pre_ping=True
)

# 2. Define the async_session_maker
# expire_on_commit=False is recommended for async sessions
async_session_maker = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autocommit=False, 
    autoflush=False
)

Base = declarative_base()

# 3. Update get_db to be an async generator
async def get_db():
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()