from functools import lru_cache
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class WorkspaceAgent(BaseModel):
    label: str = Field(min_length=1, max_length=80)
    model: str = Field(min_length=1, max_length=120)
    base_url: HttpUrl
    api_key: SecretStr
    protocol: Literal["openai", "anthropic"] = "openai"


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite+aiosqlite:///./data/readcode.db"
    redis_url: str | None = None
    openai_api_key: str | None = None
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"
    openai_models: str = ""
    anthropic_api_key: SecretStr = SecretStr("")
    anthropic_models: str = "claude-sonnet-5-5"
    gemini_api_key: SecretStr = SecretStr("")
    gemini_models: str = "gemini-3.8-flash"
    groq_api_key: SecretStr = SecretStr("")
    groq_models: str = "openai/gpt-oss-120b"
    xai_api_key: SecretStr = SecretStr("")
    xai_models: str = "grok-4.7"
    allowed_origins: str = "http://localhost:3000"
    trusted_hosts: str = "localhost,127.0.0.1"
    workspace_dir: str = "./data/workspaces"
    workspace_agents: dict[str, WorkspaceAgent] = Field(default_factory=dict)
    oauth_app_origin: str = "http://localhost:3000"
    google_client_id: str = ""
    google_client_secret: SecretStr = SecretStr("")
    github_client_id: str = ""
    github_client_secret: SecretStr = SecretStr("")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def hosts(self) -> list[str]:
        return [host.strip() for host in self.trusted_hosts.split(",") if host.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
