from collections.abc import AsyncIterator
from pathlib import Path

from sqlalchemy.engine import URL, make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import get_settings


class Base(DeclarativeBase):
    pass


def _engine_options(url: URL) -> dict:
    if url.get_backend_name() == "sqlite":
        if url.database and url.database.startswith("./"):
            Path("data").mkdir(exist_ok=True)
        return {"connect_args": {"check_same_thread": False}}
    return {"pool_size": 20, "max_overflow": 10, "pool_timeout": 10, "pool_pre_ping": True}


database_url = make_url(get_settings().database_url)
if database_url.drivername == "postgresql":
    # Provider URLs use libpq options such as sslmode and channel_binding.
    database_url = database_url.set(drivername="postgresql+psycopg")

engine = create_async_engine(database_url, **_engine_options(database_url))
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
