from dataclasses import dataclass
from hashlib import sha256

import httpx
from fastapi import HTTPException
from pydantic import SecretStr

from .config import Settings


@dataclass(frozen=True)
class Model:
    label: str
    model: str
    base_url: str
    key: SecretStr
    protocol: str = "openai"
    temperature: float | None = None

    @property
    def available(self) -> bool:
        return bool(self.key.get_secret_value().strip())


def model_catalog(settings: Settings) -> dict[str, Model]:
    openai_key = SecretStr(settings.openai_api_key or "")
    catalog = {"default": Model("OpenAI", settings.openai_model, settings.openai_base_url, openai_key)}
    providers = (
        ("openai", "OpenAI", settings.openai_models, settings.openai_base_url, openai_key, "openai"),
        ("anthropic", "Anthropic", settings.anthropic_models, "https://api.anthropic.com/v1", settings.anthropic_api_key, "anthropic"),
        ("gemini", "Google Gemini", settings.gemini_models, "https://generativelanguage.googleapis.com/v1beta/openai", settings.gemini_api_key, "openai"),
        ("groq", "Groq", settings.groq_models, "https://api.groq.com/openai/v1", settings.groq_api_key, "openai"),
        ("xai", "xAI Grok", settings.xai_models, "https://api.x.ai/v1", settings.xai_api_key, "openai"),
    )
    for provider, label, models, base_url, key, protocol in providers:
        for model in filter(None, (value.strip() for value in models.split(","))):
            if provider == "openai" and model == settings.openai_model:
                continue
            short_id = sha256(model.encode()).hexdigest()[:20]
            catalog[f"{provider}-{short_id}"] = Model(label, model, base_url, key, protocol)
    for agent_id, agent in settings.workspace_agents.items():
        if agent_id != "default":
            catalog[agent_id] = Model(agent.label, agent.model, str(agent.base_url), agent.api_key, agent.protocol, 0.2)
    return catalog


def get_model(settings: Settings, agent_id: str) -> Model:
    model = model_catalog(settings).get(agent_id)
    if not model:
        raise HTTPException(503, "The assigned model is unavailable. Choose another model.")
    if not model.available:
        raise HTTPException(503, "This model needs provider setup before it can be used.")
    return model


async def complete(
    client: httpx.AsyncClient,
    model: Model,
    system: str,
    messages: list[dict[str, str]],
) -> str:
    base = model.base_url.rstrip("/")
    key = model.key.get_secret_value().strip()
    try:
        if model.protocol == "anthropic":
            response = await client.post(
                f"{base}/messages",
                headers={"x-api-key": key, "anthropic-version": "2023-06-01"},
                json={"model": model.model, "system": system, "messages": messages, "max_tokens": 4096},
            )
            response.raise_for_status()
            answer = "\n".join(
                block["text"] for block in response.json()["content"] if block["type"] == "text"
            )
        else:
            body = {"model": model.model, "messages": [{"role": "system", "content": system}, *messages]}
            if model.temperature is not None:
                body["temperature"] = model.temperature
            response = await client.post(
                f"{base}/chat/completions", headers={"Authorization": f"Bearer {key}"}, json=body,
            )
            response.raise_for_status()
            answer = response.json()["choices"][0]["message"]["content"]
        if not isinstance(answer, str) or not answer.strip():
            raise ValueError("No text response from the provider")
        return answer
    except httpx.HTTPStatusError as error:
        if error.response.status_code == 429:
            raise HTTPException(429, "The model provider reached its rate or quota limit.") from None
        raise HTTPException(502, "The model provider rejected the request. Check model and API key configuration.") from None
    except (httpx.HTTPError, KeyError, IndexError, ValueError, TypeError):
        raise HTTPException(502, "The model provider returned no usable reply. Try again.") from None
