# ⚒️ XbarzForge

> **Forge Better Code. Build Smarter.**

<p align="center">

![Build](https://img.shields.io/badge/OpenAI-Build%20Week%202026-412991?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</p>

<p align="center">
<img src="./public/og-image.png" alt="XbarzForge Banner" width="850"/>
</p>

<p align="center">

## 🌐 Live Demo

**https://xbarzforge.onrender.com**

</p>

---

# 📖 Table of Contents

- About
- OpenAI Build Week
- Features
- Tech Stack
- Screenshots
- Project Structure
- Local Development
- Production Build
- Deployment
- Environment Variables
- Progressive Web App
- Roadmap
- Author
- Acknowledgements
- License

---

# 🧠 About

**XbarzForge** is an AI-powered developer platform that helps software engineers understand, analyze, document, and explore codebases using natural language.

Built for **OpenAI Build Week 2026**, XbarzForge acts as a developer's second brain by making unfamiliar repositories easier to understand through AI-assisted analysis, documentation, intelligent search, and developer tooling.

The platform focuses on improving developer productivity while remaining production-ready, responsive, and installable as a Progressive Web App (PWA).

---

# 🚀 OpenAI Build Week 2026

This project was created as an official submission for **OpenAI Build Week 2026**.

The goal was to build a practical AI-powered developer tool capable of solving real engineering problems while demonstrating thoughtful product design, modern web architecture, and production readiness.

---

# ✨ Features

## 🤖 AI Code Analysis

Analyze repositories and receive:

- Repository architecture overview
- Programming language detection
- Framework detection
- Code quality insights
- Bug detection
- Security recommendations
- Performance suggestions
- Engineering best practices

---

## 💬 AI Codebase Chat

Interact with your project using natural language.

Example prompts:

- Explain this repository
- How is authentication implemented?
- Where is database logic located?
- Suggest performance improvements
- Find potential bugs
- Generate onboarding documentation

---

## 📚 AI Documentation Generator

Generate:

- README files
- API documentation
- Setup guides
- Architecture documentation
- Developer onboarding guides

---

## 📂 Project Import

Supports:

- GitHub repositories
- ZIP uploads
- Source code uploads
- Individual code snippets

---

## 🔍 Global Search

Search across:

- Projects
- Documentation
- Conversations
- AI generated content

---

## 🔐 Authentication

Powered by Clerk.

Features include:

- Email authentication
- Google Sign-In
- GitHub Sign-In
- Password reset
- Protected routes
- Secure sessions

---

## ⚡ Graceful AI Degradation

XbarzForge continues functioning even when an OpenAI API key is unavailable.

Available:

- Authentication
- Project management
- Search
- Upload workflows
- User dashboard

Unavailable without AI credentials:

- AI repository analysis
- AI documentation generation
- AI code explanations
- AI conversations

---

# 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Authentication | Clerk |
| AI | OpenAI API |
| Deployment | Render |
| PWA | vite-plugin-pwa |

---

# 📸 Screenshots

## Desktop

![Desktop Screenshot](./screenshots/desktop-wide.png)

---

## Mobile

![Mobile Screenshot](./screenshots/mobile.png)

---

# 📁 Project Structure

```text
XbarzForge/

├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── main.tsx
│
├── public/
│   ├── manifest.webmanifest
│   ├── favicon
│   ├── icons
│   └── assets
│
├── api-client-react/
├── artifacts/
├── package.json
├── vite.config.ts
├── render.yaml
└── README.md
```

---

# ⚙️ Local Development

## Clone Repository

```bash
git clone https://github.com/adisar6402/XbarzForge.git

cd XbarzForge
```

---

## Install Dependencies

```bash
pnpm install
```

---

## Configure Environment Variables

Create a `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
SESSION_SECRET=
OPENAI_API_KEY=
```

---

## Start Development Server

```bash
pnpm run dev
```

Application runs at:

```
http://localhost:5173
```

---

# 🏗 Production Build

Build:

```bash
pnpm run build
```

Preview:

```bash
pnpm run preview
```

---

# 🌍 Deployment

XbarzForge is deployed on **Render**.

### Live Application

https://xbarzforge.onrender.com

Deployment steps:

1. Push repository to GitHub
2. Connect repository to Render
3. Configure environment variables
4. Deploy

---

# 🔑 Environment Variables

Required:

```
DATABASE_URL
CLERK_SECRET_KEY
VITE_CLERK_PUBLISHABLE_KEY
SESSION_SECRET
```

Optional:

```
OPENAI_API_KEY
```

The OpenAI API key enables:

- AI repository analysis
- AI codebase chat
- AI documentation generation
- AI explanations

Without it, the application remains fully functional while AI-specific features are gracefully disabled.

---

# 📱 Progressive Web App

XbarzForge supports Progressive Web App capabilities.

Features include:

- Installable application
- Mobile support
- Desktop support
- Offline-ready landing experience
- Web App Manifest
- Service Worker
- Custom icons
- Native-like experience

---

# 🎯 Roadmap

Planned improvements:

- Repository indexing
- Semantic code search
- AI pull request reviews
- AI commit summaries
- Team collaboration
- GitHub App integration
- Repository intelligence dashboard
- Multi-project workspace support

---

# 👨‍💻 Author

**Abdulrahman Adisa Amuda**

**RahmanXBarz**

GitHub:

https://github.com/adisar6402

Live Demo:

https://xbarzforge.onrender.com

---

# 🙏 Acknowledgements

Built for **OpenAI Build Week 2026**.

Special thanks to:

- OpenAI
- Clerk
- React
- Vite
- Tailwind CSS
- Drizzle ORM
- PostgreSQL
- The Open Source Community

---

# 📄 License

MIT License

Copyright © 2026 Abdulrahman Adisa Amuda

---

<p align="center">

Built with ❤️ using **TypeScript**, **React**, **Node.js**, **Clerk**, **PostgreSQL**, **Drizzle ORM**, and **OpenAI**.

### Forge Better Code. Build Smarter.

</p>
