// ============================================================
// CreatorAI Studio — API Types
// ============================================================
// Shared request/response types used by both client and server.
// ============================================================

/**
 * Standard API success response wrapper.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

/**
 * Standard API error response wrapper.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  meta: ApiMeta;
}

/**
 * Response metadata included in every API response.
 */
export interface ApiMeta {
  requestId: string;
  timestamp: string;
}

/**
 * Pagination parameters for list endpoints.
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Rate limit information headers.
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

// ---- Chat Endpoints ----

export interface ChatMessageRequest {
  conversationId: string | null;
  message: string;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
  projectId?: string; // Optional: context project
}

export interface ChatMessageResponse {
  conversationId: string;
  response: {
    id: string;
    role: 'assistant';
    content: string;
    metadata: {
      intent: {
        action: string;
        confidence: number;
        entities: Record<string, unknown>;
      } | null;
      pipelineId: string | null;
      projectIds: string[];
    };
  };
}

// ---- Project Endpoints ----

export interface CreateProjectRequest {
  title: string;
  description?: string;
  contentType: string;
  targetPlatforms: string[];
  settings?: Partial<{
    aspectRatio: string;
    duration: number;
    language: string;
    voiceId: string;
    artStyle: string;
    subtitles: boolean;
  }>;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  settings?: Partial<{
    aspectRatio: string;
    duration: number;
    language: string;
    voiceId: string;
    musicStyle: string;
    artStyle: string;
    subtitles: boolean;
  }>;
}

// ---- Agent Endpoints ----

export interface TrendResearchRequest {
  topic: string;
  platforms: string[];
  count?: number;
  timeRange?: '24h' | '7d' | '30d';
  language?: string;
  niche?: string;
}

export interface ScriptGenerateRequest {
  topic: string;
  contentType: string;
  targetPlatform: string;
  duration?: number;
  style?: string;
  tone?: string;
  language?: string;
  hook?: string;
  keyPoints?: string[];
  brandVoice?: string;
}

export interface ImageGenerateRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  provider?: string;
  model?: string;
  count?: number;
}

export interface VideoGenerateRequest {
  mode: 'text_to_video' | 'image_to_video';
  prompt: string;
  imageUrl?: string;
  duration?: number;
  provider?: string;
}

export interface VoiceGenerateRequest {
  text: string;
  voiceId?: string;
  provider?: string;
  language?: string;
  speed?: number;
  emotion?: string;
}

export interface ThumbnailGenerateRequest {
  topic: string;
  style?: string;
  includeText?: boolean;
  textOverlay?: string;
  count?: number;
}

export interface SeoGenerateRequest {
  topic: string;
  platform: string;
  script?: string;
  language?: string;
  count?: number;
}

export interface ComposeVideoRequest {
  projectId: string;
  format?: {
    width?: number;
    height?: number;
    fps?: number;
    codec?: string;
  };
  subtitles?: {
    enabled: boolean;
    style?: string;
    fontSize?: number;
    color?: string;
  };
  music?: {
    style?: string;
    volume?: number;
  };
  transitions?: {
    type?: string;
    duration?: number;
  };
}

// ---- Publishing Endpoints ----

export interface PublishRequest {
  outputId: string;
  platform: string;
  overrides?: {
    title?: string;
    description?: string;
    tags?: string[];
    hashtags?: string[];
  };
}

export interface SchedulePublishRequest extends PublishRequest {
  scheduledAt: string; // ISO 8601
}

// ---- Pipeline Endpoints ----

export interface PipelineRetryRequest {
  stepId?: string;
  modifiedInput?: Record<string, unknown>;
}

// ---- SSE Event Types ----

export type PipelineEventType =
  | 'step.started'
  | 'step.progress'
  | 'step.completed'
  | 'step.failed'
  | 'pipeline.completed'
  | 'pipeline.failed'
  | 'pipeline.cancelled';

export interface PipelineEvent {
  type: PipelineEventType;
  pipelineId: string;
  timestamp: string;
  data: Record<string, unknown>;
}
