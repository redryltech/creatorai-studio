# CreatorAI Studio — API Reference

## Base URL
- **Development:** `http://localhost:3001/api/v1`
- **Production:** `https://api.creatorai.studio/api/v1`

## Authentication
All endpoints require Firebase Authentication.

```
Authorization: Bearer <firebase-id-token>
```

The server validates the token using Firebase Admin SDK and extracts the user ID.

## Rate Limits

| Plan | Requests/min | Concurrent Pipelines | Daily Videos |
|------|-------------|----------------------|--------------|
| Free | 30 | 1 | 3 |
| Pro | 120 | 5 | 50 |
| Enterprise | 600 | 20 | Unlimited |

Rate limit headers:
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 1689292800
```

## Common Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-07-14T10:30:00Z"
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid content type specified",
    "details": [
      { "field": "contentType", "message": "Must be one of: faceless, animated, ..." }
    ]
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-07-14T10:30:00Z"
  }
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Insufficient permissions or plan |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `QUOTA_EXCEEDED` | 429 | Plan quota exceeded |
| `PROVIDER_ERROR` | 502 | AI provider returned an error |
| `PROVIDER_TIMEOUT` | 504 | AI provider timed out |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Endpoints

### 1. Chat

#### `POST /chat/message`
Send a message to the AI assistant. The assistant interprets the intent and may trigger a pipeline.

**Request:**
```json
{
  "conversationId": "conv_abc123",   // null for new conversation
  "message": "Create 10 YouTube Shorts about electric cars",
  "attachments": []                   // Optional file references
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_abc123",
    "response": {
      "id": "msg_xyz789",
      "role": "assistant",
      "content": "I'll create 10 YouTube Shorts about electric cars! Here's my plan:\n\n1. Research trending EV topics...",
      "metadata": {
        "intent": {
          "action": "create_video",
          "count": 10,
          "format": "youtube_shorts",
          "topic": "electric cars"
        },
        "pipelineId": "pipe_def456",
        "projectIds": ["proj_1", "proj_2", "..."]
      }
    }
  }
}
```

**Server-Sent Events (SSE):**
After the initial response, the client should connect to the SSE endpoint for real-time updates:
```
GET /chat/stream?conversationId=conv_abc123
```

This streams pipeline progress, agent outputs, and assistant messages in real-time.

---

### 2. Projects

#### `GET /projects`
List user's projects with pagination and filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `status` | string | all | Filter by status |
| `contentType` | string | all | Filter by content type |
| `sortBy` | string | createdAt | Sort field |
| `sortOrder` | string | desc | asc or desc |
| `search` | string | — | Search in title/description |

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 47,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### `POST /projects`
Create a new project manually (not via chat).

**Request:**
```json
{
  "title": "Electric Cars Revolution",
  "contentType": "faceless",
  "targetPlatforms": ["youtube_shorts"],
  "settings": {
    "aspectRatio": "9:16",
    "duration": 60,
    "language": "en",
    "voiceId": "voice_adam",
    "artStyle": "cinematic",
    "subtitles": true
  }
}
```

#### `GET /projects/:id`
Get full project details including scenes, assets, and outputs.

#### `PATCH /projects/:id`
Update project settings or metadata.

#### `DELETE /projects/:id`
Soft-delete a project.

---

### 3. Agents (Direct Invocation)

These endpoints allow direct invocation of individual agents outside a pipeline.

#### `POST /agents/trend/research`
```json
{
  "topic": "electric cars",
  "platforms": ["youtube", "tiktok"],
  "count": 5,
  "timeRange": "7d",
  "language": "en"
}
```

#### `POST /agents/script/generate`
```json
{
  "topic": "Why Tesla is losing market share",
  "contentType": "educational",
  "targetPlatform": "youtube_shorts",
  "duration": 60,
  "style": "hook_story_cta",
  "tone": "professional",
  "language": "en"
}
```

#### `POST /agents/prompt/generate`
```json
{
  "scenes": [...],
  "artStyle": "cinematic",
  "targetModel": "flux",
  "aspectRatio": "9:16",
  "characterConsistency": true
}
```

#### `POST /agents/image/generate`
```json
{
  "prompt": "A futuristic Tesla Cybertruck driving through neon-lit Tokyo streets at night, cinematic lighting, 4K, ultrarealistic",
  "negativePrompt": "blurry, low quality, deformed",
  "width": 1080,
  "height": 1920,
  "provider": "replicate",
  "model": "flux-pro-1.1"
}
```

#### `POST /agents/video/generate`
```json
{
  "mode": "image_to_video",
  "imageUrl": "https://storage.../scene-1.png",
  "prompt": "Slow zoom in, car headlights flicker on, rain starts falling",
  "duration": 5,
  "provider": "runway"
}
```

#### `POST /agents/voice/generate`
```json
{
  "text": "Did you know that electric cars are now outselling gas cars in Europe?",
  "voiceId": "adam",
  "provider": "elevenlabs",
  "language": "en",
  "speed": 1.0,
  "emotion": "informative"
}
```

#### `POST /agents/editor/compose`
```json
{
  "projectId": "proj_abc123",
  "format": {
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "codec": "h264"
  },
  "subtitles": {
    "enabled": true,
    "style": "bold_center",
    "fontSize": 48,
    "color": "#FFFFFF",
    "strokeColor": "#000000"
  },
  "music": {
    "style": "epic_cinematic",
    "volume": 0.15
  },
  "transitions": {
    "type": "crossfade",
    "duration": 0.5
  }
}
```

#### `POST /agents/thumbnail/generate`
```json
{
  "topic": "Tesla vs BYD: Who Wins?",
  "style": "youtube_thumbnail",
  "includeText": true,
  "textOverlay": "TESLA IS DONE?",
  "referenceImages": [],
  "count": 3
}
```

#### `POST /agents/seo/generate`
```json
{
  "topic": "Tesla vs BYD market share battle",
  "platform": "youtube",
  "script": "...",
  "language": "en",
  "count": 3
}
```

---

### 4. Pipelines

#### `GET /pipelines/:id`
Get pipeline status and detailed step progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pipe_def456",
    "status": "running",
    "progress": 45,
    "currentStep": "image_generation",
    "steps": [
      {
        "id": "trend_research",
        "agentId": "trend",
        "name": "Trend Research",
        "status": "completed",
        "output": { "selectedIdea": "..." },
        "startedAt": "...",
        "completedAt": "...",
        "actualDuration": 8.3
      },
      {
        "id": "script_generation",
        "agentId": "script",
        "status": "completed",
        "output": { "scenes": [...] }
      },
      {
        "id": "image_generation",
        "agentId": "image",
        "status": "running",
        "progress": 60
      },
      {
        "id": "voice_generation",
        "agentId": "voice",
        "status": "running",
        "progress": 40
      },
      {
        "id": "video_composition",
        "agentId": "editor",
        "status": "pending"
      }
    ]
  }
}
```

#### `POST /pipelines/:id/pause`
Pause a running pipeline (completes current step, then pauses).

#### `POST /pipelines/:id/resume`
Resume a paused pipeline from where it left off.

#### `POST /pipelines/:id/cancel`
Cancel a pipeline. Running steps are abandoned, completed steps are preserved.

#### `POST /pipelines/:id/retry`
Retry from the last failed step.
```json
{
  "stepId": "image_generation",    // Optional: retry specific step
  "modifiedInput": { ... }         // Optional: override input for retry
}
```

---

### 5. Publishing

#### `POST /publish/:projectId`
Publish content immediately.
```json
{
  "outputId": "out_abc123",
  "platform": "youtube",
  "overrides": {                   // Optional: override generated metadata
    "title": "Custom title",
    "description": "Custom description"
  }
}
```

#### `POST /publish/:projectId/schedule`
Schedule content for later.
```json
{
  "outputId": "out_abc123",
  "platform": "youtube",
  "scheduledAt": "2026-07-15T14:00:00Z"
}
```

---

### 6. Analytics

#### `GET /analytics/overview`
Get dashboard overview for the authenticated user.
```json
{
  "success": true,
  "data": {
    "totalViews": 125000,
    "totalEngagement": 8500,
    "averageCTR": 7.2,
    "topPerforming": [...],
    "recentGrowth": {
      "views": "+23%",
      "subscribers": "+156"
    },
    "suggestions": [
      "Your shorts about EVs perform 3x better than average. Create more!",
      "Post between 2-4 PM IST for maximum reach."
    ]
  }
}
```

---

## WebSocket / SSE Events

### Pipeline Progress Stream
```
GET /api/v1/events/pipeline/:pipelineId
```

Event types:
```
event: step.started
data: { "stepId": "script_generation", "agentId": "script" }

event: step.progress
data: { "stepId": "image_generation", "progress": 60, "message": "Generating scene 3/5" }

event: step.completed
data: { "stepId": "script_generation", "output": { ... } }

event: step.failed
data: { "stepId": "image_generation", "error": "Provider timeout", "retrying": true }

event: pipeline.completed
data: { "projectId": "proj_abc", "outputs": [...] }

event: pipeline.failed
data: { "error": "...", "failedStep": "..." }
```
