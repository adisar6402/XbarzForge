# XbarzForge — Deployment Guide

This document covers every environment variable used by the application, how to obtain each one, and which service provides it.

---

## Environment Variables

### Required

| Variable | Purpose | Provider | Example |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Render DB / Neon / Supabase | `postgresql://user:pass@host:5432/xbarzforge` |
| `CLERK_SECRET_KEY` | Clerk server-side auth key | [clerk.com](https://clerk.com) | `sk_live_...` |
| `CLERK_PUBLISHABLE_KEY` | Clerk client-side key (used server-side for proxy) | [clerk.com](https://clerk.com) | `pk_live_...` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk key baked into the frontend at build time | [clerk.com](https://clerk.com) | `pk_live_...` |
| `SESSION_SECRET` | Session encryption secret (64-char random hex) | You generate it | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Optional

| Variable | Purpose | Provider | Default |
|---|---|---|---|
| `OPENAI_API_KEY` | Enables AI analysis, chat, and documentation generation. App works without it — AI features gracefully disabled. | [platform.openai.com](https://platform.openai.com/api-keys) | *(unset — AI disabled)* |
| `PORT` | Port the API server listens on | You set it | `8080` |
| `NODE_ENV` | Controls logging verbosity and static file serving | You set it | `development` |
| `BASE_PATH` | Vite base path for frontend build | You set it | `/` |
| `STATIC_DIR` | Path to built frontend files (production only) | You set it | `artifacts/xbarzforge/dist/public` |

---

## Services

### Clerk (Authentication)

1. Create a free application at [clerk.com](https://clerk.com).
2. In **Dashboard → API Keys**, copy:
   - **Publishable key** → `CLERK_PUBLISHABLE_KEY` and `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`
3. In **Dashboard → Domains**, add your production domain (e.g., `https://xbarzforge.onrender.com`).

> **Note for Render:** `VITE_CLERK_PUBLISHABLE_KEY` must be set **before** the frontend is built (it is embedded at build time by Vite). Set it in the Render dashboard environment variables before your first deploy.

### PostgreSQL

Any standard PostgreSQL provider works:

- **Render** — add a Render PostgreSQL database to the same project; `DATABASE_URL` is injected automatically.
- **Neon** — [neon.tech](https://neon.tech) (serverless, free tier available).
- **Supabase** — [supabase.com](https://supabase.com) (use the direct connection string, not the pooler, for migrations).

After provisioning, push the schema:

```bash
pnpm --filter @workspace/db run push
```

### OpenAI (Optional)

1. Create an account at [platform.openai.com](https://platform.openai.com).
2. Generate an API key.
3. Set `OPENAI_API_KEY` in your environment.

Without this key, the application runs normally — all non-AI features (auth, project management, search, navigation) continue to work. AI analysis, chat, and documentation generation return a clear `503` response with an explanatory message.

### Session Secret

Generate a cryptographically secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Vite Build Variables

`VITE_*` variables are **baked into the JavaScript bundle at build time** by Vite. They must be present in the environment when `pnpm --filter @workspace/xbarzforge run build` is executed.

| Variable | When needed |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Build time + runtime |

Runtime-only variables (read by the Express server, not Vite) do **not** need the `VITE_` prefix.

---

## Production Static File Serving

In `NODE_ENV=production`, the Express server serves the built frontend from `STATIC_DIR`. Set:

```
NODE_ENV=production
STATIC_DIR=artifacts/xbarzforge/dist/public
```

SPA fallback is handled automatically — all non-`/api` routes return `index.html`.

---

## Render Deployment

The repository includes a `render.yaml` at the root. Render will auto-detect it.

**Build command** (from `render.yaml`):
```bash
npm install -g pnpm@9 &&
pnpm install --frozen-lockfile &&
pnpm --filter @workspace/api-spec run codegen &&
BASE_PATH=/ pnpm --filter @workspace/xbarzforge run build &&
pnpm --filter @workspace/api-server run build
```

**Start command**:
```bash
node artifacts/api-server/dist/index.mjs
```

**Health check path**: `/api/healthz`

All environment variables listed in the **Required** section must be set in the Render dashboard before the first deploy.

---

## Health Endpoints

| Endpoint | Method | Auth | Response |
|---|---|---|---|
| `/api/healthz` | GET | None | `{ "status": "ok" }` |
| `/api/status` | GET | None | `{ "ok": true, "aiEnabled": true/false }` |

Use `/api/healthz` as the Render health check path (already configured in `render.yaml`).
