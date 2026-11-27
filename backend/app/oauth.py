from typing import Annotated, Literal
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Query, Request, Response
from pydantic import BaseModel, EmailStr, Field, SecretStr, TypeAdapter, ValidationError
from sqlalchemy.exc import IntegrityError

from .auth import Database, SignedIn, create_session, limit_attempts
from .config import get_settings
from .models import Account, OAuthIdentity

router = APIRouter(prefix="/v1/auth/oauth")
Provider = Literal["google", "github"]
PKCE_PATTERN = r"^[A-Za-z0-9_-]{43}$"
email_adapter = TypeAdapter(EmailStr)

PROVIDERS = {
    "google": ("https://accounts.google.com/o/oauth2/v2/auth", "https://oauth2.googleapis.com/token", "openid email"),
    "github": ("https://github.com/login/oauth/authorize", "https://github.com/login/oauth/access_token", "user:email"),
}


class Exchange(BaseModel):
    code: SecretStr = Field(min_length=1, max_length=2048)
    verifier: str = Field(pattern=PKCE_PATTERN)


def provider_config(provider: Provider) -> tuple[str, str, str]:
    settings = get_settings()
    if provider == "google":
        client_id, secret = settings.google_client_id, settings.google_client_secret
    else:
        client_id, secret = settings.github_client_id, settings.github_client_secret
    if not client_id or not secret.get_secret_value():
        raise HTTPException(503, "This sign-in provider is not configured.")
    callback = f"{settings.oauth_app_origin.rstrip('/')}/api/account/oauth/{provider}/callback"
    return client_id, secret.get_secret_value(), callback


@router.get("/{provider}/authorize")
async def authorize(
    provider: Provider,
    state: Annotated[str, Query(pattern=PKCE_PATTERN)],
    challenge: Annotated[str, Query(pattern=PKCE_PATTERN)],
    response: Response,
):
    client_id, _, callback = provider_config(provider)
    authorization_url, _, scope = PROVIDERS[provider]
    query = urlencode({
        "client_id": client_id,
        "redirect_uri": callback,
        "response_type": "code",
        "scope": scope,
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    })
    response.headers["Cache-Control"] = "no-store"
    return {"url": f"{authorization_url}?{query}"}


async def provider_identity(
    client: httpx.AsyncClient, provider: Provider, token: str,
) -> tuple[str, str]:
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json", "User-Agent": "Readcode"}
    if provider == "google":
        profile = (await client.get("https://openidconnect.googleapis.com/v1/userinfo", headers=headers, timeout=5)).raise_for_status().json()
        subject = profile.get("sub")
        email = profile.get("email") if profile.get("email_verified") is True else None
    else:
        profile = (await client.get("https://api.github.com/user", headers=headers, timeout=5)).raise_for_status().json()
        user_id = profile.get("id")
        subject = str(user_id) if type(user_id) is int and user_id > 0 else None
        addresses = (await client.get("https://api.github.com/user/emails", headers=headers, timeout=5)).raise_for_status().json()
        email = next((entry.get("email") for entry in addresses if entry.get("primary") is True and entry.get("verified") is True), None)

    if not isinstance(subject, str) or not 1 <= len(subject) <= 255 or not isinstance(email, str):
        raise HTTPException(422, "A verified email is required for social sign-in.")
    normalized = email_adapter.validate_python(email).casefold()
    if len(normalized) > 254:
        raise HTTPException(422, "A valid email is required for social sign-in.")
    return subject, normalized


@router.post("/{provider}/exchange", response_model=SignedIn)
async def exchange(provider: Provider, payload: Exchange, request: Request, response: Response, db: Database):
    client_id, secret, callback = provider_config(provider)
    code = payload.code.get_secret_value()
    await limit_attempts(request, f"oauth:{provider}:{code}")
    client: httpx.AsyncClient = request.app.state.http
    try:
        _, token_url, _ = PROVIDERS[provider]
        token_response = await client.post(token_url, headers={"Accept": "application/json"}, timeout=8, data={
            "client_id": client_id,
            "client_secret": secret,
            "redirect_uri": callback,
            "grant_type": "authorization_code",
            "code": code,
            "code_verifier": payload.verifier,
        })
        access_token = token_response.raise_for_status().json().get("access_token")
        if not isinstance(access_token, str) or not access_token:
            raise HTTPException(401, "The provider could not complete sign-in.")
        subject, email = await provider_identity(client, provider, access_token)
    except ValidationError:
        raise HTTPException(422, "A valid verified email is required.") from None
    except (httpx.HTTPError, ValueError, AttributeError, TypeError):
        raise HTTPException(502, "The provider could not complete sign-in.") from None

    identity = await db.get(OAuthIdentity, (provider, subject))
    if identity:
        account = await db.get(Account, identity.account_id)
        if not account:
            raise HTTPException(401, "The linked Readcode account is unavailable.")
    else:
        # A provider email alone never grants access to a pre-existing account.
        account = Account(email=email, password_hash="")
        db.add(account)
        try:
            await db.flush()
            db.add(OAuthIdentity(provider=provider, subject=subject, account_id=account.id))
            await db.flush()
        except IntegrityError:
            await db.rollback()
            identity = await db.get(OAuthIdentity, (provider, subject))
            account = await db.get(Account, identity.account_id) if identity else None
            if not account:
                raise HTTPException(409, "Use the sign-in method you originally used for this email.") from None

    response.headers["Cache-Control"] = "no-store"
    return await create_session(account, db)
