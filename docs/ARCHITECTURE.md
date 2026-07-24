# CreatorAI Studio — Master Architecture Document

## 1. System Overview

CreatorAI Studio is a **multi-agent AI orchestration platform** for automated content creation.
It follows an **Agent-Oriented Architecture (AOA)** where each capability is an autonomous agent
that can be composed, chained, and orchestrated through a central pipeline engine.

### Core Architectural Principles

| Principle | Description |
|-----------|-------------|
| **Agent Autonomy** | Each agent is a self-contained service with its own interface, state, and error handling |
| **Pipeline Composition** | Agents are composed into pipelines dynamically based on user intent |
| **Event-Driven Communication** | Agents communicate through an event bus, not direct coupling |
| **Idempotent Operations** | Every agent operation can be retried safely |
| **Progressive Enhancement** | The system works with minimal agents and gains capability as more are added |
| **Provider Abstraction** | AI providers (OpenAI, Replicate, ElevenLabs, etc.) are abstracted behind interfaces |
| **Queue-Based Processing** | Long-running tasks (video gen, image gen) use job queues with status tracking |
| **Graceful Degradation** | If one agent fails, the pipeline continues with fallback strategies |

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  ┌───────────┐  │
│  │  AI Chat UI  │  │ Project Board │  │ Media Editor│  │ Analytics │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  └─────┬─────┘  │
│         └────────────────┼────────────────┼────────────────┘         │
│                          ▼                                           │
│              ┌──────────────────────┐                                │
│              │   Next.js App Router  │                                │
│              │   (API Routes + SSR)  │                                │
│              └──────────┬───────────┘                                │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────┐
│                    API GATEWAY LAYER                                  │
│              ┌──────────▼───────────┐                                │
│              │   Express.js Gateway  │                                │
│              │  ┌─────────────────┐  │                                │
│              │  │ Auth Middleware  │  │                                │
│              │  │ Rate Limiter    │  │                                │
│              │  │ Request Validator│  │                                │
│              │  │ Intent Router   │  │                                │
│              │  └─────────────────┘  │                                │
│              └──────────┬───────────┘                                │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────┐
│                  ORCHESTRATION LAYER                                  │
│              ┌──────────▼───────────┐                                │
│              │   Pipeline Engine     │                                │
│              │  ┌─────────────────┐  │                                │
│              │  │ Intent Parser   │──┼──▶ Understands user command    │
│              │  │ Plan Builder    │──┼──▶ Creates agent execution DAG │
│              │  │ Pipeline Runner │──┼──▶ Executes agents in order    │
│              │  │ State Manager   │──┼──▶ Tracks pipeline state       │
│              │  │ Error Recovery  │──┼──▶ Handles failures/retries    │
│              │  └─────────────────┘  │                                │
│              └──────────┬───────────┘                                │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────┐
│                     AGENT LAYER                                      │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Trend   │ │  Script  │ │  Prompt  │ │  Image   │ │  Video   │  │
│  │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │             │            │             │             │        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Voice   │ │  Editor  │ │Thumbnail │ │   SEO    │ │Publishing│  │
│  │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │             │            │             │             │        │
│  ┌──────────┐                                                        │
│  │Analytics │                                                        │
│  │  Agent   │                                                        │
│  └──────────┘                                                        │
│                                                                      │
│  Each agent implements: IAgent interface                              │
│  Each agent has: execute(), validate(), rollback(), getStatus()      │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────┐
│                   PROVIDER LAYER                                     │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                    Provider Registry                           │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐ │   │
│  │  │ OpenAI  │ │ Anthropic│ │ Replicate│ │ ElevenLabs        │ │   │
│  │  │ GPT-4o  │ │ Claude   │ │ Flux/SDXL│ │ Voice Synthesis   │ │   │
│  │  └─────────┘ └──────────┘ └──────────┘ └───────────────────┘ │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐ │   │
│  │  │ Runway  │ │ Pexels   │ │ SerpAPI  │ │ YouTube Data API  │ │   │
│  │  │ Gen-3   │ │ Stock    │ │ Trends   │ │ Platform APIs     │ │   │
│  │  └─────────┘ └──────────┘ └──────────┘ └───────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Each provider implements: IProvider interface                        │
│  Providers are hot-swappable via configuration                       │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                                 │
│                                                                      │
│  ┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │ Firebase │ │   Firebase   │ │ Firebase │ │   BullMQ / Redis   │  │
│  │ Firestore│ │   Storage    │ │   Auth   │ │   (Job Queue)      │  │
│  └──────────┘ └──────────────┘ └──────────┘ └────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              Event Bus (EventEmitter / Pub-Sub)               │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Project Folder Structure

```
creatorai-studio/
├── apps/
│   ├── web/                          # Next.js frontend application
│   │   ├── app/                      # App Router
│   │   │   ├── (auth)/               # Auth route group
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/          # Main app route group
│   │   │   │   ├── chat/             # AI Chat interface
│   │   │   │   ├── projects/         # Project management
│   │   │   │   ├── editor/           # Media editor
│   │   │   │   ├── library/          # Asset library
│   │   │   │   ├── calendar/         # Content calendar
│   │   │   │   ├── analytics/        # Analytics dashboard
│   │   │   │   ├── settings/         # User settings
│   │   │   │   └── layout.tsx
│   │   │   ├── api/                  # Next.js API routes (BFF)
│   │   │   │   ├── chat/
│   │   │   │   ├── projects/
│   │   │   │   └── webhooks/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI primitives (shadcn/ui)
│   │   │   ├── chat/                 # Chat-specific components
│   │   │   ├── editor/               # Editor-specific components
│   │   │   ├── project/              # Project-specific components
│   │   │   └── shared/               # Shared composite components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Client utilities
│   │   │   ├── firebase.ts           # Firebase client init
│   │   │   ├── api-client.ts         # Type-safe API client
│   │   │   └── utils.ts
│   │   ├── stores/                   # Zustand state stores
│   │   │   ├── auth.store.ts
│   │   │   ├── chat.store.ts
│   │   │   ├── project.store.ts
│   │   │   └── ui.store.ts
│   │   ├── types/                    # Frontend-specific types
│   │   ├── styles/                   # Global styles
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── server/                       # Express.js backend application
│       ├── src/
│       │   ├── index.ts              # Server entry point
│       │   ├── config/
│       │   │   ├── env.ts            # Environment configuration
│       │   │   ├── firebase.ts       # Firebase Admin init
│       │   │   ├── providers.ts      # AI provider configuration
│       │   │   └── constants.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rateLimiter.middleware.ts
│       │   │   ├── validator.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   └── logger.middleware.ts
│       │   ├── routes/
│       │   │   ├── index.ts          # Route registry
│       │   │   ├── chat.routes.ts
│       │   │   ├── project.routes.ts
│       │   │   ├── agent.routes.ts
│       │   │   ├── media.routes.ts
│       │   │   ├── publish.routes.ts
│       │   │   └── analytics.routes.ts
│       │   ├── controllers/
│       │   │   ├── chat.controller.ts
│       │   │   ├── project.controller.ts
│       │   │   ├── agent.controller.ts
│       │   │   └── media.controller.ts
│       │   ├── services/             # Business logic layer
│       │   │   ├── pipeline.service.ts
│       │   │   ├── project.service.ts
│       │   │   ├── media.service.ts
│       │   │   └── user.service.ts
│       │   └── utils/
│       │       ├── logger.ts
│       │       ├── errors.ts
│       │       └── helpers.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                         # Shared packages (monorepo)
│   ├── agents/                       # All AI agents
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── base-agent.ts     # Abstract base agent class
│   │   │   │   ├── agent.interface.ts # IAgent interface
│   │   │   │   ├── agent-registry.ts # Agent discovery & registration
│   │   │   │   └── agent-context.ts  # Shared execution context
│   │   │   ├── trend/
│   │   │   │   ├── trend.agent.ts
│   │   │   │   ├── trend.types.ts
│   │   │   │   ├── strategies/       # Different trend research strategies
│   │   │   │   │   ├── google-trends.strategy.ts
│   │   │   │   │   ├── reddit.strategy.ts
│   │   │   │   │   ├── youtube.strategy.ts
│   │   │   │   │   └── news.strategy.ts
│   │   │   │   └── index.ts
│   │   │   ├── script/
│   │   │   │   ├── script.agent.ts
│   │   │   │   ├── script.types.ts
│   │   │   │   ├── templates/        # Script templates by content type
│   │   │   │   │   ├── storytelling.template.ts
│   │   │   │   │   ├── educational.template.ts
│   │   │   │   │   ├── viral.template.ts
│   │   │   │   │   └── documentary.template.ts
│   │   │   │   └── index.ts
│   │   │   ├── prompt/
│   │   │   │   ├── prompt.agent.ts
│   │   │   │   ├── prompt.types.ts
│   │   │   │   ├── builders/         # Prompt builders per model
│   │   │   │   │   ├── flux.builder.ts
│   │   │   │   │   ├── midjourney.builder.ts
│   │   │   │   │   └── runway.builder.ts
│   │   │   │   └── index.ts
│   │   │   ├── image/
│   │   │   │   ├── image.agent.ts
│   │   │   │   ├── image.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── video/
│   │   │   │   ├── video.agent.ts
│   │   │   │   ├── video.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── voice/
│   │   │   │   ├── voice.agent.ts
│   │   │   │   ├── voice.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── editor/
│   │   │   │   ├── editor.agent.ts
│   │   │   │   ├── editor.types.ts
│   │   │   │   ├── processors/       # Video processing steps
│   │   │   │   │   ├── subtitle.processor.ts
│   │   │   │   │   ├── transition.processor.ts
│   │   │   │   │   ├── music.processor.ts
│   │   │   │   │   └── effects.processor.ts
│   │   │   │   └── index.ts
│   │   │   ├── thumbnail/
│   │   │   │   ├── thumbnail.agent.ts
│   │   │   │   ├── thumbnail.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── seo/
│   │   │   │   ├── seo.agent.ts
│   │   │   │   ├── seo.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── publishing/
│   │   │   │   ├── publishing.agent.ts
│   │   │   │   ├── publishing.types.ts
│   │   │   │   ├── platforms/        # Platform-specific publishers
│   │   │   │   │   ├── youtube.publisher.ts
│   │   │   │   │   ├── instagram.publisher.ts
│   │   │   │   │   ├── tiktok.publisher.ts
│   │   │   │   │   └── linkedin.publisher.ts
│   │   │   │   └── index.ts
│   │   │   ├── analytics/
│   │   │   │   ├── analytics.agent.ts
│   │   │   │   ├── analytics.types.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts              # Agent barrel exports
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── orchestrator/                 # Pipeline orchestration engine
│   │   ├── src/
│   │   │   ├── intent/
│   │   │   │   ├── intent-parser.ts  # NLP intent extraction
│   │   │   │   ├── intent.types.ts
│   │   │   │   └── intent-patterns.ts
│   │   │   ├── planner/
│   │   │   │   ├── plan-builder.ts   # Builds execution DAG
│   │   │   │   ├── plan.types.ts
│   │   │   │   └── templates/        # Pre-built pipeline templates
│   │   │   │       ├── full-video.pipeline.ts
│   │   │   │       ├── thumbnail-only.pipeline.ts
│   │   │   │       ├── script-only.pipeline.ts
│   │   │   │       └── research-only.pipeline.ts
│   │   │   ├── runner/
│   │   │   │   ├── pipeline-runner.ts # Executes the DAG
│   │   │   │   ├── step-executor.ts
│   │   │   │   └── retry-strategy.ts
│   │   │   ├── state/
│   │   │   │   ├── pipeline-state.ts
│   │   │   │   └── state-store.ts
│   │   │   ├── events/
│   │   │   │   ├── event-bus.ts
│   │   │   │   └── event.types.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── providers/                    # AI provider abstractions
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── provider.interface.ts
│   │   │   │   ├── provider-registry.ts
│   │   │   │   └── base-provider.ts
│   │   │   ├── llm/                  # Language model providers
│   │   │   │   ├── openai.provider.ts
│   │   │   │   ├── anthropic.provider.ts
│   │   │   │   └── llm.interface.ts
│   │   │   ├── image/                # Image generation providers
│   │   │   │   ├── replicate.provider.ts
│   │   │   │   ├── openai-dalle.provider.ts
│   │   │   │   └── image.interface.ts
│   │   │   ├── video/                # Video generation providers
│   │   │   │   ├── runway.provider.ts
│   │   │   │   ├── replicate-video.provider.ts
│   │   │   │   └── video.interface.ts
│   │   │   ├── voice/                # Voice synthesis providers
│   │   │   │   ├── elevenlabs.provider.ts
│   │   │   │   ├── openai-tts.provider.ts
│   │   │   │   └── voice.interface.ts
│   │   │   ├── search/               # Search/trend providers
│   │   │   │   ├── serpapi.provider.ts
│   │   │   │   ├── reddit.provider.ts
│   │   │   │   └── search.interface.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared/                       # Shared types, utilities, constants
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── project.types.ts
│   │   │   │   ├── content.types.ts
│   │   │   │   ├── media.types.ts
│   │   │   │   ├── user.types.ts
│   │   │   │   ├── pipeline.types.ts
│   │   │   │   └── api.types.ts
│   │   │   ├── constants/
│   │   │   │   ├── content-types.ts
│   │   │   │   ├── platforms.ts
│   │   │   │   └── agent-ids.ts
│   │   │   ├── utils/
│   │   │   │   ├── validators.ts
│   │   │   │   ├── formatters.ts
│   │   │   │   └── id-generator.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── database/                     # Database schemas & access layer
│       ├── src/
│       │   ├── firestore/
│       │   │   ├── collections.ts    # Collection name constants
│       │   │   ├── converters/       # Firestore data converters
│       │   │   │   ├── project.converter.ts
│       │   │   │   ├── pipeline.converter.ts
│       │   │   │   └── user.converter.ts
│       │   │   └── repositories/     # Data access repositories
│       │   │       ├── project.repository.ts
│       │   │       ├── pipeline.repository.ts
│       │   │       ├── media.repository.ts
│       │   │       └── user.repository.ts
│       │   ├── storage/
│       │   │   ├── storage.service.ts
│       │   │   └── paths.ts          # Storage path conventions
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── tools/                            # Build tools, scripts
│   ├── scripts/
│   │   ├── setup.sh
│   │   ├── seed-db.ts
│   │   └── generate-types.ts
│   └── docker/
│       ├── Dockerfile.server
│       └── docker-compose.yml
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # This file
│   ├── API.md                        # API documentation
│   ├── AGENTS.md                     # Agent documentation
│   ├── DATABASE.md                   # Database schema docs
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── DEVELOPMENT.md               # Developer guide
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── turbo.json                        # Turborepo configuration
├── package.json                      # Root package.json (workspaces)
├── tsconfig.base.json                # Shared TypeScript config
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Database Schema (Firestore)

### Collection: `users`
```
users/{userId}
├── email: string
├── displayName: string
├── photoURL: string | null
├── plan: 'free' | 'pro' | 'enterprise'
├── usage: {
│   ├── videosGenerated: number
│   ├── imagesGenerated: number
│   ├── voiceoversGenerated: number
│   ├── storageUsedBytes: number
│   └── apiCallsThisMonth: number
│   }
├── preferences: {
│   ├── defaultPlatform: string
│   ├── defaultLanguage: string
│   ├── defaultVoice: string
│   └── brandVoice: string | null
│   }
├── connectedAccounts: {
│   ├── youtube: { accessToken, refreshToken, channelId } | null
│   ├── instagram: { ... } | null
│   ├── tiktok: { ... } | null
│   └── ...
│   }
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Collection: `projects`
```
projects/{projectId}
├── userId: string (indexed)
├── title: string
├── description: string
├── status: 'draft' | 'processing' | 'completed' | 'failed' | 'published'
├── contentType: ContentType enum
├── targetPlatforms: string[]
├── originalPrompt: string           # The user's original command
├── settings: {
│   ├── aspectRatio: '16:9' | '9:16' | '1:1'
│   ├── duration: number (seconds)
│   ├── language: string
│   ├── voiceId: string | null
│   ├── musicStyle: string | null
│   ├── artStyle: string | null
│   └── subtitles: boolean
│   }
├── pipelineId: string | null        # Reference to active pipeline
├── createdAt: timestamp
├── updatedAt: timestamp
│
├── [subcollection] scenes/
│   └── scenes/{sceneId}
│       ├── order: number
│       ├── scriptText: string
│       ├── voiceoverUrl: string | null
│       ├── imagePrompt: string | null
│       ├── imageUrl: string | null
│       ├── videoPrompt: string | null
│       ├── videoUrl: string | null
│       ├── duration: number
│       └── transition: string
│
├── [subcollection] assets/
│   └── assets/{assetId}
│       ├── type: 'image' | 'video' | 'audio' | 'thumbnail'
│       ├── url: string
│       ├── storageRef: string
│       ├── metadata: { width, height, duration, format, sizeBytes }
│       └── createdAt: timestamp
│
└── [subcollection] outputs/
    └── outputs/{outputId}
        ├── platform: string
        ├── videoUrl: string
        ├── thumbnailUrl: string
        ├── title: string
        ├── description: string
        ├── tags: string[]
        ├── hashtags: string[]
        ├── publishStatus: 'ready' | 'scheduled' | 'published' | 'failed'
        ├── scheduledAt: timestamp | null
        ├── publishedAt: timestamp | null
        └── platformPostId: string | null
```

### Collection: `pipelines`
```
pipelines/{pipelineId}
├── projectId: string (indexed)
├── userId: string (indexed)
├── status: 'queued' | 'running' | 'paused' | 'completed' | 'failed'
├── currentStep: string
├── progress: number (0-100)
├── plan: {                           # The execution plan (DAG)
│   ├── steps: [
│   │   {
│   │       id: string,
│   │       agentId: string,
│   │       status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped',
│   │       input: object,
│   │       output: object | null,
│   │       error: string | null,
│   │       startedAt: timestamp | null,
│   │       completedAt: timestamp | null,
│   │       retryCount: number,
│   │       dependsOn: string[]       # IDs of steps this depends on
│   │   }
│   │]
│   └── metadata: object
│   }
├── error: { message, step, timestamp } | null
├── startedAt: timestamp
├── completedAt: timestamp | null
└── updatedAt: timestamp
```

### Collection: `conversations`
```
conversations/{conversationId}
├── userId: string (indexed)
├── projectId: string | null
├── messages: [
│   {
│       id: string,
│       role: 'user' | 'assistant' | 'system',
│       content: string,
│       metadata: {
│           intent: string | null,
│           pipelineId: string | null,
│           attachments: string[]
│       },
│       timestamp: timestamp
│   }
│]
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Collection: `schedules`
```
schedules/{scheduleId}
├── userId: string (indexed)
├── projectId: string
├── outputId: string
├── platform: string
├── scheduledAt: timestamp (indexed)
├── status: 'pending' | 'published' | 'failed'
├── publishedAt: timestamp | null
└── createdAt: timestamp
```

---

## 5. API Design

### Base URL: `/api/v1`

### Authentication
All endpoints require `Authorization: Bearer <firebase-id-token>` header.

### Core Endpoints

#### Chat & Intent
```
POST   /api/v1/chat/message          # Send message, get AI response + trigger pipeline
GET    /api/v1/chat/conversations     # List user conversations
GET    /api/v1/chat/conversations/:id # Get conversation history
DELETE /api/v1/chat/conversations/:id # Delete conversation
```

#### Projects
```
POST   /api/v1/projects              # Create project
GET    /api/v1/projects              # List user projects (paginated)
GET    /api/v1/projects/:id          # Get project details
PATCH  /api/v1/projects/:id          # Update project
DELETE /api/v1/projects/:id          # Delete project
GET    /api/v1/projects/:id/scenes   # Get project scenes
PATCH  /api/v1/projects/:id/scenes/:sceneId  # Update a scene
GET    /api/v1/projects/:id/assets   # Get project assets
GET    /api/v1/projects/:id/outputs  # Get project outputs
```

#### Agents (Direct invocation)
```
POST   /api/v1/agents/trend/research      # Trigger trend research
POST   /api/v1/agents/script/generate     # Generate script
POST   /api/v1/agents/prompt/generate     # Generate image/video prompts
POST   /api/v1/agents/image/generate      # Generate image
POST   /api/v1/agents/video/generate      # Generate video
POST   /api/v1/agents/voice/generate      # Generate voiceover
POST   /api/v1/agents/editor/compose      # Compose final video
POST   /api/v1/agents/thumbnail/generate  # Generate thumbnail
POST   /api/v1/agents/seo/generate        # Generate SEO metadata
```

#### Pipelines
```
GET    /api/v1/pipelines/:id          # Get pipeline status
POST   /api/v1/pipelines/:id/pause   # Pause pipeline
POST   /api/v1/pipelines/:id/resume  # Resume pipeline
POST   /api/v1/pipelines/:id/cancel  # Cancel pipeline
POST   /api/v1/pipelines/:id/retry   # Retry failed step
```

#### Publishing
```
POST   /api/v1/publish/:projectId     # Publish now
POST   /api/v1/publish/:projectId/schedule  # Schedule publish
GET    /api/v1/publish/schedule       # Get all scheduled posts
DELETE /api/v1/publish/schedule/:id   # Cancel scheduled post
```

#### Analytics
```
GET    /api/v1/analytics/overview     # Dashboard overview
GET    /api/v1/analytics/platform/:platform  # Platform-specific analytics
GET    /api/v1/analytics/content/:projectId  # Content performance
```

#### Media
```
POST   /api/v1/media/upload          # Upload custom asset
GET    /api/v1/media/:id             # Get media details
DELETE /api/v1/media/:id             # Delete media
GET    /api/v1/media/library         # Browse asset library
```

---

## 6. Agent Interface Contract

Every agent in the system MUST implement this interface:

```typescript
interface IAgent<TInput, TOutput> {
  // Unique identifier
  readonly id: string;
  
  // Human-readable name
  readonly name: string;
  
  // Agent version
  readonly version: string;
  
  // What this agent does
  readonly description: string;
  
  // Validate input before execution
  validate(input: TInput): Promise<ValidationResult>;
  
  // Execute the agent's primary function
  execute(input: TInput, context: AgentContext): Promise<AgentResult<TOutput>>;
  
  // Rollback/cleanup on failure
  rollback(context: AgentContext): Promise<void>;
  
  // Get current execution status
  getStatus(): AgentStatus;
  
  // Estimate cost before execution
  estimateCost(input: TInput): Promise<CostEstimate>;
  
  // Health check
  healthCheck(): Promise<HealthCheckResult>;
}
```

---

## 7. Pipeline Execution Model

When a user says "Create 10 YouTube Shorts about electric cars", here's what happens:

```
1. INTENT PARSING
   User message → LLM extracts intent:
   {
     action: 'create_video',
     count: 10,
     format: 'youtube_shorts',
     topic: 'electric cars',
     contentType: 'faceless'  // inferred
   }

2. PLAN BUILDING
   Intent → Plan Builder creates execution DAG:
   
   For each of the 10 videos:
   ┌─────────────┐
   │ Trend Agent  │──▶ Research "electric cars" trends
   └──────┬──────┘
          ▼
   ┌─────────────┐
   │ Script Agent │──▶ Generate script for top trend
   └──────┬──────┘
          ▼
   ┌─────────────┐
   │ Prompt Agent │──▶ Generate scene prompts from script
   └──────┬──────┘
          ├──────────────────────┐
          ▼                      ▼
   ┌─────────────┐      ┌─────────────┐
   │ Image Agent  │      │ Voice Agent  │  ◀── Parallel execution
   └──────┬──────┘      └──────┬──────┘
          └──────────┬─────────┘
                     ▼
   ┌─────────────────────────┐
   │ Video Editor Agent       │──▶ Compose video + subtitles + music
   └──────────┬──────────────┘
              ├──────────────────────┐
              ▼                      ▼
   ┌─────────────┐      ┌─────────────┐
   │Thumbnail Agt│      │  SEO Agent   │  ◀── Parallel execution
   └──────┬──────┘      └──────┬──────┘
          └──────────┬─────────┘
                     ▼
   ┌─────────────────────────┐
   │ Publishing Agent         │──▶ Ready for publish/schedule
   └─────────────────────────┘

3. PIPELINE EXECUTION
   Pipeline Runner executes the DAG, respecting:
   - Dependencies (step order)
   - Parallelism (independent steps run concurrently)
   - Retry logic (3 retries with exponential backoff)
   - State persistence (every step result saved to Firestore)
   - Progress reporting (real-time via SSE/WebSocket)

4. OUTPUT
   Final deliverables per video:
   - MP4 video file (9:16 for Shorts)
   - Thumbnail image
   - Title, description, tags, hashtags
   - Ready for one-click publish
```

---

## 8. Design Patterns Used

| Pattern | Where | Why |
|---------|-------|-----|
| **Strategy** | Provider layer | Swap AI providers without changing agent logic |
| **Chain of Responsibility** | Pipeline runner | Each agent processes and passes to next |
| **Observer** | Event bus | Decouple pipeline state from UI updates |
| **Factory** | Agent/Provider creation | Create agents/providers from configuration |
| **Repository** | Database layer | Abstract Firestore operations behind clean interface |
| **Builder** | Prompt generation | Complex prompt construction step by step |
| **Template Method** | Base agent | Common agent lifecycle, subclasses override specifics |
| **Facade** | API controllers | Simple interface over complex multi-agent operations |
| **Registry** | Agent & Provider registries | Discover and access agents/providers dynamically |
| **DAG Scheduler** | Pipeline runner | Dependency-aware parallel task execution |

---

## 9. Scalability Considerations

### Current (MVP) Architecture
- **Monorepo with Turborepo**: Fast builds, shared types, single deploy
- **Firebase**: Zero-ops database, auth, storage
- **Vercel**: Auto-scaling for Next.js
- **In-process job queue**: BullMQ with Redis for async tasks

### Future Scale Architecture
- **Microservices**: Each agent becomes a deployable service
- **Kubernetes**: Container orchestration
- **Message Queue**: RabbitMQ/Kafka for inter-service communication
- **CDN**: CloudFront/Cloudflare for media delivery
- **Caching**: Redis for hot data, API response caching
- **Monitoring**: Datadog/Grafana for observability

### Migration Path
The monorepo structure is designed so that each `package` can be extracted
into an independent microservice without changing internal code. The interfaces
act as the contract boundary.

---

## 10. Security Architecture

- **Authentication**: Firebase Auth (Google, Email/Password, GitHub)
- **Authorization**: Role-based (free/pro/enterprise) with middleware checks
- **API Keys**: Encrypted at rest in Firestore, never exposed to client
- **Rate Limiting**: Per-user, per-endpoint, per-plan
- **Input Validation**: Zod schemas on every API endpoint
- **CORS**: Strict origin whitelist
- **Content Security**: AI-generated content moderation via OpenAI moderation API
- **Storage Rules**: Firebase Storage security rules (user-scoped access)

---

## 11. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Monorepo setup (Turborepo)
- Shared types and interfaces
- Firebase setup (Auth, Firestore, Storage)
- Express.js server with middleware
- Next.js app with auth flow
- Base agent class and registry
- Provider abstraction layer

### Phase 2: Core Agents (Weeks 3-5)
- Script Writer Agent (with OpenAI/Anthropic)
- Prompt Generator Agent
- Image Generation Agent (with Replicate/DALL-E)
- Voice Agent (with ElevenLabs/OpenAI TTS)

### Phase 3: Pipeline Engine (Weeks 5-6)
- Intent parser
- Plan builder
- Pipeline runner with DAG execution
- State management and progress tracking

### Phase 4: Chat & UI (Weeks 6-8)
- AI Chat interface
- Project dashboard
- Pipeline progress visualization
- Asset library / media browser

### Phase 5: Video Composition (Weeks 8-10)
- Video editor agent (FFmpeg-based or Remotion)
- Subtitle generation and overlay
- Music and transitions
- Final export

### Phase 6: Publishing & SEO (Weeks 10-11)
- SEO agent
- Thumbnail agent
- YouTube/Instagram/TikTok publishing
- Scheduling system

### Phase 7: Analytics & Polish (Weeks 11-13)
- Analytics dashboard
- Performance optimization
- Error handling hardening
- Documentation

### Phase 8: Advanced Features (Weeks 13+)
- Multi-agent orchestration
- AI memory / brand voice
- Content calendar
- Team collaboration
- Trend research agent (full implementation)
