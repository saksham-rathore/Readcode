from collections.abc import AsyncIterator
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import get_settings


class Base(DeclarativeBase):
    pass


def _engine_options(url: str) -> dict:
    if url.startswith("sqlite"):
        if "./" in url:
            Path("data").mkdir(exist_ok=True)
        return {"connect_args": {"check_same_thread": False}}
    return {"pool_size": 20, "max_overflow": 10, "pool_timeout": 10, "pool_pre_ping": True}


engine = create_async_engine(get_settings().database_url, **_engine_options(get_settings().database_url))
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
