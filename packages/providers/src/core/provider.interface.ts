// ============================================================
// CreatorAI Studio — Provider Interfaces
// ============================================================
// Strategy pattern — each AI capability has an interface.
// Multiple providers can implement the same interface.
// Agents depend on interfaces, not concrete providers.
// ============================================================

/**
 * Base provider interface — all providers implement this.
 */
export interface IProvider {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  /** Check if the provider is configured and reachable */
  isAvailable(): Promise<boolean>;

  /** Get usage/rate limit status */
  getRateLimitStatus(): Promise<RateLimitStatus>;
}

export interface RateLimitStatus {
  remaining: number;
  limit: number;
  resetsAt: Date | null;
}

// ---- LLM Provider ----

/**
 * Language Model provider — for text generation (scripts, SEO, prompts).
 */
export interface ILLMProvider extends IProvider {
  /**
   * Generate text completion.
   */
  complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;

  /**
   * Stream text completion (for chat UI).
   */
  completeStream(
    request: LLMCompletionRequest,
  ): AsyncGenerator<LLMStreamChunk, void, unknown>;
}

export interface LLMCompletionRequest {
  model?: string;
  systemPrompt: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  responseFormat?: 'text' | 'json';
}

export interface LLMCompletionResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter';
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
}

// ---- Image Generation Provider ----

/**
 * Image generation provider — for thumbnails, scene images, graphics.
 */
export interface IImageProvider extends IProvider {
  /**
   * Generate an image from a text prompt.
   */
  generate(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;

  /**
   * List available models.
   */
  listModels(): Promise<ImageModel[]>;
}

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  model?: string;
  width: number;
  height: number;
  count?: number;
  guidanceScale?: number;
  seed?: number;
}

export interface ImageGenerationResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
    seed: number | null;
  }>;
  model: string;
  generationTimeMs: number;
}

export interface ImageModel {
  id: string;
  name: string;
  maxWidth: number;
  maxHeight: number;
  supportsNegativePrompt: boolean;
  costPerImage: number;
}

// ---- Video Generation Provider ----

/**
 * Video generation provider — for scene video clips.
 */
export interface IVideoProvider extends IProvider {
  /**
   * Generate a video from text and/or image.
   */
  generate(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;

  /**
   * Check the status of an async video generation job.
   */
  checkStatus(jobId: string): Promise<VideoJobStatus>;
}

export interface VideoGenerationRequest {
  prompt: string;
  imageUrl?: string;
  model?: string;
  duration: number; // seconds
  aspectRatio?: string;
}

export interface VideoGenerationResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl: string | null;
  estimatedTimeSeconds: number | null;
}

export interface VideoJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl: string | null;
  error: string | null;
}

// ---- Voice/TTS Provider ----

/**
 * Voice synthesis provider — for voiceovers and narration.
 */
export interface IVoiceProvider extends IProvider {
  /**
   * Generate speech from text.
   */
  synthesize(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResponse>;

  /**
   * List available voices.
   */
  listVoices(language?: string): Promise<VoiceOption[]>;
}

export interface VoiceSynthesisRequest {
  text: string;
  voiceId: string;
  model?: string;
  language?: string;
  speed?: number;
  pitch?: number;
  outputFormat?: 'mp3' | 'wav' | 'ogg';
}

export interface VoiceSynthesisResponse {
  audioUrl: string;
  audioBuffer: Buffer;
  duration: number; // seconds
  format: string;
  sizeBytes: number;
  characterCount: number;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  language: string;
  accent: string;
  previewUrl: string | null;
  category: string; // narration, conversational, news, etc.
}

// ---- Search/Trends Provider ----

/**
 * Search provider — for trend research and competitor analysis.
 */
export interface ISearchProvider extends IProvider {
  /**
   * Search for trending topics.
   */
  searchTrends(request: TrendSearchRequest): Promise<TrendSearchResponse>;

  /**
   * Search the web.
   */
  search(request: WebSearchRequest): Promise<WebSearchResponse>;
}

export interface TrendSearchRequest {
  query: string;
  region?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
  category?: string;
}

export interface TrendSearchResponse {
  trends: Array<{
    query: string;
    volume: number;
    growth: number; // percentage
    relatedQueries: string[];
  }>;
}

export interface WebSearchRequest {
  query: string;
  count?: number;
  type?: 'web' | 'news' | 'video';
}

export interface WebSearchResponse {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
    publishedAt: Date | null;
  }>;
}
