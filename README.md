# T3 Code starter

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
- `GET /v1/projects` and `POST /v1/projects`
- `POST /v1/chat` creates or continues a saved conversation

Development requests use `X-User-ID` as a temporary local identity. Production mode rejects API requests until a real OIDC/JWT identity provider is wired in. The sample UI sends a local development identity; never use that identity scheme for deployed users.

## Scaling path

The API is stateless between requests, uses async I/O, bounded Postgres connection pools, shared Redis counters, and externalized conversation state. Run multiple API replicas behind a load balancer and size each replica's DB pool against the Postgres connection budget. The current pool is 20 connections plus 10 overflow per process. Keep model calls outside database transactions and move repository cloning/indexing into a durable worker queue before enabling it for users. A 1,000-user target needs load testing against the selected model provider, database, and deployment limits; this starter does not claim a measured capacity yet.

Before production, configure authentication and production secrets, run `alembic upgrade head` as a release step, add a durable job queue for indexing, and test capacity with realistic traffic. `APP_ENV=production` enables trusted-host checks and disables development identity.
