// ============================================================
// CreatorAI Studio — Type-Safe API Client
// ============================================================
// Central HTTP client for all backend API calls.
// Handles auth token injection, error parsing, and retries.
//
// Every API call in the frontend goes through this client —
// never use raw fetch() for API calls.
// ============================================================

import { getClientAuth } from './firebase';
import type { ApiResponse, ApiErrorResponse } from '@creatorai/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/**
 * API error thrown by the client.
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Get the current user's Firebase ID token for API authentication.
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const auth = getClientAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Make an authenticated API request.
 *
 * @param path - API endpoint path (e.g., "/projects")
 * @param options - Fetch options
 * @returns Parsed response data
 */
async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    requireAuth?: boolean;
  } = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, requireAuth = true } = options;

  // Get auth token — in development, proceed without token
  const token = await getAuthToken();
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

  if (requireAuth && !token && !isDev) {
    throw new ApiError('UNAUTHORIZED', 'Not authenticated', 401);
  }

  const url = `${API_BASE_URL}${path}`;
  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    fetchHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: fetchHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse response
  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = responseData as ApiErrorResponse | null;
    throw new ApiError(
      errorData?.error?.code ?? 'UNKNOWN_ERROR',
      errorData?.error?.message ?? `HTTP ${response.status}`,
      response.status,
      errorData?.error?.details,
    );
  }

  const successData = responseData as ApiResponse<T>;
  return successData.data;
}

// ============================================================
// API Client — organized by domain
// ============================================================

export const api = {
  // ---- Chat ----
  chat: {
    sendMessage: (data: {
      conversationId: string | null;
      message: string;
      attachments?: Array<{ type: string; url: string; name: string }>;
      projectId?: string;
    }) => request<{
      conversationId: string;
      response: {
        id: string;
        role: 'assistant';
        content: string;
        metadata: {
          intent: unknown | null;
          pipelineId: string | null;
          projectIds: string[];
        };
      };
    }>('/chat/message', { method: 'POST', body: data }),

    getConversations: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      const qs = query.toString();
      return request<{
        items: Array<{
          id: string;
          title: string;
          messageCount: number;
          updatedAt: string;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }>(`/chat/conversations${qs ? `?${qs}` : ''}`);
    },

    getConversation: (id: string) =>
      request<{
        id: string;
        title: string;
        messages: Array<{
          id: string;
          role: string;
          content: string;
          timestamp: string;
        }>;
      }>(`/chat/conversations/${id}`),

    deleteConversation: (id: string) =>
      request<{ deleted: boolean }>(`/chat/conversations/${id}`, { method: 'DELETE' }),
  },

  // ---- Projects ----
  projects: {
    create: (data: {
      title: string;
      description?: string;
      contentType: string;
      targetPlatforms: string[];
      settings?: Record<string, unknown>;
    }) => request<unknown>('/projects', { method: 'POST', body: data }),

    list: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      contentType?: string;
      search?: string;
    }) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) query.set(key, String(value));
        });
      }
      const qs = query.toString();
      return request<{
        items: unknown[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }>(`/projects${qs ? `?${qs}` : ''}`);
    },

    get: (id: string) => request<unknown>(`/projects/${id}`),

    update: (id: string, data: Record<string, unknown>) =>
      request<unknown>(`/projects/${id}`, { method: 'PATCH', body: data }),

    delete: (id: string) =>
      request<{ deleted: boolean }>(`/projects/${id}`, { method: 'DELETE' }),

    getScenes: (projectId: string) => request<unknown[]>(`/projects/${projectId}/scenes`),

    getOutputs: (projectId: string) => request<unknown[]>(`/projects/${projectId}/outputs`),
  },

  // ---- Pipelines ----
  pipelines: {
    get: (id: string) => request<unknown>(`/pipelines/${id}`),

    pause: (id: string) =>
      request<unknown>(`/pipelines/${id}/pause`, { method: 'POST' }),

    resume: (id: string) =>
      request<unknown>(`/pipelines/${id}/resume`, { method: 'POST' }),

    cancel: (id: string) =>
      request<unknown>(`/pipelines/${id}/cancel`, { method: 'POST' }),

    retry: (id: string, data?: { stepId?: string; modifiedInput?: Record<string, unknown> }) =>
      request<unknown>(`/pipelines/${id}/retry`, { method: 'POST', body: data }),
  },

  // ---- Agents (Direct Invocation) ----
  agents: {
    researchTrends: (data: {
      topic: string;
      platforms: string[];
      count?: number;
      timeRange?: string;
    }) => request<unknown>('/agents/trend/research', { method: 'POST', body: data }),

    generateScript: (data: {
      topic: string;
      contentType: string;
      targetPlatform: string;
      duration?: number;
      style?: string;
      tone?: string;
    }) => request<unknown>('/agents/script/generate', { method: 'POST', body: data }),

    generateImage: (data: {
      prompt: string;
      negativePrompt?: string;
      width?: number;
      height?: number;
      count?: number;
    }) => request<unknown>('/agents/image/generate', { method: 'POST', body: data }),

    generateVoiceover: (data: {
      text: string;
      voiceId?: string;
      language?: string;
      speed?: number;
    }) => request<unknown>('/agents/voice/generate', { method: 'POST', body: data }),

    generateThumbnail: (data: {
      topic: string;
      style?: string;
      textOverlay?: string;
      count?: number;
    }) => request<unknown>('/agents/thumbnail/generate', { method: 'POST', body: data }),

    generateSeo: (data: {
      topic: string;
      platform: string;
      script?: string;
      count?: number;
    }) => request<unknown>('/agents/seo/generate', { method: 'POST', body: data }),
  },

  // ---- Health ----
  health: {
    check: () => request<{ status: string }>('/health', { requireAuth: false }),
  },
};
