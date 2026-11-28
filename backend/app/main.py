from contextlib import asynccontextmanager
from datetime import datetime, timezone

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from redis.asyncio import Redis
from sqlalchemy import desc, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from .auth import ACCOUNT_OWNER_PREFIX, Bearer, Database, authenticated_session, router as auth_router
from .oauth import router as oauth_router
from .workspace import router as workspace_router
from .config import get_settings
from .database import Base, engine, get_session
from .models import Conversation, ConversationTask, Message, Project
from .schemas import ChatRequest, ChatResponse, ProjectCreate, ProjectRead

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.app_env == "development":
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
    app.state.redis = Redis.from_url(settings.redis_url, decode_responses=True) if settings.redis_url else None
    app.state.http = httpx.AsyncClient(timeout=httpx.Timeout(60, connect=5), limits=httpx.Limits(max_connections=200, max_keepalive_connections=40))
    yield
    await app.state.http.aclose()
    if app.state.redis:
        await app.state.redis.aclose()
    await engine.dispose()


app = FastAPI(title="readcode API", version="0.1.0", lifespan=lifespan)
app.include_router(auth_router)
app.include_router(oauth_router)
app.include_router(workspace_router)
app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_credentials=True, allow_methods=["GET", "POST", "OPTIONS"], allow_headers=["Authorization", "Content-Type", "X-User-ID"])
if settings.app_env == "production":
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.hosts)


async def current_user(
    credentials: Bearer, db: Database, authorization: str | None = Header(default=None),
    x_user_id: str | None = Header(default=None),
) -> str:
    if authorization is not None:
        auth = await authenticated_session(credentials, db)
        return f"{ACCOUNT_OWNER_PREFIX}{auth.account_id}"
    if settings.app_env == "development" and x_user_id and len(x_user_id) <= 128 and not x_user_id.startswith(ACCOUNT_OWNER_PREFIX):
        return x_user_id
    raise HTTPException(status_code=401, detail="Sign in to continue.")


async def rate_limit(request: Request, user_id: str = Depends(current_user)) -> str:
    redis = request.app.state.redis
    if redis:
        key = f"rate:{user_id}:{int(datetime.now(timezone.utc).timestamp()) // 60}"
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, 70)
        if count > 60:
            raise HTTPException(status_code=429, detail="Rate limit reached. Try again in a minute.")
    return user_id


@app.get("/health/live")
async def liveness():
    return {"status": "ok"}


@app.get("/health/ready")
async def readiness(session: AsyncSession = Depends(get_session)):
    await session.execute(text("SELECT 1"))
    redis = getattr(app.state, "redis", None)
    if redis:
        await redis.ping()
    return {"status": "ready", "database": "ok", "redis": "ok" if redis else "disabled"}


@app.get("/v1/projects", response_model=list[ProjectRead])
async def list_projects(owner_id: str = Depends(rate_limit), session: AsyncSession = Depends(get_session)):
    result = await session.scalars(select(Project).where(Project.owner_id == owner_id).order_by(desc(Project.updated_at)).limit(100))
    return result.all()


@app.post("/v1/projects", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, owner_id: str = Depends(rate_limit), session: AsyncSession = Depends(get_session)):
    project = Project(owner_id=owner_id, name=payload.name.strip(), repository_url=str(payload.repository_url) if payload.repository_url else None)
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project


@app.post("/v1/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, request: Request, owner_id: str = Depends(rate_limit), session: AsyncSession = Depends(get_session)):
    project = None
    if payload.project_id:
        project = await session.scalar(select(Project).where(Project.id == payload.project_id, Project.owner_id == owner_id))
        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")

    conversation = None
    if payload.conversation_id:
        conversation = await session.scalar(select(Conversation).where(Conversation.id == payload.conversation_id, Conversation.owner_id == owner_id))
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found.")
        if project and conversation.project_id != project.id:
            raise HTTPException(status_code=409, detail="This thread belongs to a different project.")
        if not project and conversation.project_id:
            project = await session.scalar(select(Project).where(Project.id == conversation.project_id, Project.owner_id == owner_id))
    task = await session.get(ConversationTask, conversation.id) if conversation else None
    agent_id = task.agent_id if task else "default"
    agent = settings.workspace_agents.get(agent_id) if agent_id != "default" else None
    if agent_id != "default" and not agent:
        raise HTTPException(status_code=503, detail="The assigned assistant is unavailable. Choose another assistant for this thread.")
    api_key = agent.api_key.get_secret_value() if agent else settings.openai_api_key
    base_url = str(agent.base_url) if agent else settings.openai_base_url
    model = agent.model if agent else settings.openai_model
    if not api_key or not api_key.strip():
        raise HTTPException(status_code=503, detail="This model needs provider setup before it can be used.")
    if conversation is None:
        conversation = Conversation(owner_id=owner_id, project_id=project.id if project else None, title=payload.prompt[:72])
        session.add(conversation)
        await session.flush()

    prior = await session.scalars(select(Message).where(Message.conversation_id == conversation.id).order_by(desc(Message.created_at)).limit(20))
    history = [{"role": row.role, "content": row.content} for row in reversed(prior.all())]
    # Release the database connection before waiting on the model provider. A slow provider
    # must not pin one of the API process's bounded Postgres connections.
    await session.commit()
    system_prompt = "You are a careful coding assistant. Give practical, concise answers. When writing code, use fenced code blocks and explain where files belong. Be honest about what you have not inspected."
    if project:
        system_prompt += f" The active project is {project.name}. Repository URL: {project.repository_url or 'not connected'}; repository files have not been indexed yet."
    try:
        response = await request.app.state.http.post(
            f"{base_url.rstrip('/')}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": model, "messages": [{"role": "system", "content": system_prompt}, *history, {"role": "user", "content": payload.prompt}], "temperature": 0.2},
        )
        response.raise_for_status()
        answer = response.json()["choices"][0]["message"]["content"]
        if not isinstance(answer, str) or not answer.strip():
            raise ValueError("No text response from the provider")
    except httpx.HTTPStatusError as error:
        raise HTTPException(status_code=502, detail="The model provider rejected the request. Check model and API key configuration.") from error
    except (httpx.HTTPError, KeyError, IndexError, ValueError, TypeError):
        raise HTTPException(status_code=502, detail="The model provider is temporarily unavailable.")

    session.add(Message(conversation_id=conversation.id, role="user", content=payload.prompt))
    session.add(Message(conversation_id=conversation.id, role="assistant", content=answer))
    conversation.updated_at = datetime.now(timezone.utc)
    await session.commit()
    return ChatResponse(conversation_id=conversation.id, answer=answer, model=model)


@app.exception_handler(Exception)
async def internal_error(_: Request, __: Exception):
    return JSONResponse(status_code=500, content={"detail": "An unexpected server error occurred."})
