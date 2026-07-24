// ============================================================
// CreatorAI Studio — Media & Content Types
// ============================================================

/**
 * Trend research result.
 */
export interface TrendIdea {
  title: string;
  description: string;
  angle: string;
  viralScore: number; // 0-100
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  sources: Array<{
    platform: string;
    url: string;
    metric: string;
  }>;
  suggestedContentType: string;
  suggestedHook: string;
  keywords: string[];
}

/**
 * Generated script structure.
 */
export interface Script {
  fullText: string;
  scenes: ScriptScene[];
  metadata: {
    wordCount: number;
    estimatedDuration: number; // seconds
    readabilityScore: number;
    hookStrength: number; // 0-100
    ctaStrength: number; // 0-100
    emotionalArc: string[];
  };
}

/**
 * Individual scene within a script.
 */
export interface ScriptScene {
  id: string;
  order: number;
  type: string;
  narration: string;
  visualDescription: string;
  duration: number; // seconds
  notes: string;
  transition: string;
}

/**
 * AI image/video prompt for a scene.
 */
export interface ScenePrompt {
  sceneId: string;
  imagePrompt: {
    positive: string;
    negative: string;
    width: number;
    height: number;
    guidanceScale: number;
    seed?: number;
  };
  videoPrompt?: {
    positive: string;
    motionDescription: string;
    cameraMovement: string;
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
}

/**
 * Result from image generation.
 */
export interface ImageResult {
  url: string;
  storageRef: string;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
  provider: string;
  model: string;
  prompt: string;
  seed: number | null;
  generationTime: number; // ms
}

/**
 * Result from video generation.
 */
export interface VideoResult {
  url: string;
  storageRef: string;
  width: number;
  height: number;
  duration: number; // seconds
  format: string;
  sizeBytes: number;
  provider: string;
  model: string;
  generationTime: number; // ms
}

/**
 * Result from voice generation.
 */
export interface VoiceResult {
  url: string;
  storageRef: string;
  duration: number; // seconds
  format: string;
  sizeBytes: number;
  provider: string;
  voiceId: string;
  language: string;
  characterCount: number;
}

/**
 * Generated SEO metadata for a platform.
 */
export interface SeoMetadata {
  platform: string;
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  keywords: string[];
  category: string | null;
}

/**
 * Composed video result from editor agent.
 */
export interface ComposedVideo {
  url: string;
  storageRef: string;
  width: number;
  height: number;
  duration: number;
  fps: number;
  format: string;
  codec: string;
  sizeBytes: number;
  hasSubtitles: boolean;
  hasMusic: boolean;
  sceneCount: number;
}

/**
 * Generated thumbnail result.
 */
export interface ThumbnailResult {
  variants: Array<{
    url: string;
    storageRef: string;
    width: number;
    height: number;
    predictedCtr: number; // 0-100
  }>;
}

/**
 * Analytics data for a published piece of content.
 */
export interface ContentAnalytics {
  platform: string;
  postId: string;
  metrics: {
    views: number;
    impressions: number;
    ctr: number; // percentage
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    watchTimeSeconds: number;
    averageWatchPercentage: number;
    subscribersGained: number;
  };
  retention: Array<{
    second: number;
    percentage: number; // 0-100
  }>;
  demographics: {
    topCountries: Array<{ country: string; percentage: number }>;
    ageGroups: Array<{ range: string; percentage: number }>;
    genderSplit: { male: number; female: number; other: number };
  } | null;
  fetchedAt: Date;
}
