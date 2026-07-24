# CreatorAI Studio — Development Guide

## Getting Started

### Prerequisites
- Node.js 20+ (LTS)
- pnpm 9+ (package manager)
- Firebase CLI
- Git

### Initial Setup
```bash
# Clone the repository
git clone <repo-url>
cd creatorai-studio

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start Firebase emulators (local development)
pnpm firebase:emulators

# Start development servers
pnpm dev
```

---

## Development Workflow

### Branch Strategy
```
main          ← Production (auto-deploys to Vercel)
├── develop   ← Integration branch
│   ├── feature/agent-script-writer
│   ├── feature/pipeline-engine
│   ├── fix/voice-sync-issue
│   └── chore/update-dependencies
```

### Commit Convention
```
feat(agent/script): add emotional storytelling template
fix(pipeline): handle timeout in image generation step
refactor(providers): extract common retry logic
docs(api): add publishing endpoint documentation
test(agent/voice): add unit tests for accent selection
chore(deps): update openai sdk to v5
```

---

## Architecture Decision Records

### ADR-001: Monorepo with Turborepo
**Decision:** Use Turborepo monorepo instead of separate repositories.
**Reasoning:**
- Agents share types and interfaces — monorepo ensures type safety across boundaries
- Single CI/CD pipeline for coordinated deployments
- Shared tooling (ESLint, Prettier, TypeScript config)
- Easier refactoring during early development
- Can extract packages later when team grows

### ADR-002: Express.js over tRPC
**Decision:** Use Express.js for the API server, not tRPC.
**Reasoning:**
- The backend serves multiple consumers (web app, future mobile app, webhooks)
- Express.js provides better middleware ecosystem (rate limiting, auth, file uploads)
- REST API is more universally understood for team onboarding
- tRPC tightly couples frontend and backend — we want flexibility
- Express.js is battle-tested at massive scale

### ADR-003: Firestore over PostgreSQL
**Decision:** Use Firestore as primary database.
**Reasoning:**
- Schema-less nature suits rapidly evolving agent outputs
- Real-time listeners for pipeline progress (no WebSocket layer needed)
- Built-in offline support for the frontend
- Zero-ops — no database administration
- Firebase ecosystem integration (Auth, Storage, Hosting)
- **Tradeoff:** No JOINs, limited query flexibility — mitigated by denormalization
- **Migration path:** If we outgrow Firestore, the Repository pattern abstracts the switch

### ADR-004: Agent Interface Contract
**Decision:** Every agent must implement the IAgent interface.
**Reasoning:**
- Enables pipeline engine to work with any agent without knowing internals
- `validate()` catches bad input before expensive API calls
- `rollback()` enables cleanup on failure (delete generated files, etc.)
- `estimateCost()` lets us show users cost before execution
- `healthCheck()` enables monitoring and circuit-breaking

### ADR-005: Provider Abstraction
**Decision:** AI providers are abstracted behind interfaces, not called directly.
**Reasoning:**
- Switch from DALL-E to Flux without changing agent code
- A/B test providers (compare quality, speed, cost)
- Rate limit across providers independently
- Handle provider outages with automatic fallback
- Users can bring their own API keys for any supported provider

### ADR-006: DAG-based Pipeline Execution
**Decision:** Pipelines are modeled as Directed Acyclic Graphs.
**Reasoning:**
- Some steps can run in parallel (image gen + voice gen)
- Some steps have dependencies (editor needs images + voiceover)
- DAG naturally represents this
- Enables partial re-execution (retry just the failed step)
- Pipeline state is serializable (stored in Firestore)

---

## Key Technical Decisions

### State Management (Frontend)
- **Zustand** for client state (lightweight, no boilerplate)
- **TanStack Query** for server state (caching, invalidation, optimistic updates)
- **Firestore real-time listeners** for pipeline progress

### Form Handling
- **React Hook Form** + **Zod** for type-safe form validation

### Styling
- **Tailwind CSS** + **shadcn/ui** for consistent, accessible component library
- **Framer Motion** for animations (pipeline progress, transitions)

### Error Handling
- Custom error classes (AppError, AgentError, ProviderError, ValidationError)
- Global error boundary in React
- Centralized error middleware in Express
- Structured error logging with correlation IDs

### Testing Strategy
- **Unit tests**: Agents, providers, utilities (Vitest)
- **Integration tests**: API endpoints, database operations
- **E2E tests**: Critical user flows (Playwright)
- **Agent tests**: Mock providers, test agent logic in isolation

---

## Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_KEY=         # JSON string or path

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
REPLICATE_API_TOKEN=
ELEVENLABS_API_KEY=
RUNWAY_API_KEY=

# Search/Trends
SERPAPI_API_KEY=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

# Social Platform APIs
YOUTUBE_API_KEY=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

# Server
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001
ENCRYPTION_KEY=                       # For API key encryption

# Redis (for job queue)
REDIS_URL=redis://localhost:6379
```
