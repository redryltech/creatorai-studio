/**
 * Content types supported by the platform.
 * Each type maps to different script templates, prompt strategies,
 * and editing workflows.
 */
export declare enum ContentType {
    FACELESS = "faceless",
    ANIMATED = "animated",
    CINEMATIC = "cinematic",
    DOCUMENTARY = "documentary",
    STORYTELLING = "storytelling",
    PRODUCT_AD = "product_ad",
    EDUCATIONAL = "educational",
    MOTIVATIONAL = "motivational",
    AI_AVATAR = "ai_avatar",
    PODCAST_CLIP = "podcast_clip",
    NEWS = "news",
    SHORT_FORM = "short_form",
    LONG_FORM = "long_form"
}
/**
 * Target social media platforms.
 * Each platform has different specs (aspect ratio, duration limits,
 * character limits, hashtag rules).
 */
export declare enum Platform {
    YOUTUBE = "youtube",
    YOUTUBE_SHORTS = "youtube_shorts",
    INSTAGRAM = "instagram",
    INSTAGRAM_REELS = "instagram_reels",
    FACEBOOK = "facebook",
    TIKTOK = "tiktok",
    LINKEDIN = "linkedin",
    X = "x",
    PINTEREST = "pinterest"
}
/**
 * Project lifecycle status.
 */
export declare enum ProjectStatus {
    DRAFT = "draft",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
/**
 * Pipeline execution status.
 */
export declare enum PipelineStatus {
    QUEUED = "queued",
    RUNNING = "running",
    PAUSED = "paused",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
/**
 * Individual pipeline step status.
 */
export declare enum StepStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    SKIPPED = "skipped",
    RETRYING = "retrying"
}
/**
 * Agent identifiers — unique ID for each agent in the registry.
 */
export declare enum AgentId {
    TREND = "trend",
    SCRIPT = "script",
    PROMPT = "prompt",
    IMAGE = "image",
    VIDEO = "video",
    VOICE = "voice",
    EDITOR = "editor",
    THUMBNAIL = "thumbnail",
    SEO = "seo",
    PUBLISHING = "publishing",
    ANALYTICS = "analytics"
}
/**
 * AI provider identifiers.
 */
export declare enum ProviderId {
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
    REPLICATE = "replicate",
    ELEVENLABS = "elevenlabs",
    RUNWAY = "runway",
    OPENAI_TTS = "openai_tts",
    OPENAI_DALLE = "openai_dalle",
    SERPAPI = "serpapi",
    PEXELS = "pexels"
}
/**
 * Media asset types.
 */
export declare enum AssetType {
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    THUMBNAIL = "thumbnail",
    MUSIC = "music",
    SUBTITLE = "subtitle"
}
/**
 * Video aspect ratios.
 */
export declare enum AspectRatio {
    LANDSCAPE = "16:9",
    PORTRAIT = "9:16",
    SQUARE = "1:1"
}
/**
 * Script writing styles.
 */
export declare enum ScriptStyle {
    HOOK_STORY_CTA = "hook_story_cta",
    EDUCATIONAL = "educational",
    STORYTELLING = "storytelling",
    LISTICLE = "listicle",
    DOCUMENTARY = "documentary",
    VIRAL = "viral",
    EMOTIONAL = "emotional",
    COMPARISON = "comparison",
    MOTIVATIONAL = "motivational"
}
/**
 * Visual art styles for AI generation.
 */
export declare enum ArtStyle {
    PHOTOREALISTIC = "photorealistic",
    CINEMATIC = "cinematic",
    ANIME = "anime",
    CARTOON = "cartoon",
    WATERCOLOR = "watercolor",
    OIL_PAINTING = "oil_painting",
    DIGITAL_ART = "digital_art",
    MINIMALIST = "minimalist",
    RETRO = "retro",
    NEON = "neon",
    DARK_MOODY = "dark_moody",
    BRIGHT_VIBRANT = "bright_vibrant",
    THREE_D_RENDER = "3d_render",
    PIXEL_ART = "pixel_art",
    COMIC_BOOK = "comic_book"
}
/**
 * Publishing status for outputs.
 */
export declare enum PublishStatus {
    READY = "ready",
    SCHEDULED = "scheduled",
    PUBLISHING = "publishing",
    PUBLISHED = "published",
    FAILED = "failed"
}
/**
 * User subscription plans.
 */
export declare enum UserPlan {
    FREE = "free",
    PRO = "pro",
    ENTERPRISE = "enterprise"
}
/**
 * Chat message roles.
 */
export declare enum MessageRole {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system"
}
/**
 * Intent actions the AI chat can parse.
 */
export declare enum IntentAction {
    CREATE_VIDEO = "create_video",
    CREATE_THUMBNAIL = "create_thumbnail",
    GENERATE_SCRIPT = "generate_script",
    GENERATE_VOICEOVER = "generate_voiceover",
    RESEARCH_TRENDS = "research_trends",
    GENERATE_IDEAS = "generate_ideas",
    SCHEDULE_POST = "schedule_post",
    PUBLISH_NOW = "publish_now",
    EDIT_PROJECT = "edit_project",
    GET_ANALYTICS = "get_analytics",
    GENERATE_SEO = "generate_seo",
    GENERAL_CHAT = "general_chat"
}
/**
 * Scene types within a script.
 */
export declare enum SceneType {
    HOOK = "hook",
    INTRO = "intro",
    BODY = "body",
    CLIMAX = "climax",
    CTA = "cta",
    OUTRO = "outro",
    TRANSITION = "transition"
}
/**
 * Video transition types.
 */
export declare enum TransitionType {
    CUT = "cut",
    CROSSFADE = "crossfade",
    FADE_BLACK = "fade_black",
    FADE_WHITE = "fade_white",
    SLIDE_LEFT = "slide_left",
    SLIDE_RIGHT = "slide_right",
    ZOOM_IN = "zoom_in",
    ZOOM_OUT = "zoom_out",
    WIPE = "wipe",
    GLITCH = "glitch"
}
//# sourceMappingURL=enums.d.ts.map