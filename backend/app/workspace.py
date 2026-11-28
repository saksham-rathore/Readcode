from typing import Annotated, Literal
import base64
import binascii
from pathlib import PureWindowsPath
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from sqlalchemy import desc, select, update

from .auth import ACCOUNT_OWNER_PREFIX, ActiveSession, Database
from .config import get_settings
from .models import Conversation, ConversationTask, Message, Project
from .repository import TEXT_LIMIT, Repository, call_repository, public_clone_url
from .schemas import MessageRead, ProjectRead, ThreadCreate, ThreadHistory, ThreadRead, ThreadTask, WorkspaceModelRead

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


class ConnectRepository(BaseModel):
    repository_url: str = Field(min_length=1, max_length=2048)


class ImportFile(BaseModel):
    path: str = Field(min_length=1, max_length=600)
    content: str = Field(max_length=2_800_000)


class ProjectSource(BaseModel):
    source: Literal["new", "local", "git"]
    name: str = Field(min_length=1, max_length=120, pattern=r"\S")
    remote: str = Field(default="", max_length=2048)
    files: list[ImportFile] = Field(default_factory=list, max_length=500)


def import_files(entries: list[ImportFile]) -> dict[str, bytes]:
    files = {}
    files_lower = set()
    parents = set()
    remaining = 2 * 1024 * 1024
    for entry in entries:
        parts = entry.path.split("/")
        if any(
            not part or part in {".", ".."} or part.endswith((" ", ".")) or part.lower() == ".git"
            or PureWindowsPath(part).is_reserved() or any(c in '\\:*?"<>|' or ord(c) < 32 for c in part)
            for part in parts
        ):
            raise HTTPException(422, "The folder contains a path that cannot be imported.")
        key = entry.path.casefold()
        ancestors = {"/".join(parts[:length]).casefold() for length in range(1, len(parts))}
        if key in files_lower or key in parents or files_lower.intersection(ancestors):
            raise HTTPException(422, "The folder contains conflicting file paths.")
        files_lower.add(key)
        parents.update(ancestors)
        try:
            files[entry.path] = base64.b64decode(entry.content, validate=True)
        except (ValueError, binascii.Error):
            raise HTTPException(422, "A folder file could not be decoded.") from None
        remaining -= len(files[entry.path])
        if remaining < 0:
            raise HTTPException(413, "Choose a folder with at most 2 MiB of files.")
    return files


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


@router.get("/agents", response_model=list[WorkspaceModelRead])
async def list_agents(_: Owner):
    settings = get_settings()
    return [
        WorkspaceModelRead(
            id="default", label="Default assistant", model=settings.openai_model,
            available=bool((settings.openai_api_key or "").strip()),
        ),
        *(
            WorkspaceModelRead(
                id=agent_id, label=agent.label, model=agent.model,
                available=bool(agent.api_key.get_secret_value().strip()),
            )
            for agent_id, agent in settings.workspace_agents.items() if agent_id != "default"
        ),
    ]


@router.post("/project-sources", response_model=ProjectRead, status_code=201)
async def create_project_from_source(payload: ProjectSource, owner: Owner, db: Database):
    project = Project(id=str(uuid4()), owner_id=owner, name=payload.name.strip())
    if payload.source == "git":
        project.repository_url = public_clone_url(payload.remote.strip())
    else:
        if payload.source == "local" and not payload.files:
            raise HTTPException(422, "Choose a folder with at least one file.")
        files = import_files(payload.files) if payload.source == "local" else {}
        await db.commit()
        repository = Repository(project.id)
        await run_in_threadpool(call_repository, repository.initialize, files)
    db.add(project)
    await db.commit()
    return project


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


@router.get("/projects/{project_id}/repository")
async def repository_status(project: ProjectAccess):
    repository = Repository(project.id)
    return await run_in_threadpool(call_repository, repository.status)


@router.post("/projects/{project_id}/repository", response_model=ProjectRead)
async def connect_repository(payload: ConnectRepository, project: ProjectAccess, db: Database):
    url = public_clone_url(payload.repository_url.strip())
    result = await db.execute(
        update(Project)
        .where(Project.id == project.id, Project.repository_url.is_(None))
        .values(repository_url=url)
        .returning(Project)
    )
    updated = result.scalar_one_or_none()
    if updated is None:
        raise HTTPException(409, "This project already has a repository.")
    await db.commit()
    return updated


@router.post("/projects/{project_id}/clone")
async def clone_project(_: Approval, project: ProjectAccess, db: Database):
    repository = Repository(project.id)
    url = public_clone_url(project.repository_url)
    await db.commit()
    await run_in_threadpool(call_repository, repository.clone, url)
    return await run_in_threadpool(call_repository, repository.status)


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
