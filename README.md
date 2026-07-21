# XbarzForge

> **Forge Better Code. Build Smarter.**

XbarzForge is an AI-powered developer platform — your codebase's second brain. It helps developers understand unfamiliar codebases, detect bugs, generate documentation, analyze project architecture, and interact with software projects using natural language.

Built for **OpenAI Build Week 2026** by [Abdulrahman Adisa Amuda (RahmanXBarz)](https://github.com/RahmanXBarz).

---

## Features

- **AI Code Analysis** — Architecture overview, language/framework detection, bug detection, security analysis, performance suggestions, code quality score (1–10), and best practices
- **AI Chat** — Streaming GPT-4o chat with full project context
- **Documentation Generator** — Auto-generate README, API docs, architecture docs, setup guides, and onboarding guides
- **Project Management** — GitHub URL analysis, code paste, or file/ZIP upload
- **Global Search** — Search across projects, documentation, and AI conversations
- **Secure Auth** — Clerk with email/password, social login, forgot-password flow, and logout
- **Graceful Degradation** — App runs fully without an OpenAI key; only AI features are disabled

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js + Express, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Authentication | Clerk |
| AI | OpenAI GPT-4o |
| API Contract | OpenAPI 3.1 + Orval (codegen) |

---

## Prerequisites

- **Node.js 20+**
- **pnpm 9+** — this is a pnpm workspace; npm workspaces are not supported

```bash
npm install -g pnpm@9
```

- **PostgreSQL** — local install or a managed service (Render, Neon, Supabase)
- **Clerk account** — [create a free app at clerk.com](https://clerk.com) and copy the API keys
- **OpenAI API key** *(optional)* — [get one here](https://platform.openai.com/api-keys). Without it the app runs normally, only AI features are hidden.

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/RahmanXBarz/xbarzforge
cd xbarzforge
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env and fill in DATABASE_URL, CLERK_*, VITE_CLERK_PUBLISHABLE_KEY,
# SESSION_SECRET, and optionally OPENAI_API_KEY
```

### 3. Push database schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Generate TypeScript types from the OpenAPI spec

```bash
pnpm --filter @workspace/api-spec run codegen
```

### 5. Start both servers

Open two terminals:

```bash
# Terminal 1 — API server (default port 8080)
PORT=8080 pnpm --filter @workspace/api-server run dev

# Terminal 2 — React frontend (PORT assigned from your env)
BASE_PATH=/ PORT=3000 pnpm --filter @workspace/xbarzforge run dev
```

The frontend will be available at **http://localhost:3000** and calls the API at **http://localhost:8080/api**.

> **Note:** Set `VITE_API_BASE_URL=http://localhost:8080` if your frontend and API run on different ports.

---

## Production Build

```bash
# Build the frontend (outputs to artifacts/xbarzforge/dist/public)
BASE_PATH=/ pnpm --filter @workspace/xbarzforge run build

# Build the API server (outputs to artifacts/api-server/dist/index.mjs)
pnpm --filter @workspace/api-server run build

# Start the production server (serves API + frontend)
NODE_ENV=production PORT=8080 node artifacts/api-server/dist/index.mjs
```

---

## Deploy to Render

This repository includes a `render.yaml` for one-click deployment on [Render](https://render.com).

### Steps

1. Push this repo to GitHub
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New → Web Service**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and pre-fill the build and start commands
5. Add the following environment variables in the Render dashboard:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string — provision a Render PostgreSQL database and it fills automatically |
| `CLERK_SECRET_KEY` | ✅ | From Clerk Dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | ✅ | From Clerk Dashboard → API Keys |
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ | Same value as `CLERK_PUBLISHABLE_KEY` (exposed to the frontend) |
| `SESSION_SECRET` | ✅ | Random 64-char hex string |
| `OPENAI_API_KEY` | Optional | Without this, AI features are disabled but the rest of the app works |
| `NODE_ENV` | auto | Set to `production` in `render.yaml` |
| `STATIC_DIR` | auto | Set to `artifacts/xbarzforge/dist/public` in `render.yaml` |

6. Click **Deploy**

### Clerk configuration for Render

When deploying outside Replit, you need your **own** Clerk application:
1. Create a new application at [clerk.com](https://clerk.com)
2. Under **Domains**, add your Render URL (e.g. `https://xbarzforge.onrender.com`)
3. Copy **Publishable Key** and **Secret Key** to the Render environment variables

---

## Environment Variables

See [`.env.example`](.env.example) for the full reference with descriptions.

**Key variables:**

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | ✅ | — | Clerk server-side key |
| `CLERK_PUBLISHABLE_KEY` | ✅ | — | Clerk client-side key (server) |
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ | — | Clerk client-side key (frontend build) |
| `SESSION_SECRET` | ✅ | — | Session encryption secret |
| `OPENAI_API_KEY` | Optional | — | Enables AI features |
| `PORT` | Optional | `8080` | API server port |
| `BASE_PATH` | Optional | `/` | Frontend base URL path |
| `NODE_ENV` | Optional | `development` | Controls logging and static serving |
| `STATIC_DIR` | Optional | `artifacts/xbarzforge/dist/public` | Frontend build dir (production only) |

---

## Project Structure

```
xbarzforge/
├── artifacts/
│   ├── api-server/          # Express API server
│   │   └── src/
│   │       ├── routes/      # API route handlers
│   │       ├── lib/         # OpenAI, DB, logger utilities
│   │       └── middlewares/ # Auth, Clerk proxy
│   └── xbarzforge/          # React + Vite frontend
│       └── src/
│           ├── pages/       # Page components
│           ├── components/  # Shared UI components
│           └── App.tsx      # Router + Clerk setup
├── lib/
│   ├── db/                  # Drizzle ORM schema + migrations
│   ├── api-spec/            # OpenAPI 3.1 specification
│   ├── api-client-react/    # Generated React Query hooks (codegen output)
│   └── api-zod/             # Generated Zod schemas (codegen output)
├── render.yaml              # Render.com deployment config
├── .env.example             # Environment variable reference
└── README.md
```

---

## Authentication

Authentication is handled entirely by [Clerk](https://clerk.com):

- **Sign Up / Sign In** — Email + password, Google, GitHub
- **Forgot Password** — Built into the Clerk sign-in component; sends a reset email automatically
- **Logout** — Available in the sidebar user menu (all pages) and clears all session state
- **Protected routes** — Any unauthenticated access redirects to the landing page
- **Session persistence** — Maintained across browser refreshes via Clerk session tokens

---

## AI Graceful Degradation

If `OPENAI_API_KEY` is not configured:

- The app loads and runs normally
- Authentication, projects, search, file uploads, and navigation all work
- AI-powered actions (Analyze, Generate Docs, Chat) show a clear disabled message
- No crashes, blank screens, or broken navigation

The API server detects the missing key at startup via `GET /api/status` → `{ aiEnabled: false }`.

---

## License

MIT © 2026 Abdulrahman Adisa Amuda (RahmanXBarz)
