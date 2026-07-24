# CreatorAI Studio — AI Infrastructure Layer

## Overview

The infrastructure layer sits between agents and providers. **Every AI operation flows through it.** This is not optional middleware — it's the foundation that makes the agent system production-grade.

```
┌───────────────────────────────────────────────────────────┐
│                        AGENT                               │
│                    (e.g., ScriptAgent)                      │
└─────────────────────────┬─────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                INFRASTRUCTURE LAYER                        │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ PromptManager│  │  CostTracker │  │     Logger       │ │
│  │              │  │              │  │                   │ │
│  │ • Templates  │  │ • Per-call   │  │ • Structured JSON│ │
│  │ • Variables  │  │ • Per-user   │  │ • Correlation IDs│ │
│  │ • Versioning │  │ • Per-model  │  │ • Timing data    │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘ │
│         │                 │                    │            │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌────────▼──────────┐ │
│  │ CircuitBreaker│ │  SSEManager  │  │   JobQueue        │ │
│  │              │  │              │  │                   │ │
│  │ • Per-provdr │  │ • Real-time  │  │ • Priority queue  │ │
│  │ • Open/Close │  │ • User-scoped│  │ • Concurrency ctl │ │
│  │ • Auto-failov│  │ • Heartbeats │  │ • Retry logic     │ │
│  └──────────────┘  └──────────────┘  └───────────────────┘ │
│                                                            │
└─────────────────────────┬─────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                    PROVIDER LAYER                           │
│              (OpenAI, Replicate, ElevenLabs, etc.)          │
└───────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Logger (`infrastructure/logger.ts`)

**Purpose:** Structured, context-aware logging across the entire system.

**Why not console.log:**
- No correlation IDs → can't trace a pipeline execution across 11 agent calls
- No structured data → can't search logs in Datadog/CloudWatch
- No severity levels → can't filter noise in production
- No timing → can't identify bottlenecks

**Features:**
- JSON-structured log entries
- Context propagation (userId, pipelineId, correlationId)
- Child loggers with inherited context
- `log.time()` method for automatic duration tracking
- Pluggable transport (Console → Datadog/GCP Logging)

**Usage:**
```typescript
const log = Logger.for('ScriptAgent', { pipelineId, userId });
log.info('Generating script', { topic, style });
await log.time('LLM call', () => provider.complete(prompt), { model });
log.error('Provider failed', { providerId }, error);
```

---

### 2. Prompt Manager (`infrastructure/prompt/prompt-manager.ts`)

**Purpose:** Centralized, versioned, reusable prompt templates.

**Why prompts shouldn't be in agent code:**
- Prompts change 10x more often than agent logic
- A/B testing requires swapping prompts without code changes
- Version tracking lets us correlate prompt changes with output quality
- Templates with variables prevent copy-paste drift across content types

**Features:**
- `{{variable}}` interpolation
- Version tracking per template
- Category-based organization
- Missing variable detection at render time

**Usage:**
```typescript
const pm = PromptManager.getInstance();
pm.register({
  id: 'script.viral',
  version: 3,
  category: 'script',
  systemPrompt: 'You are a viral content strategist...',
  userPromptTemplate: 'Write a {{style}} script about {{topic}} for {{platform}}...',
  variables: ['style', 'topic', 'platform'],
  ...
});

const rendered = pm.render('script.viral', {
  style: 'hook-story-cta',
  topic: 'electric cars',
  platform: 'YouTube Shorts',
});
```

---

### 3. Cost Tracker (`infrastructure/cost/cost-tracker.ts`)

**Purpose:** Real-time cost tracking for every AI operation.

**Why this is critical:**
- Users need cost-per-project visibility
- Plan enforcement requires real-time usage tracking
- Business margin analysis requires accurate cost data
- Anomaly alerting: detect if a pipeline costs 10x the expected amount

**Features:**
- Model pricing table (maintained manually, updated periodically)
- Tracks LLM tokens, image count, video duration, voice characters
- In-memory accumulation with periodic flush to Firestore
- Per-pipeline, per-user, and per-model cost aggregation

**Supported pricing:**
| Provider | Model | Metric |
|----------|-------|--------|
| OpenAI | GPT-4o | $2.50/M input, $10/M output |
| OpenAI | GPT-4o-mini | $0.15/M input, $0.60/M output |
| Anthropic | Claude Sonnet 4 | $3/M input, $15/M output |
| Replicate | Flux Pro 1.1 | $0.05/image |
| Replicate | Flux Schnell | $0.003/image |
| ElevenLabs | Multilingual v2 | $0.18/1K chars |
| Runway | Gen-3 Alpha Turbo | $0.05/second |

---

### 4. Circuit Breaker (`infrastructure/circuit-breaker/circuit-breaker.ts`)

**Purpose:** Prevent cascading failures when AI providers go down.

**States:**
```
CLOSED ──(failure threshold)──► OPEN ──(reset timeout)──► HALF_OPEN
  ▲                                                          │
  └────────────(success threshold in half-open)──────────────┘
```

**Why this is required:**
- Without it: Provider goes down → every pipeline waits for 60s timeout → queue backs up → user sees spinning forever
- With it: Provider goes down → 3 failures → circuit opens → immediate fallback to alternative provider → zero user impact

**Features:**
- Per-provider circuit breakers
- Configurable thresholds (failure count, error rate, reset timeout)
- Health state monitoring for the dashboard
- `CircuitBreakerRegistry.findHealthyProvider()` for automatic failover

---

### 5. SSE Manager (`infrastructure/streaming/sse-manager.ts`)

**Purpose:** Real-time event streaming to connected clients.

**Used for:**
- Pipeline progress: "Generating images... 3/5 complete"
- Job status: "Video rendering 45%"
- Chat streaming: Token-by-token LLM response (future)

**Architecture:**
- Client connects via `GET /api/v1/events/stream`
- Events are user-scoped (clients only see their own events)
- Optional pipeline/project filters for targeted subscriptions
- 30s heartbeat keeps connections alive through proxies

**Event flow:**
```
Pipeline Runner ──► PipelineEventBus ──► SSEManager ──► Connected Client
Job Queue ──────────────────────────────► SSEManager ──► Connected Client
```

---

### 6. Job Queue (`infrastructure/jobs/job-queue.ts`)

**Purpose:** Async processing for long-running AI operations.

**Why API requests can't do AI generation synchronously:**
- Image generation: 5-30 seconds
- Video generation: 30-120 seconds
- Video composition: 60-300 seconds
- HTTP request timeout: typically 30s

**Features:**
- Priority queue (lower number = higher priority)
- Configurable concurrency limit
- Automatic retry with back-off
- Job expiry for stale items
- Event emission for SSE integration

**Migration path:**
The `JobQueue` interface is designed so the in-process implementation can be swapped for a Redis-backed BullMQ implementation without changing any agent code. Swap when:
- Running multiple server instances
- Need persistence across server restarts
- Need delayed/scheduled jobs with precision

---

## Bootstrap Sequence

The server initializes infrastructure in this order (see `apps/server/src/bootstrap.ts`):

```
1. Logger configuration
2. Firebase (Auth, Firestore, Storage)
3. Circuit breakers (one per AI provider)
4. Agent registry
5. Prompt manager
6. Cost tracker
7. Job queue (starts processing)
8. SSE manager
9. Pipeline EventBus → SSE bridge
10. Job Queue → SSE bridge
```

Every agent that's registered later automatically inherits all infrastructure capabilities through the `BaseAgent` class and the shared singletons.
