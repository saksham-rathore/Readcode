from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from sqlalchemy import desc, select

from .auth import ACCOUNT_OWNER_PREFIX, ActiveSession, Database
from .config import get_settings
from .models import Conversation, ConversationTask, Message, Project
from .repository import TEXT_LIMIT, Repository, call_repository, github_clone_url
from .schemas import MessageRead, ThreadCreate, ThreadHistory, ThreadRead, ThreadTask

router = APIRouter(prefix="/v1/workspace")


class Approval(BaseModel):
    approved: Literal[True]


class FileWrite(Approval):
    path: str = Field(max_length=600)
    content: str = Field(max_length=TEXT_LIMIT)
    expected: str | None = Field(max_length=TEXT_LIMIT)


class Checkpoint(Approval):
    title: str = Field(min_length=1, max_length=120, pattern=r"\S")


class Restore(Approval):
    commit: str = Field(max_length=64)


def account_owner(session: ActiveSession) -> str:
    return f"{ACCOUNT_OWNER_PREFIX}{session.account_id}"


Owner = Annotated[str, Depends(account_owner)]


async def owned_project(project_id: UUID, owner: Owner, db: Database) -> Project:
    project = await db.scalar(select(Project).where(Project.id == str(project_id), Project.owner_id == owner))
    if not project:
        raise HTTPException(404, "Project not found.")
    return project


async def owned_thread(thread_id: UUID, owner: Owner, db: Database) -> Conversation:
    thread = await db.scalar(select(Conversation).where(Conversation.id == str(thread_id), Conversation.owner_id == owner))
    if not thread:
        raise HTTPException(404, "Thread not found.")
    return thread


ProjectAccess = Annotated[Project, Depends(owned_project)]
ThreadAccess = Annotated[Conversation, Depends(owned_thread)]


def thread_repo(thread: ThreadAccess) -> Repository:
    if not thread.project_id:
        raise HTTPException(409, "This thread is not attached to a project.")
    return Repository(str(UUID(thread.project_id)), thread.id)


RepoAccess = Annotated[Repository, Depends(thread_repo)]


def require_agent(agent_id: str) -> None:
    if agent_id != "default" and agent_id not in get_settings().workspace_agents:
        raise HTTPException(422, "Choose a configured workspace agent.")


def describe_thread(thread: Conversation, task: ConversationTask | None) -> ThreadRead:
    return ThreadRead(
        id=thread.id, project_id=thread.project_id, title=thread.title, updated_at=thread.updated_at,
        agent_id=task.agent_id if task else "default", task_status=task.status if task else "open",
    )


@router.get("/agents")
async def list_agents(_: Owner):
    settings = get_settings()
    return [
        {"id": "default", "label": "Default assistant", "model": settings.openai_model},
        *({"id": agent_id, "label": agent.label, "model": agent.model}
          for agent_id, agent in settings.workspace_agents.items() if agent_id != "default"),
    ]


@router.get("/projects/{project_id}/threads", response_model=list[ThreadRead])
async def list_threads(project: ProjectAccess, owner: Owner, db: Database):
    result = await db.execute(select(Conversation, ConversationTask).outerjoin(ConversationTask).where(
        Conversation.project_id == project.id, Conversation.owner_id == owner,
    ).order_by(desc(Conversation.updated_at), Conversation.id).limit(100))
    return [describe_thread(thread, task) for thread, task in result]


@router.post("/projects/{project_id}/threads", response_model=ThreadRead, status_code=201)
async def create_thread(payload: ThreadCreate, project: ProjectAccess, owner: Owner, db: Database):
    require_agent(payload.agent_id)
    thread = Conversation(project_id=project.id, owner_id=owner, title=payload.title.strip())
    db.add(thread)
    await db.flush()
    task = ConversationTask(conversation_id=thread.id, agent_id=payload.agent_id, status="open")
    db.add(task)
    await db.commit()
    return describe_thread(thread, task)


@router.get("/threads/{thread_id}", response_model=ThreadHistory)
async def thread_history(thread: ThreadAccess, db: Database):
    result = await db.scalars(select(Message).where(Message.conversation_id == thread.id).order_by(
        desc(Message.created_at), desc(Message.id),
    ).limit(200))
    task = await db.get(ConversationTask, thread.id)
    return ThreadHistory(
        **describe_thread(thread, task).model_dump(),
        messages=[MessageRead.model_validate(message) for message in reversed(result.all())],
    )


@router.post("/threads/{thread_id}/task", response_model=ThreadRead)
async def update_task(payload: ThreadTask, thread: ThreadAccess, db: Database):
    require_agent(payload.agent_id)
    task = await db.merge(ConversationTask(conversation_id=thread.id, agent_id=payload.agent_id, status=payload.task_status))
    await db.commit()
    return describe_thread(thread, task)


@router.post("/projects/{project_id}/clone")
async def clone_project(_: Approval, project: ProjectAccess, db: Database):
    repository = Repository(project.id)
    url = github_clone_url(project.repository_url)
    await db.commit()
    await run_in_threadpool(call_repository, repository.clone, url)
    return repository.status()


@router.get("/threads/{thread_id}/worktree")
async def worktree_status(repo: RepoAccess):
    return await run_in_threadpool(call_repository, repo.status)


@router.post("/threads/{thread_id}/worktree")
async def open_worktree(_: Approval, repo: RepoAccess, db: Database):
    await db.commit()
    await run_in_threadpool(call_repository, repo.open_worktree)
    return await run_in_threadpool(call_repository, repo.status)


@router.get("/threads/{thread_id}/files")
async def list_files(repo: RepoAccess):
    return await run_in_threadpool(call_repository, repo.files)


@router.get("/threads/{thread_id}/file")
async def read_file(repo: RepoAccess, path: Annotated[str, Query(max_length=600)]):
    return await run_in_threadpool(call_repository, repo.read_file, path)


@router.post("/threads/{thread_id}/file")
async def write_file(payload: FileWrite, repo: RepoAccess, db: Database):
    await db.commit()
    return await run_in_threadpool(call_repository, repo.write_file, payload.path, payload.content, payload.expected)


@router.get("/threads/{thread_id}/diff")
async def diff(repo: RepoAccess):
    return await run_in_threadpool(call_repository, repo.changes)


@router.get("/threads/{thread_id}/checkpoints")
async def list_checkpoints(repo: RepoAccess):
    return await run_in_threadpool(call_repository, repo.checkpoints)


@router.post("/threads/{thread_id}/checkpoints")
async def checkpoint(payload: Checkpoint, repo: RepoAccess, db: Database):
    await db.commit()
    return await run_in_threadpool(call_repository, repo.checkpoint, payload.title.strip())


@router.post("/threads/{thread_id}/restore")
async def restore(payload: Restore, repo: RepoAccess, db: Database):
    await db.commit()
    return await run_in_threadpool(call_repository, repo.restore, payload.commit)