from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    repository_url: HttpUrl | None = None


class ProjectRead(BaseModel):
    id: str
    name: str
    repository_url: str | None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=12000)
    conversation_id: str | None = None
    project_id: str | None = None


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    model: str


class WorkspaceModelRead(BaseModel):
    id: str
    label: str
    model: str
    available: bool


class ThreadCreate(BaseModel):
    title: str = Field(min_length=1, max_length=180, pattern=r"\S")
    agent_id: str = Field(default="default", pattern=r"^[A-Za-z0-9_-]{1,64}$")


class ThreadTask(BaseModel):
    agent_id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")
    task_status: Literal["open", "in_progress", "done"]


class ThreadRead(BaseModel):
    id: str
    project_id: str | None
    title: str
    agent_id: str
    task_status: Literal["open", "in_progress", "done"]
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class MessageRead(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ThreadHistory(ThreadRead):
    messages: list[MessageRead]
