# ⚒️ XbarzForge

> **Forge Better Code. Build Smarter.**

<p align="center">
  <img src="artifacts/xbarzforge/public/logo.svg" alt="XbarzForge Logo" width="140"/>
</p>

**XbarzForge** is an AI-powered developer platform that helps developers understand, analyze, document, and explore software projects using natural language.

Built for **OpenAI Build Week 2026**, XbarzForge acts as your codebase's second brain—making it easier to understand unfamiliar repositories, generate documentation, detect issues, and improve developer productivity.

---

## 🚀 OpenAI Build Week 2026

This project was built as a submission for **OpenAI Build Week 2026**.

The goal was to create a practical AI developer tool that demonstrates how modern AI can improve software engineering workflows while remaining production-ready and deployable.

---

# ✨ Features

### 🤖 AI Code Analysis
- Repository architecture overview
- Language & framework detection
- Bug detection
- Security recommendations
- Performance suggestions
- Code quality scoring
- Best practice recommendations

### 💬 AI Chat
Ask questions about an entire codebase using natural language.

Examples:

- Explain this project
- Where is authentication implemented?
- How can I optimize performance?
- Find possible bugs
- Generate onboarding documentation

### 📚 Documentation Generator

Automatically generate:

- README files
- API Documentation
- Architecture Documentation
- Setup Guides
- Onboarding Guides

### 📂 Project Management

Analyze projects through:

- GitHub Repository
- ZIP Upload
- Source Code Upload
- Code Paste

### 🔍 Global Search

Search across:

- Projects
- Documentation
- Conversations
- Generated AI Results

### 🔐 Authentication

Powered by Clerk

- Email Authentication
- Google Login
- GitHub Login
- Password Reset
- Secure Sessions
- Protected Routes

### ⚡ Graceful Degradation

Even without an OpenAI API key:

- Application still runs
- Authentication works
- Projects work
- Search works
- Uploads work

Only AI-powered features are disabled.

---

# 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 19 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Authentication | Clerk |
| AI | OpenAI GPT Models |
| API | OpenAPI 3.1 |
| Code Generation | Orval |

---

# 📁 Project Structure

```
xbarzforge/
│
├── artifacts/
│   ├── api-server/
│   └── xbarzforge/
│
├── lib/
│   ├── db/
│   ├── api-spec/
│   ├── api-client-react/
│   └── api-zod/
│
├── scripts/
├── render.yaml
├── README.md
└── .env.example
```

---

# ⚙️ Local Development

## 1. Clone

```bash
git clone https://github.com/adisar6402/XbarzForge.git

cd XbarzForge
```

---

## 2. Install Dependencies

```bash
pnpm install
```

---

## 3. Configure Environment

```bash
cp .env.example .env
```

Fill in the required values.

---

## 4. Push Database

```bash
pnpm --filter @workspace/db run push
```

---

## 5. Generate API Types

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## 6. Start Development

### Terminal 1

```bash
pnpm --filter @workspace/api-server dev
```

### Terminal 2

```bash
pnpm --filter @workspace/xbarzforge dev
```

---

# 🚀 Production Build

Build frontend

```bash
pnpm --filter @workspace/xbarzforge build
```

Build backend

```bash
pnpm --filter @workspace/api-server build
```

Start production server

```bash
node artifacts/api-server/dist/index.mjs
```

---

# 🌍 Deployment

This repository includes a ready-to-use **render.yaml**.

Deploy by:

1. Push repository to GitHub
2. Create a new Render Web Service
3. Connect GitHub
4. Render detects `render.yaml`
5. Add environment variables
6. Deploy

---

# 🔑 Environment Variables

See `.env.example` for the complete reference.

Important variables include:

- DATABASE_URL
- CLERK_SECRET_KEY
- CLERK_PUBLISHABLE_KEY
- VITE_CLERK_PUBLISHABLE_KEY
- SESSION_SECRET

### Optional

```
OPENAI_API_KEY
```

Without it:

- AI analysis is disabled
- AI chat is disabled
- Documentation generation is disabled

Everything else continues working normally.

---

# 🔐 Authentication

Authentication is powered by **Clerk**.

Features include:

- Email Sign Up
- Email Sign In
- Google Login
- GitHub Login
- Password Reset
- Secure Sessions
- Route Protection

---

# 🤖 AI Features

When an OpenAI API key is configured, XbarzForge can:

- Analyze repositories
- Generate documentation
- Explain architecture
- Detect bugs
- Suggest improvements
- Answer questions about uploaded projects

If no API key is configured, the application continues functioning normally while AI-specific features remain unavailable.

---

# 📱 Progressive Web App (PWA)

XbarzForge is configured as a Progressive Web App.

Features include:

- Installable on desktop and mobile
- Custom branding
- Custom favicon
- Web Manifest
- Open Graph metadata
- Twitter Card metadata
- Offline landing page support

---

# 🎯 Roadmap

- Repository indexing
- Multi-repository workspaces
- AI commit summaries
- Pull request reviews
- Team collaboration
- Semantic code search
- GitHub App integration
- AI code generation
- Repository insights dashboard

---

# 👨‍💻 Author

**Abdulrahman Adisa Amuda**

**RahmanXBarz**

GitHub:
https://github.com/adisar6402

---

# 🏆 OpenAI Build Week 2026

XbarzForge was proudly built for **OpenAI Build Week 2026** as an AI-powered developer platform focused on making software engineering faster, smarter, and more accessible.

---

# 📄 License

MIT License

Copyright © 2026 Abdulrahman Adisa Amuda

---

<p align="center">
Built with ❤️, TypeScript, React, Clerk, PostgreSQL, and OpenAI.
</p>
