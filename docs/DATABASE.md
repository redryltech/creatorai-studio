# CreatorAI Studio — Database Schema Reference

## Database: Firebase Firestore (NoSQL Document Store)

### Why Firestore?
1. **Real-time listeners** — Pipeline progress updates stream to the UI instantly
2. **Zero-ops** — No server provisioning, auto-scaling built in
3. **Offline support** — Client SDK handles network failures gracefully
4. **Security rules** — Row-level security without custom middleware
5. **Cost model** — Pay per read/write, ideal for a content platform (write-heavy bursts, read-light)

### Schema Design Principles
- **Denormalize for reads** — Store computed/aggregated data where it's read
- **Subcollections for ownership** — Scenes under projects, not in a global collection
- **Indexed fields** — Every query field has a composite index
- **Soft deletes** — `deletedAt` field instead of hard deletes for recovery
- **Timestamps everywhere** — `createdAt`, `updatedAt` on every document

---

## Collections

### 1. `users/{userId}`

| Field | Type | Description |
|-------|------|-------------|
| `email` | `string` | User email |
| `displayName` | `string` | Display name |
| `photoURL` | `string \| null` | Avatar URL |
| `plan` | `'free' \| 'pro' \| 'enterprise'` | Subscription tier |
| `usage.videosGenerated` | `number` | Total videos generated |
| `usage.imagesGenerated` | `number` | Total images generated |
| `usage.voiceoversGenerated` | `number` | Total voiceovers |
| `usage.storageUsedBytes` | `number` | Total storage consumed |
| `usage.apiCallsThisMonth` | `number` | API calls in billing period |
| `preferences.defaultPlatform` | `string` | Default target platform |
| `preferences.defaultLanguage` | `string` | Default language (BCP-47) |
| `preferences.defaultVoice` | `string` | Default voice ID |
| `preferences.brandVoice` | `string \| null` | Brand voice description |
| `connectedAccounts` | `map` | OAuth tokens for social platforms |
| `createdAt` | `timestamp` | Account creation time |
| `updatedAt` | `timestamp` | Last update time |

**Indexes:** `email` (unique), `plan`

---

### 2. `projects/{projectId}`

| Field | Type | Description |
|-------|------|-------------|
| `userId` | `string` | Owner user ID (indexed) |
| `title` | `string` | Project title |
| `description` | `string` | Project description |
| `status` | `enum` | `draft \| processing \| completed \| failed \| published` |
| `contentType` | `enum` | See ContentType enum below |
| `targetPlatforms` | `string[]` | Target social platforms |
| `originalPrompt` | `string` | The user's original command |
| `settings.aspectRatio` | `string` | `16:9 \| 9:16 \| 1:1` |
| `settings.duration` | `number` | Target duration in seconds |
| `settings.language` | `string` | Content language |
| `settings.voiceId` | `string \| null` | Selected voice |
| `settings.musicStyle` | `string \| null` | Background music style |
| `settings.artStyle` | `string \| null` | Visual art style |
| `settings.subtitles` | `boolean` | Enable subtitles |
| `pipelineId` | `string \| null` | Active pipeline reference |
| `script` | `string \| null` | Generated script (denormalized) |
| `createdAt` | `timestamp` | Creation time |
| `updatedAt` | `timestamp` | Last update |
| `deletedAt` | `timestamp \| null` | Soft delete marker |

**Indexes:** `userId + status`, `userId + createdAt DESC`, `userId + contentType`

#### Subcollection: `projects/{projectId}/scenes/{sceneId}`

| Field | Type | Description |
|-------|------|-------------|
| `order` | `number` | Scene sequence number |
| `scriptText` | `string` | Narration/dialogue text |
| `voiceoverUrl` | `string \| null` | Generated voiceover audio URL |
| `voiceoverDuration` | `number \| null` | Audio duration in seconds |
| `imagePrompt` | `string \| null` | AI image generation prompt |
| `imageUrl` | `string \| null` | Generated image URL |
| `videoPrompt` | `string \| null` | AI video generation prompt |
| `videoUrl` | `string \| null` | Generated video clip URL |
| `duration` | `number` | Scene duration in seconds |
| `transition` | `string` | Transition type (fade, cut, zoom, etc.) |
| `kenBurnsEffect` | `object \| null` | Pan/zoom animation settings |
| `createdAt` | `timestamp` | |

**Indexes:** `order ASC`

#### Subcollection: `projects/{projectId}/assets/{assetId}`

| Field | Type | Description |
|-------|------|-------------|
| `type` | `enum` | `image \| video \| audio \| thumbnail \| music` |
| `purpose` | `string` | What the asset is for (scene-1-bg, voiceover, etc.) |
| `url` | `string` | Public download URL |
| `storageRef` | `string` | Firebase Storage path |
| `metadata.width` | `number \| null` | Width in pixels |
| `metadata.height` | `number \| null` | Height in pixels |
| `metadata.duration` | `number \| null` | Duration in seconds |
| `metadata.format` | `string` | File format (mp4, png, mp3, etc.) |
| `metadata.sizeBytes` | `number` | File size |
| `createdAt` | `timestamp` | |

#### Subcollection: `projects/{projectId}/outputs/{outputId}`

| Field | Type | Description |
|-------|------|-------------|
| `platform` | `string` | Target platform (youtube, instagram, etc.) |
| `videoUrl` | `string` | Final video URL |
| `thumbnailUrl` | `string \| null` | Thumbnail URL |
| `title` | `string` | SEO-optimized title |
| `description` | `string` | SEO-optimized description |
| `tags` | `string[]` | SEO tags |
| `hashtags` | `string[]` | Platform hashtags |
| `publishStatus` | `enum` | `ready \| scheduled \| published \| failed` |
| `scheduledAt` | `timestamp \| null` | Scheduled publish time |
| `publishedAt` | `timestamp \| null` | Actual publish time |
| `platformPostId` | `string \| null` | Post ID from the platform |
| `platformUrl` | `string \| null` | Direct link to published post |
| `createdAt` | `timestamp` | |

---

### 3. `pipelines/{pipelineId}`

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | `string` | Associated project (indexed) |
| `userId` | `string` | Owner (indexed) |
| `status` | `enum` | `queued \| running \| paused \| completed \| failed \| cancelled` |
| `currentStep` | `string` | Currently executing step ID |
| `progress` | `number` | Overall progress 0-100 |
| `plan.steps` | `array` | Ordered execution steps (see below) |
| `plan.metadata` | `object` | Plan-level metadata |
| `error` | `object \| null` | `{ message, step, timestamp, code }` |
| `startedAt` | `timestamp` | Pipeline start time |
| `completedAt` | `timestamp \| null` | Pipeline completion time |
| `updatedAt` | `timestamp` | Last state change |

**Pipeline Step Schema:**
```typescript
{
  id: string;                    // Unique step ID (e.g., "trend-research")
  agentId: string;               // Which agent runs this step
  name: string;                  // Human-readable step name
  status: StepStatus;            // pending | running | completed | failed | skipped
  input: Record<string, any>;    // Input data for the agent
  output: Record<string, any> | null;  // Agent output
  error: string | null;          // Error message if failed
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  retryCount: number;            // Number of retries attempted
  maxRetries: number;            // Maximum retries allowed
  dependsOn: string[];           // Step IDs this depends on
  estimatedDuration: number;     // Estimated seconds
  actualDuration: number | null; // Actual seconds taken
}
```

**Indexes:** `userId + status`, `projectId`, `status + updatedAt`

---

### 4. `conversations/{conversationId}`

| Field | Type | Description |
|-------|------|-------------|
| `userId` | `string` | Owner (indexed) |
| `projectId` | `string \| null` | Associated project |
| `title` | `string` | Auto-generated conversation title |
| `messages` | `array` | Message array (see below) |
| `messageCount` | `number` | Total messages (denormalized) |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

**Message Schema:**
```typescript
{
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: {
    intent: string | null;
    pipelineId: string | null;
    projectId: string | null;
    attachments: Array<{ type: string; url: string; name: string }>;
    tokens: { input: number; output: number } | null;
  };
  timestamp: Timestamp;
}
```

**Note:** For conversations exceeding 100 messages, older messages are moved to a
subcollection `conversations/{id}/history/{batchId}` to keep the main document size manageable.

**Indexes:** `userId + updatedAt DESC`

---

### 5. `schedules/{scheduleId}`

| Field | Type | Description |
|-------|------|-------------|
| `userId` | `string` | Owner (indexed) |
| `projectId` | `string` | Source project |
| `outputId` | `string` | Output to publish |
| `platform` | `string` | Target platform |
| `scheduledAt` | `timestamp` | When to publish (indexed) |
| `status` | `enum` | `pending \| processing \| published \| failed` |
| `error` | `string \| null` | Error message if failed |
| `publishedAt` | `timestamp \| null` | Actual publish time |
| `createdAt` | `timestamp` | |

**Indexes:** `userId + status`, `status + scheduledAt ASC` (for scheduler worker)

---

### 6. `apiKeys/{keyId}` (encrypted)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | `string` | Owner |
| `provider` | `string` | Provider name (openai, elevenlabs, etc.) |
| `encryptedKey` | `string` | AES-256 encrypted API key |
| `iv` | `string` | Initialization vector |
| `label` | `string` | User-given label |
| `lastUsedAt` | `timestamp \| null` | |
| `createdAt` | `timestamp` | |

---

## Enums

### ContentType
```typescript
enum ContentType {
  FACELESS = 'faceless',
  ANIMATED = 'animated',
  CINEMATIC = 'cinematic',
  DOCUMENTARY = 'documentary',
  STORYTELLING = 'storytelling',
  PRODUCT_AD = 'product_ad',
  EDUCATIONAL = 'educational',
  MOTIVATIONAL = 'motivational',
  AI_AVATAR = 'ai_avatar',
  PODCAST_CLIP = 'podcast_clip',
  NEWS = 'news',
  SHORT_FORM = 'short_form',
  LONG_FORM = 'long_form',
}
```

### Platform
```typescript
enum Platform {
  YOUTUBE = 'youtube',
  YOUTUBE_SHORTS = 'youtube_shorts',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TIKTOK = 'tiktok',
  LINKEDIN = 'linkedin',
  X = 'x',
  PINTEREST = 'pinterest',
}
```

---

## Firestore Security Rules (Summary)

```
- Users can only read/write their own documents
- Projects are scoped to userId
- Pipelines are scoped to userId
- API keys are read/write only by owner
- Admin SDK bypasses rules for server-side operations
- Storage files are scoped to users/{userId}/**
```

---

## Data Access Patterns

| Query | Collection | Index Required |
|-------|-----------|----------------|
| User's projects (newest first) | `projects` | `userId, createdAt DESC` |
| User's active pipelines | `pipelines` | `userId, status` |
| Project's scenes in order | `projects/{id}/scenes` | `order ASC` |
| Pending scheduled posts | `schedules` | `status, scheduledAt ASC` |
| User's conversations | `conversations` | `userId, updatedAt DESC` |
| Projects by content type | `projects` | `userId, contentType` |
