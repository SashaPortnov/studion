from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from collections.abc import AsyncGenerator
from .settings import settings
from src.models.schemas import Base

engine = create_async_engine(url=settings.database_url)

async_session_maker = async_sessionmaker(
    bind=engine, class_=AsyncSession, autoflush=False
)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncGenerator, None]:
    async with async_session_maker() as session:
        yield session
