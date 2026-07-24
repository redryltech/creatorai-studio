// ============================================================
// CreatorAI Studio — Core Enums
// ============================================================
// These enums are the shared vocabulary across every layer
// of the system: agents, orchestrator, API, and frontend.
// ============================================================
/**
 * Content types supported by the platform.
 * Each type maps to different script templates, prompt strategies,
 * and editing workflows.
 */
export var ContentType;
(function (ContentType) {
    ContentType["FACELESS"] = "faceless";
    ContentType["ANIMATED"] = "animated";
    ContentType["CINEMATIC"] = "cinematic";
    ContentType["DOCUMENTARY"] = "documentary";
    ContentType["STORYTELLING"] = "storytelling";
    ContentType["PRODUCT_AD"] = "product_ad";
    ContentType["EDUCATIONAL"] = "educational";
    ContentType["MOTIVATIONAL"] = "motivational";
    ContentType["AI_AVATAR"] = "ai_avatar";
    ContentType["PODCAST_CLIP"] = "podcast_clip";
    ContentType["NEWS"] = "news";
    ContentType["SHORT_FORM"] = "short_form";
    ContentType["LONG_FORM"] = "long_form";
})(ContentType || (ContentType = {}));
/**
 * Target social media platforms.
 * Each platform has different specs (aspect ratio, duration limits,
 * character limits, hashtag rules).
 */
export var Platform;
(function (Platform) {
    Platform["YOUTUBE"] = "youtube";
    Platform["YOUTUBE_SHORTS"] = "youtube_shorts";
    Platform["INSTAGRAM"] = "instagram";
    Platform["INSTAGRAM_REELS"] = "instagram_reels";
    Platform["FACEBOOK"] = "facebook";
    Platform["TIKTOK"] = "tiktok";
    Platform["LINKEDIN"] = "linkedin";
    Platform["X"] = "x";
    Platform["PINTEREST"] = "pinterest";
})(Platform || (Platform = {}));
/**
 * Project lifecycle status.
 */
export var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["DRAFT"] = "draft";
    ProjectStatus["PROCESSING"] = "processing";
    ProjectStatus["COMPLETED"] = "completed";
    ProjectStatus["FAILED"] = "failed";
    ProjectStatus["PUBLISHED"] = "published";
    ProjectStatus["ARCHIVED"] = "archived";
})(ProjectStatus || (ProjectStatus = {}));
/**
 * Pipeline execution status.
 */
export var PipelineStatus;
(function (PipelineStatus) {
    PipelineStatus["QUEUED"] = "queued";
    PipelineStatus["RUNNING"] = "running";
    PipelineStatus["PAUSED"] = "paused";
    PipelineStatus["COMPLETED"] = "completed";
    PipelineStatus["FAILED"] = "failed";
    PipelineStatus["CANCELLED"] = "cancelled";
})(PipelineStatus || (PipelineStatus = {}));
/**
 * Individual pipeline step status.
 */
export var StepStatus;
(function (StepStatus) {
    StepStatus["PENDING"] = "pending";
    StepStatus["RUNNING"] = "running";
    StepStatus["COMPLETED"] = "completed";
    StepStatus["FAILED"] = "failed";
    StepStatus["SKIPPED"] = "skipped";
    StepStatus["RETRYING"] = "retrying";
})(StepStatus || (StepStatus = {}));
/**
 * Agent identifiers — unique ID for each agent in the registry.
 */
export var AgentId;
(function (AgentId) {
    AgentId["TREND"] = "trend";
    AgentId["SCRIPT"] = "script";
    AgentId["PROMPT"] = "prompt";
    AgentId["IMAGE"] = "image";
    AgentId["VIDEO"] = "video";
    AgentId["VOICE"] = "voice";
    AgentId["EDITOR"] = "editor";
    AgentId["THUMBNAIL"] = "thumbnail";
    AgentId["SEO"] = "seo";
    AgentId["PUBLISHING"] = "publishing";
    AgentId["ANALYTICS"] = "analytics";
})(AgentId || (AgentId = {}));
/**
 * AI provider identifiers.
 */
export var ProviderId;
(function (ProviderId) {
    ProviderId["OPENAI"] = "openai";
    ProviderId["ANTHROPIC"] = "anthropic";
    ProviderId["REPLICATE"] = "replicate";
    ProviderId["ELEVENLABS"] = "elevenlabs";
    ProviderId["RUNWAY"] = "runway";
    ProviderId["OPENAI_TTS"] = "openai_tts";
    ProviderId["OPENAI_DALLE"] = "openai_dalle";
    ProviderId["SERPAPI"] = "serpapi";
    ProviderId["PEXELS"] = "pexels";
})(ProviderId || (ProviderId = {}));
/**
 * Media asset types.
 */
export var AssetType;
(function (AssetType) {
    AssetType["IMAGE"] = "image";
    AssetType["VIDEO"] = "video";
    AssetType["AUDIO"] = "audio";
    AssetType["THUMBNAIL"] = "thumbnail";
    AssetType["MUSIC"] = "music";
    AssetType["SUBTITLE"] = "subtitle";
})(AssetType || (AssetType = {}));
/**
 * Video aspect ratios.
 */
export var AspectRatio;
(function (AspectRatio) {
    AspectRatio["LANDSCAPE"] = "16:9";
    AspectRatio["PORTRAIT"] = "9:16";
    AspectRatio["SQUARE"] = "1:1";
})(AspectRatio || (AspectRatio = {}));
/**
 * Script writing styles.
 */
export var ScriptStyle;
(function (ScriptStyle) {
    ScriptStyle["HOOK_STORY_CTA"] = "hook_story_cta";
    ScriptStyle["EDUCATIONAL"] = "educational";
    ScriptStyle["STORYTELLING"] = "storytelling";
    ScriptStyle["LISTICLE"] = "listicle";
    ScriptStyle["DOCUMENTARY"] = "documentary";
    ScriptStyle["VIRAL"] = "viral";
    ScriptStyle["EMOTIONAL"] = "emotional";
    ScriptStyle["COMPARISON"] = "comparison";
    ScriptStyle["MOTIVATIONAL"] = "motivational";
})(ScriptStyle || (ScriptStyle = {}));
/**
 * Visual art styles for AI generation.
 */
export var ArtStyle;
(function (ArtStyle) {
    ArtStyle["PHOTOREALISTIC"] = "photorealistic";
    ArtStyle["CINEMATIC"] = "cinematic";
    ArtStyle["ANIME"] = "anime";
    ArtStyle["CARTOON"] = "cartoon";
    ArtStyle["WATERCOLOR"] = "watercolor";
    ArtStyle["OIL_PAINTING"] = "oil_painting";
    ArtStyle["DIGITAL_ART"] = "digital_art";
    ArtStyle["MINIMALIST"] = "minimalist";
    ArtStyle["RETRO"] = "retro";
    ArtStyle["NEON"] = "neon";
    ArtStyle["DARK_MOODY"] = "dark_moody";
    ArtStyle["BRIGHT_VIBRANT"] = "bright_vibrant";
    ArtStyle["THREE_D_RENDER"] = "3d_render";
    ArtStyle["PIXEL_ART"] = "pixel_art";
    ArtStyle["COMIC_BOOK"] = "comic_book";
})(ArtStyle || (ArtStyle = {}));
/**
 * Publishing status for outputs.
 */
export var PublishStatus;
(function (PublishStatus) {
    PublishStatus["READY"] = "ready";
    PublishStatus["SCHEDULED"] = "scheduled";
    PublishStatus["PUBLISHING"] = "publishing";
    PublishStatus["PUBLISHED"] = "published";
    PublishStatus["FAILED"] = "failed";
})(PublishStatus || (PublishStatus = {}));
/**
 * User subscription plans.
 */
export var UserPlan;
(function (UserPlan) {
    UserPlan["FREE"] = "free";
    UserPlan["PRO"] = "pro";
    UserPlan["ENTERPRISE"] = "enterprise";
})(UserPlan || (UserPlan = {}));
/**
 * Chat message roles.
 */
export var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "user";
    MessageRole["ASSISTANT"] = "assistant";
    MessageRole["SYSTEM"] = "system";
})(MessageRole || (MessageRole = {}));
/**
 * Intent actions the AI chat can parse.
 */
export var IntentAction;
(function (IntentAction) {
    IntentAction["CREATE_VIDEO"] = "create_video";
    IntentAction["CREATE_THUMBNAIL"] = "create_thumbnail";
    IntentAction["GENERATE_SCRIPT"] = "generate_script";
    IntentAction["GENERATE_VOICEOVER"] = "generate_voiceover";
    IntentAction["RESEARCH_TRENDS"] = "research_trends";
    IntentAction["GENERATE_IDEAS"] = "generate_ideas";
    IntentAction["SCHEDULE_POST"] = "schedule_post";
    IntentAction["PUBLISH_NOW"] = "publish_now";
    IntentAction["EDIT_PROJECT"] = "edit_project";
    IntentAction["GET_ANALYTICS"] = "get_analytics";
    IntentAction["GENERATE_SEO"] = "generate_seo";
    IntentAction["GENERAL_CHAT"] = "general_chat";
})(IntentAction || (IntentAction = {}));
/**
 * Scene types within a script.
 */
export var SceneType;
(function (SceneType) {
    SceneType["HOOK"] = "hook";
    SceneType["INTRO"] = "intro";
    SceneType["BODY"] = "body";
    SceneType["CLIMAX"] = "climax";
    SceneType["CTA"] = "cta";
    SceneType["OUTRO"] = "outro";
    SceneType["TRANSITION"] = "transition";
})(SceneType || (SceneType = {}));
/**
 * Video transition types.
 */
export var TransitionType;
(function (TransitionType) {
    TransitionType["CUT"] = "cut";
    TransitionType["CROSSFADE"] = "crossfade";
    TransitionType["FADE_BLACK"] = "fade_black";
    TransitionType["FADE_WHITE"] = "fade_white";
    TransitionType["SLIDE_LEFT"] = "slide_left";
    TransitionType["SLIDE_RIGHT"] = "slide_right";
    TransitionType["ZOOM_IN"] = "zoom_in";
    TransitionType["ZOOM_OUT"] = "zoom_out";
    TransitionType["WIPE"] = "wipe";
    TransitionType["GLITCH"] = "glitch";
})(TransitionType || (TransitionType = {}));
//# sourceMappingURL=enums.js.map