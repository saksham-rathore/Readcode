from typing import Literal
from uuid import UUID

from fastapi import HTTPException
from pydantic import BaseModel, Field

from .repository import Repository, public_clone_url, run_git

Action = Literal["browser", "github", "files", "terminal"]

ACTION_DESCRIPTIONS: dict[Action, str] = {
    "browser": "Open the project's public repository in the browser",
    "github": "Open the project's GitHub Issues page",
    "files": "List files inside the selected thread's worktree",
    "terminal": "Read the selected worktree's Git status and recent commits",
}


class ActionRequest(BaseModel):
    action: Action
    thread_id: UUID | None = None


class ActionSuggestion(BaseModel):
    agent_id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")
    prompt: str = Field(min_length=1, max_length=3000, pattern=r"\S")
    thread_id: UUID | None = None


class ActionResult(BaseModel):
    url: str | None = None
    output: str | None = None


def browser_url(repository_url: str | None) -> str | None:
    if not repository_url:
        return None
    try:
        return public_clone_url(repository_url).removesuffix(".git")
    except HTTPException:
        return None


def available_actions(repository_url: str | None, repo: Repository | None) -> list[Action]:
    actions: list[Action] = []
    url = browser_url(repository_url)
    if url:
        actions.append("browser")
        if url.startswith("https://github.com/"):
            actions.append("github")
    if repo and repo.ready:
        actions.extend(("files", "terminal"))
    return actions


def run_action(action: Action, repository_url: str | None, repo: Repository | None) -> ActionResult:
    if action in ("browser", "github"):
        url = browser_url(repository_url)
        if not url or (action == "github" and not url.startswith("https://github.com/")):
            raise HTTPException(409, "Connect a supported repository before opening this page.")
        return ActionResult(url=f"{url}/issues" if action == "github" else url)
    if not repo:
        raise HTTPException(409, "Select a thread and open its worktree first.")
    if action == "files":
        return ActionResult(output="\n".join(repo.files()) or "The worktree has no files.")
    tree = repo.worktree()
    status = run_git(tree, "status", "--short", "--branch")
    log = run_git(tree, "log", "-10", "--oneline", "--no-decorate")
    return ActionResult(output=f"$ git status --short --branch\n{status}\n$ git log -10 --oneline --no-decorate\n{log}")
