# 🎬 CreatorAI Studio

**AI-powered content creation platform — your complete AI employee for social media.**

Type one command like *"Create 10 YouTube Shorts about electric cars"* and the platform automatically researches trends, writes scripts, generates visuals, voiceovers, subtitles, music, thumbnails, SEO metadata, and exports final videos ready for publishing.

---

## 🏗️ Architecture

CreatorAI Studio follows an **Agent-Oriented Architecture (AOA)** where each AI capability is an autonomous agent composed into pipelines via a DAG-based orchestration engine.

```
┌─────────────────────────────┐
│    Next.js App (Frontend)    │
├─────────────────────────────┤
│   Express.js API Gateway     │
├─────────────────────────────┤
│   Pipeline Orchestrator      │
│   (DAG-based execution)      │
├─────────────────────────────┤
│   AI Agents (11 agents)      │
│   Trend│Script│Image│Voice│… │
├─────────────────────────────┤
│   Provider Abstraction       │
│   OpenAI│Replicate│ElevenLabs│
├─────────────────────────────┤
│   Firebase (Auth│DB│Storage) │
└─────────────────────────────┘
```

## 📦 Monorepo Structure

```
creatorai-studio/
├── apps/
│   ├── web/          → Next.js 14 frontend (React, TypeScript, Tailwind)
│   └── server/       → Express.js API server
├── packages/
│   ├── shared/       → Types, enums, validators, utilities
│   ├── agents/       → AI agent framework (BaseAgent, Registry)
│   ├── providers/    → AI provider abstractions (LLM, Image, Video, Voice)
│   ├── orchestrator/ → Pipeline engine (DAG runner, event bus, templates)
│   └── database/     → Firestore repositories, Storage service
└── docs/             → Architecture, API, Database, Agent documentation
```

## 🤖 AI Agents

| Agent | Purpose | Providers |
|-------|---------|-----------|
| **Trend** | Research viral topics | SerpAPI, Reddit, YouTube |
| **Script** | Write professional scripts | OpenAI, Anthropic |
| **Prompt** | Generate AI image/video prompts | OpenAI, Anthropic |
| **Image** | Generate scene images | Replicate (Flux), DALL-E 3 |
| **Video** | Generate video clips | Runway Gen-3, Replicate |
| **Voice** | Generate voiceover narration | ElevenLabs, OpenAI TTS |
| **Editor** | Compose final video | FFmpeg |
| **Thumbnail** | Generate high-CTR thumbnails | Replicate, DALL-E 3 |
| **SEO** | Generate titles, descriptions, tags | OpenAI, Anthropic |
| **Publishing** | Publish to social platforms | YouTube, IG, TikTok APIs |
| **Analytics** | Track content performance | Platform Analytics APIs |

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand, TanStack Query
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Storage:** Firebase Storage
- **Build:** Turborepo, pnpm workspaces
- **Deployment:** Vercel (web), Firebase (server)

## 🚀 Getting Started

```bash
# Prerequisites: Node.js 20+, pnpm 9+

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Fill in your API keys

# Start development
pnpm dev
```

## 📖 Documentation

- [Architecture](./docs/ARCHITECTURE.md) — System design, patterns, scalability
- [API Reference](./docs/API.md) — Complete endpoint documentation
- [Agents](./docs/AGENTS.md) — Agent interface, I/O specs, strategies
- [Database](./docs/DATABASE.md) — Firestore schema, indexes, queries
- [Development](./docs/DEVELOPMENT.md) — Setup, ADRs, conventions

## 📋 Implementation Phases

- [x] Phase 0: Architecture Blueprint
- [x] Phase 1: Foundation (monorepo, types, base classes, server, frontend shell)
- [x] Phase 1.5: AI Infrastructure (logger, prompt manager, cost tracker, circuit breaker, SSE, job queue)
- [x] Phase 2: Core Agents + Providers (Script, Prompt, Image, Voice agents + OpenAI, Replicate, ElevenLabs providers)
- [x] Phase 3: AI Orchestration Layer (Intent parser, Planner, Workflow DAG, Artifact manager, Executor, Conversation orchestrator)
- [x] Phase 4: Project Management & Asset Pipeline (Project service, Asset service, Storage abstraction, Version control, Media library, Review & approval, Timeline, API endpoints)

- [x] Phase 5: Workspaces, AI Memory & Observability (RBAC, brand profiles, memory loader, metrics collector, audit system, dashboard APIs)
- [x] Phase 6: Creator Workspace Frontend (Design system, SSE hook, Chat with workflow progress, Projects, Media Library, Brand management, AI Memory, Monitoring dashboard)
- [ ] Phase 6: Publishing & SEO
- [x] Phase 7: Production Hardening (Codebase audit, test suite, CI/CD, Docker, security middleware, API docs, release documentation)
- [ ] Phase 8: Advanced Features (multi-agent, AI memory, calendar)

---

*Built with the philosophy that every AI capability should be an autonomous, testable, swappable agent.*
