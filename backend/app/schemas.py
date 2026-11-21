from datetime import datetime

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
