# XbarzForge — Local Development & Deployment Setup

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| pnpm | ≥ 9 | `npm install -g pnpm@9` |
| PostgreSQL | ≥ 15 | [postgresql.org](https://www.postgresql.org) or any managed provider |
| Git | any | [git-scm.com](https://git-scm.com) |

> **Important:** This project uses pnpm workspaces. `npm install` is blocked by a preinstall guard. Always use `pnpm`.

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/your-username/xbarzforge.git
cd xbarzforge
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in every required variable. See [DEPLOYMENT.md](./DEPLOYMENT.md) for where to obtain each one.

Minimum required for local dev:
- `DATABASE_URL` — a local or remote PostgreSQL connection string
- `CLERK_SECRET_KEY` — from [clerk.com](https://clerk.com)
- `CLERK_PUBLISHABLE_KEY` — from [clerk.com](https://clerk.com)
- `VITE_CLERK_PUBLISHABLE_KEY` — same value as `CLERK_PUBLISHABLE_KEY`
- `SESSION_SECRET` — any random 64-char hex string

Optional:
- `OPENAI_API_KEY` — required only for AI features

### 4. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

This applies all Drizzle schema definitions to your PostgreSQL database. Safe to re-run — it is additive only.

### 5. Generate the API client

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates `lib/api-client-react/` and `lib/api-zod/` from `lib/api-spec/openapi.yaml`. Re-run whenever the API spec changes.

### 6. Start the development servers

Open two terminals:

**Terminal 1 — API server:**
```bash
PORT=8080 pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Frontend:**
```bash
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/xbarzforge run dev
```

The frontend will be available at `http://localhost:3000`.
The API server listens at `http://localhost:8080`.

> The frontend proxies all `/api` requests to `http://localhost:8080` via Vite's dev server (configured in `vite.config.ts`).

---

## Production Build

```bash
# Build the frontend
BASE_PATH=/ pnpm --filter @workspace/xbarzforge run build

# Build the API server
pnpm --filter @workspace/api-server run build
```

### Start in production mode

```bash
NODE_ENV=production \
  PORT=8080 \
  STATIC_DIR=artifacts/xbarzforge/dist/public \
  node artifacts/api-server/dist/index.mjs
```

The Express server will serve both the API (`/api/*`) and the built React frontend (everything else), including SPA fallback routing.

---

## Database Migrations

XbarzForge uses **Drizzle ORM** with a `push`-based workflow (no migration files):

```bash
# Apply schema to development database
pnpm --filter @workspace/db run push

# Apply schema to a different database (e.g., production)
DATABASE_URL=postgresql://... pnpm --filter @workspace/db run push
```

To generate SQL migration files instead (optional):
```bash
pnpm --filter @workspace/db run generate
```

---

## GitHub Setup

1. Create a new GitHub repository.
2. Push the project:
   ```bash
   git remote add origin https://github.com/your-username/xbarzforge.git
   git push -u origin main
   ```
3. Verify that `.env` is listed in `.gitignore` (it is by default) before pushing.

### GitHub Actions (optional)

Add a `.github/workflows/ci.yml` to run typecheck and build on every push:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @workspace/api-spec run codegen
      - run: pnpm run typecheck
      - run: BASE_PATH=/ pnpm --filter @workspace/xbarzforge run build
      - run: pnpm --filter @workspace/api-server run build
```

---

## Render Deployment

### One-time setup

1. Push the repository to GitHub.
2. Go to [render.com](https://render.com) → **New → Web Service** → connect your GitHub repo.
3. Render detects `render.yaml` automatically and pre-fills the settings.
4. Set all required environment variables in the Render dashboard (see [DEPLOYMENT.md](./DEPLOYMENT.md)).
5. Click **Deploy**.

### Required environment variables on Render

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Add a Render PostgreSQL database or use an external provider |
| `CLERK_SECRET_KEY` | From Clerk dashboard |
| `CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `VITE_CLERK_PUBLISHABLE_KEY` | **Must match** `CLERK_PUBLISHABLE_KEY`; embedded at build time |
| `SESSION_SECRET` | Generate locally, paste into Render |
| `OPENAI_API_KEY` | Optional; enables AI features |

`NODE_ENV=production` and `STATIC_DIR` are set automatically by `render.yaml`.

### After deploy

1. Note your Render service URL (e.g., `https://xbarzforge.onrender.com`).
2. Add it to Clerk: **Dashboard → Domains → Add domain**.
3. Push the schema to the production database:
   ```bash
   DATABASE_URL=<render-postgres-url> pnpm --filter @workspace/db run push
   ```

---

## Workspace Package Scripts

| Command | Description |
|---|---|
| `pnpm install` | Install all dependencies |
| `pnpm run build` | Build all artifacts |
| `pnpm run typecheck` | Type-check all packages |
| `pnpm --filter @workspace/db run push` | Apply DB schema |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API client & validators |
| `pnpm --filter @workspace/xbarzforge run dev` | Start frontend dev server |
| `pnpm --filter @workspace/api-server run dev` | Start API dev server |
| `pnpm --filter @workspace/xbarzforge run build` | Build frontend |
| `pnpm --filter @workspace/api-server run build` | Build API server |

---

## Troubleshooting

**`npm install` fails** — This project requires pnpm. Run `npm install -g pnpm@9` first, then `pnpm install`.

**`VITE_CLERK_PUBLISHABLE_KEY` missing at build time** — Set this env var before running `vite build`. It is embedded into the JS bundle and cannot be changed at runtime.

**Database connection errors** — Verify `DATABASE_URL` is a valid PostgreSQL connection string. For local dev, ensure PostgreSQL is running. For production, check the Render database is in the same region as the web service.

**AI features return 503** — Set `OPENAI_API_KEY` in your environment. All other features continue to work without it.

**Clerk redirect loop** — Ensure your production URL is added to Clerk's allowed domains. The Replit development key only works on `.replit.dev` and `localhost` domains.
