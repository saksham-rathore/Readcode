from asyncio import Semaphore
from datetime import timedelta
from hashlib import sha256
from secrets import token_urlsafe
from time import time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.concurrency import run_in_threadpool
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr, SecretStr, ValidationError
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .database import get_session
from .models import Account, AccountSession, now_utc

router = APIRouter(prefix="/v1/auth")
ACCOUNT_OWNER_PREFIX = "account:"
SESSION_SECONDS = 60 * 60 * 12
ATTEMPT_WINDOW_SECONDS = 5 * 60
password_hasher = PasswordHash.recommended()
dummy_hash = password_hasher.hash(token_urlsafe(32))
hash_slots = Semaphore(4)
bearer = HTTPBearer(auto_error=False)
development_attempts: dict[str, int] = {}
development_window = -1

Database = Annotated[AsyncSession, Depends(get_session)]
Bearer = Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]


class Credentials(BaseModel):
    email: EmailStr
    password: SecretStr


class AccountDetails(BaseModel):
    email: EmailStr


class SignedIn(BaseModel):
    account: AccountDetails
    token: str
    expires_in: int


async def read_credentials(request: Request) -> tuple[str, str]:
    body = bytearray()
    async for chunk in request.stream():
        if len(body) + len(chunk) > 4096:
            raise HTTPException(413, "Account request is too large.")
        body.extend(chunk)
    try:
        credentials = Credentials.model_validate_json(body)
    except ValidationError:
        raise HTTPException(422, "Enter a valid email address and password.") from None

    email = credentials.email.casefold()
    password = credentials.password.get_secret_value()
    if len(email) > 254 or not 1 <= len(password) <= 128:
        raise HTTPException(422, "Enter a valid email address and password of up to 128 characters.")
    return email, password


def digest(value: str) -> str:
    return sha256(value.encode()).hexdigest()


async def limit_attempts(request: Request, email: str) -> None:
    global development_window
    window = int(time()) // ATTEMPT_WINDOW_SECONDS
    redis = request.app.state.redis
    keys = [f"auth:{window}:all", f"auth:{window}:email:{digest(email)}"]
    if redis:
        async with redis.pipeline() as pipeline:
            total, _ = await pipeline.incr(keys[0]).expire(keys[0], ATTEMPT_WINDOW_SECONDS * 2).execute()
            if total > 300:
                raise HTTPException(429, "Too many attempts. Try again in a few minutes.")
            per_account, _ = await pipeline.incr(keys[1]).expire(keys[1], ATTEMPT_WINDOW_SECONDS * 2).execute()
    elif get_settings().app_env == "development":
        if development_window != window:
            development_attempts.clear()
            development_window = window
        total = development_attempts.get(keys[0], 0) + 1
        if total > 300:
            raise HTTPException(429, "Too many attempts. Try again in a few minutes.")
        per_account = development_attempts.get(keys[1], 0) + 1
        development_attempts.update({keys[0]: total, keys[1]: per_account})
    else:
        raise HTTPException(503, "Account access is temporarily unavailable.")

    if per_account > 12:
        raise HTTPException(429, "Too many attempts. Try again in a few minutes.")


async def create_session(account: Account, db: AsyncSession) -> SignedIn:
    token = token_urlsafe(32)
    now = now_utc()
    await db.execute(delete(AccountSession).where(AccountSession.expires_at <= now))
    db.add(AccountSession(
        token_digest=digest(token),
        account_id=account.id,
        expires_at=now + timedelta(seconds=SESSION_SECONDS),
    ))
    await db.commit()
    return SignedIn(account=AccountDetails(email=account.email), token=token, expires_in=SESSION_SECONDS)


async def authenticated_session(credentials: Bearer, db: Database) -> AccountSession:
    if credentials and len(credentials.credentials) == 43:
        session = await db.scalar(select(AccountSession).where(
            AccountSession.token_digest == digest(credentials.credentials),
            AccountSession.expires_at > now_utc(),
        ))
        if session:
            return session
    raise HTTPException(401, "Sign in to continue.", headers={"WWW-Authenticate": "Bearer"})


ActiveSession = Annotated[AccountSession, Depends(authenticated_session)]


@router.post("/sign-up", response_model=SignedIn, status_code=201)
async def sign_up(request: Request, response: Response, db: Database):
    email, password = await read_credentials(request)
    if len(password) < 15:
        raise HTTPException(422, "Use at least 15 characters for your password.")
    await limit_attempts(request, email)
    async with hash_slots:
        hashed = await run_in_threadpool(password_hasher.hash, password)
    account = Account(email=email, password_hash=hashed)
    db.add(account)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(409, "Unable to create an account with these details.") from None
    response.headers["Cache-Control"] = "no-store"
    return await create_session(account, db)


@router.post("/sign-in", response_model=SignedIn)
async def sign_in(request: Request, response: Response, db: Database):
    email, password = await read_credentials(request)
    await limit_attempts(request, email)
    account = await db.scalar(select(Account).where(Account.email == email))
    async with hash_slots:
        matched = await run_in_threadpool(password_hasher.verify, password, (account.password_hash if account else None) or dummy_hash)
    if not account or not account.password_hash or not matched:
        raise HTTPException(401, "The email or password is incorrect.")
    response.headers["Cache-Control"] = "no-store"
    return await create_session(account, db)


@router.get("/session", response_model=AccountDetails)
async def get_account(response: Response, auth: ActiveSession, db: Database):
    account = await db.get(Account, auth.account_id)
    if not account:
        raise HTTPException(401, "Sign in to continue.")
    response.headers["Cache-Control"] = "no-store"
    return AccountDetails(email=account.email)


@router.post("/sign-out", status_code=204)
async def sign_out(auth: ActiveSession, db: Database):
    await db.execute(delete(AccountSession).where(AccountSession.token_digest == auth.token_digest))
    await db.commit()
    return Response(status_code=204)
