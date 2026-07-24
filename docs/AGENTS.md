# CreatorAI Studio — Agent Documentation

## Agent Architecture

Every agent in CreatorAI Studio follows the same lifecycle:

```
Input → Validate → Execute → Output
                      ↓ (on failure)
                   Rollback
```

Each agent is:
- **Stateless** — All state is passed via context and persisted to Firestore
- **Idempotent** — Can be safely retried with the same input
- **Provider-agnostic** — Uses provider interfaces, not specific SDKs
- **Cost-aware** — Can estimate cost before execution
- **Observable** — Emits events for progress tracking

---

## Agent Registry

| Agent ID | Name | Input | Output | Providers |
|----------|------|-------|--------|-----------|
| `trend` | Trend Research Agent | topic, platform, count | TrendResult[] | SerpAPI, Reddit API, YouTube Data API |
| `script` | Script Writer Agent | topic, contentType, duration, style | Script (with scenes) | OpenAI, Anthropic |
| `prompt` | Prompt Generator Agent | scenes[], artStyle, model | ScenePrompt[] | OpenAI, Anthropic |
| `image` | Image Generation Agent | prompt, dimensions, style | ImageResult | Replicate (Flux), DALL-E 3 |
| `video` | Video Generation Agent | prompt/image, duration | VideoResult | Runway Gen-3, Replicate |
| `voice` | Voice Agent | text, voiceId, language | AudioResult | ElevenLabs, OpenAI TTS |
| `editor` | Video Editor Agent | scenes[], audio, music | VideoFile | FFmpeg, Remotion |
| `thumbnail` | Thumbnail Agent | topic, style, images | ImageResult | Replicate (Flux), DALL-E 3 |
| `seo` | SEO Agent | topic, platform, script | SEOResult | OpenAI, Anthropic |
| `publishing` | Publishing Agent | video, metadata, platform | PublishResult | YouTube API, IG API, etc. |
| `analytics` | Analytics Agent | platformPostIds | AnalyticsData | YouTube Analytics, etc. |

---

## Agent Details

### 1. Trend Research Agent (`trend`)

**Purpose:** Research trending topics and suggest high-potential content ideas.

**Input:**
```typescript
interface TrendInput {
  topic: string;                    // Base topic (e.g., "electric cars")
  platforms: Platform[];            // Which platforms to research
  niche?: string;                   // Content niche for filtering
  count: number;                    // How many ideas to return
  timeRange: '24h' | '7d' | '30d'; // Trend time window
  language: string;                 // Content language
}
```

**Output:**
```typescript
interface TrendOutput {
  ideas: Array<{
    title: string;
    description: string;
    angle: string;                  // Unique angle for the content
    viralScore: number;             // 0-100 predicted virality
    searchVolume: number;           // Monthly search volume
    competition: 'low' | 'medium' | 'high';
    sources: Array<{
      platform: string;
      url: string;
      metric: string;              // e.g., "1.2M views", "trending #3"
    }>;
    suggestedContentType: ContentType;
    suggestedHook: string;
    keywords: string[];
  }>;
  metadata: {
    researchedAt: Date;
    sourcesChecked: number;
    processingTime: number;
  };
}
```

**Strategy:**
1. Query Google Trends API for topic popularity and related queries
2. Search Reddit for recent viral posts in relevant subreddits
3. Check YouTube trending/search for top-performing recent videos
4. Cross-reference with X/Twitter trending topics
5. Score and rank ideas using an LLM
6. Return top N ideas with supporting data

---

### 2. Script Writer Agent (`script`)

**Purpose:** Generate professional, platform-optimized scripts.

**Input:**
```typescript
interface ScriptInput {
  topic: string;
  contentType: ContentType;
  targetPlatform: Platform;
  duration: number;                 // Target duration in seconds
  style: ScriptStyle;              // hook-story-cta, educational, emotional, etc.
  tone: string;                    // professional, casual, dramatic, humorous
  language: string;
  hook?: string;                   // Optional pre-written hook
  keyPoints?: string[];            // Key points to cover
  brandVoice?: string;             // Brand voice description
  referenceScript?: string;        // Reference script for style matching
}

enum ScriptStyle {
  HOOK_STORY_CTA = 'hook_story_cta',
  EDUCATIONAL = 'educational',
  STORYTELLING = 'storytelling',
  LISTICLE = 'listicle',
  DOCUMENTARY = 'documentary',
  VIRAL = 'viral',
  EMOTIONAL = 'emotional',
  COMPARISON = 'comparison',
}
```

**Output:**
```typescript
interface ScriptOutput {
  fullScript: string;               // Complete script text
  scenes: Array<{
    id: string;
    order: number;
    type: 'hook' | 'body' | 'climax' | 'cta' | 'transition';
    narration: string;              // Text to be spoken
    visualDescription: string;      // What should be shown visually
    duration: number;               // Estimated seconds
    notes: string;                  // Director notes
    transition: string;             // Transition to next scene
  }>;
  metadata: {
    wordCount: number;
    estimatedDuration: number;
    readabilityScore: number;
    hookStrength: number;           // 0-100
    ctaStrength: number;            // 0-100
    emotionalArc: string[];         // e.g., ["curiosity", "surprise", "motivation"]
  };
}
```

**Architecture:**
- Uses template system (different templates for each ScriptStyle)
- LLM generates content within template structure
- Post-processing validates scene count, duration, word count
- Iterative refinement if quality scores are below threshold

---

### 3. Prompt Generator Agent (`prompt`)

**Purpose:** Transform script scenes into optimized AI image/video generation prompts.

**Input:**
```typescript
interface PromptInput {
  scenes: ScriptScene[];
  artStyle: ArtStyle;
  targetModel: 'flux' | 'dalle3' | 'midjourney' | 'runway';
  aspectRatio: '16:9' | '9:16' | '1:1';
  characterConsistency: boolean;    // Maintain character appearance across scenes
  characterDescriptions?: Array<{
    name: string;
    description: string;
    referenceImageUrl?: string;
  }>;
}

enum ArtStyle {
  PHOTOREALISTIC = 'photorealistic',
  CINEMATIC = 'cinematic',
  ANIME = 'anime',
  CARTOON = 'cartoon',
  WATERCOLOR = 'watercolor',
  OIL_PAINTING = 'oil_painting',
  DIGITAL_ART = 'digital_art',
  MINIMALIST = 'minimalist',
  RETRO = 'retro',
  NEON = 'neon',
  DARK_MOODY = 'dark_moody',
  BRIGHT_VIBRANT = 'bright_vibrant',
}
```

**Output:**
```typescript
interface PromptOutput {
  scenePrompts: Array<{
    sceneId: string;
    imagePrompt: {
      positive: string;            // Main generation prompt
      negative: string;            // Negative prompt
      width: number;
      height: number;
      guidanceScale: number;
      seed?: number;               // For reproducibility
    };
    videoPrompt?: {
      positive: string;
      motionDescription: string;
      cameraMovement: string;      // "slow zoom in", "pan left", "static"
      duration: number;
    };
    metadata: {
      character: string;
      environment: string;
      cameraAngle: string;
      lighting: string;
      mood: string;
      colorPalette: string[];
    };
  }>;
}
```

---

### 4. Image Generation Agent (`image`)

**Purpose:** Generate images from prompts using AI image models.

**Providers:**
- **Primary:** Replicate (Flux Pro 1.1, SDXL)
- **Fallback:** OpenAI DALL-E 3
- **Future:** Midjourney API (when available)

**Cost Control:**
- Free tier: SDXL (cheaper)
- Pro tier: Flux Pro (higher quality)
- Enterprise: DALL-E 3 + Flux (best of both)

---

### 5. Video Generation Agent (`video`)

**Purpose:** Generate short video clips from prompts or images.

**Providers:**
- **Primary:** Runway Gen-3 Alpha Turbo
- **Fallback:** Replicate video models
- **Future:** Sora, Veo, Kling

**Modes:**
1. **Text-to-Video:** Generate from text prompt
2. **Image-to-Video:** Animate a generated image
3. **Image+Text-to-Video:** Image as starting frame with motion prompt

---

### 6. Voice Agent (`voice`)

**Purpose:** Generate natural voiceover narration.

**Providers:**
- **Primary:** ElevenLabs (highest quality, 30+ languages)
- **Fallback:** OpenAI TTS (cost-effective, good quality)

**Features:**
- Voice cloning (ElevenLabs)
- Emotion control
- Speaking rate adjustment
- SSML support for pauses and emphasis

---

### 7. Video Editor Agent (`editor`)

**Purpose:** Compose final video from generated assets.

**Processing Pipeline:**
```
1. Collect assets (images/videos, voiceovers, music)
2. Process each scene:
   a. Set image/video duration to match voiceover
   b. Apply Ken Burns effect (pan/zoom) to static images
   c. Overlay voiceover audio
   d. Add transition to next scene
3. Generate and burn subtitles (SRT → ASS for styling)
4. Mix background music (duck under voiceover)
5. Add intro/outro if configured
6. Add sound effects
7. Export to target format and resolution
```

**Technology:**
- **FFmpeg** for video processing (fastest, most reliable)
- **Remotion** for complex animated graphics (optional)
- **Whisper** for subtitle timing (if voiceover timing not available)

---

### 8. Thumbnail Agent (`thumbnail`)

**Purpose:** Generate high-CTR thumbnails.

**Strategy:**
1. Analyze top-performing thumbnails in the niche (via YouTube API)
2. Generate multiple thumbnail variants
3. Score each for predicted CTR (face detection, text placement, contrast)
4. Return top 3 options

**Design Principles Applied:**
- High contrast
- Face close-up (when applicable)
- Bold text overlay (2-4 words max)
- Emotion-inducing imagery
- Platform-appropriate dimensions

---

### 9. SEO Agent (`seo`)

**Purpose:** Generate search-optimized metadata.

**Output per platform:**
- YouTube: Title (60 chars), Description (5000 chars), Tags (500 chars total), Category
- Instagram: Caption (2200 chars), Hashtags (30 max)
- TikTok: Caption (2200 chars), Hashtags
- LinkedIn: Post text (3000 chars), Hashtags (5 max)
- X/Twitter: Tweet text (280 chars), Hashtags (2-3)

---

### 10. Publishing Agent (`publishing`)

**Purpose:** Publish or schedule content to social media platforms.

**Authentication:** OAuth 2.0 per platform, tokens stored encrypted in Firestore.

**Supported Actions:**
- Publish immediately
- Schedule for future time
- Draft (save to platform as draft)

---

### 11. Analytics Agent (`analytics`)

**Purpose:** Aggregate and analyze content performance.

**Data Sources:**
- YouTube Analytics API
- Instagram Graph API
- TikTok Analytics
- LinkedIn Analytics

**Metrics:**
- Views, impressions, CTR
- Watch time, retention curve
- Engagement (likes, comments, shares, saves)
- Subscriber/follower impact
- Revenue (YouTube)
- Growth trajectory
- AI-generated improvement suggestions
