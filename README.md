# readcode starter

A fresh dark coding workspace with a Next.js UI and a separate async Python API. The API already supports tenant-scoped project records, saved conversations, OpenAI-compatible chat, Postgres persistence, Redis rate limiting, readiness checks, and versioned database migrations.

## Run locally

1. Start the Python API (PowerShell):

   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   Copy-Item .env.example .env
   # Add your model-provider key to backend/.env
   uvicorn app.main:app --reload
   ```

2. In a second terminal, start the UI from the repository root:

   ```powershell
   npm run dev
   ```

3. Open `http://localhost:3000`. The API docs are at `http://localhost:8000/docs`.

For an API-only local run, SQLite is created in `backend/data/readcode.db`. Set `OPENAI_API_KEY` in `backend/.env` to enable assistant replies.

## Postgres and Redis

Run `docker compose up --build` from the repository root. This starts Postgres, Redis, and the API. Then run `npm run dev` in another terminal for the UI. Set `OPENAI_API_KEY` in the shell before starting Compose to enable chat:

```powershell
$env:OPENAI_API_KEY = "your-key"
docker compose up --build
```

## API surface

- `GET /health/live` and `GET /health/ready`
- `POST /v1/auth/sign-up`, `POST /v1/auth/sign-in`, `GET /v1/auth/session`, and `POST /v1/auth/sign-out`
- `GET /v1/projects` and `POST /v1/projects`
- `POST /v1/chat` creates or continues a saved conversation

Open `/sign-up` to make an email and password account, or `/sign-in` to resume a session. The Next.js server calls FastAPI at `http://127.0.0.1:8000` by default and keeps the session token in an HTTP-only cookie. Set `READCODE_API_URL` on the Next.js server if FastAPI runs elsewhere. Set `READCODE_APP_ORIGIN` to the public HTTPS origin when running behind a reverse proxy.

API clients can send the token from sign-in or sign-up as `Authorization: Bearer <token>`. Projects and conversations are scoped to the account. Development API clients can still use a temporary `X-User-ID` for existing local data. Use HTTPS and set `REDIS_URL` for production account-attempt limits.

### Google and GitHub sign-in

1. Register a [Google web OAuth client](https://developers.google.com/identity/openid-connect/openid-connect) and a [GitHub OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app). For local development, register these callback URLs:

   | Provider | Callback URL |
   | --- | --- |
   | Google | `http://localhost:3000/api/account/oauth/google/callback` |
   | GitHub | `http://localhost:3000/api/account/oauth/github/callback` |

2. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET` in `backend/.env`. Set `OAUTH_APP_ORIGIN` to the frontend origin, and register callbacks on that same origin. On a deployed frontend, set `READCODE_APP_ORIGIN` to match. Use HTTPS outside local development.
3. Run `alembic upgrade head` on a database already managed by Alembic. Restart FastAPI. For Compose, use `docker compose --env-file backend/.env up --build` to pass in the OAuth settings.

An account created with a provider signs in with that provider. If the email is already registered with another method, users are prompted to use their original method.

## Scaling path

The API is stateless between requests, uses async I/O, bounded Postgres connection pools, shared Redis counters, and externalized conversation state. Run multiple API replicas behind a load balancer and size each replica's DB pool against the Postgres connection budget. The current pool is 20 connections plus 10 overflow per process. Keep model calls outside database transactions and move repository cloning/indexing into a durable worker queue before enabling it for users. A 1,000-user target needs load testing against the selected model provider, database, and deployment limits; this starter does not claim a measured capacity yet.

Before production, configure production secrets, run `alembic upgrade head` as a release step, add a durable job queue for indexing, and test capacity with realistic traffic. `APP_ENV=production` enables trusted-host checks and disables development identity.
