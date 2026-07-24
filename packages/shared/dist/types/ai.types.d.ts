/**
 * Token usage for a single LLM call.
 */
export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}
/**
 * Cost record for a single AI operation.
 */
export interface CostRecord {
    id: string;
    userId: string;
    projectId: string | null;
    pipelineId: string | null;
    agentId: string;
    providerId: string;
    model: string;
    operation: 'llm_completion' | 'image_generation' | 'video_generation' | 'voice_synthesis' | 'search';
    tokens: TokenUsage | null;
    costUsd: number;
    metadata: Record<string, unknown>;
    timestamp: Date;
}
/**
 * Prompt template — reusable, versioned prompt definitions.
 * Prompts are never hardcoded in agent logic; they live here.
 */
export interface PromptTemplate {
    id: string;
    name: string;
    version: number;
    category: string;
    systemPrompt: string;
    userPromptTemplate: string;
    variables: string[];
    model: string | null;
    temperature: number;
    maxTokens: number;
    responseFormat: 'text' | 'json';
    metadata: {
        description: string;
        author: string;
        lastUpdated: Date;
        averageTokens: number | null;
        averageCostUsd: number | null;
    };
}
/**
 * Rendered prompt — a template with variables filled in.
 */
export interface RenderedPrompt {
    templateId: string;
    templateVersion: number;
    systemPrompt: string;
    userPrompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
    responseFormat: 'text' | 'json';
}
/**
 * Conversation memory — maintains context across interactions.
 */
export interface ConversationMemory {
    conversationId: string;
    messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
        timestamp: Date;
    }>;
    summary: string | null;
    totalTokens: number;
    maxContextTokens: number;
}
/**
 * Job status for async AI operations.
 */
export declare enum JobStatus {
    PENDING = "pending",
    QUEUED = "queued",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    RETRYING = "retrying"
}
/**
 * Job type identifier.
 */
export declare enum JobType {
    IMAGE_GENERATION = "image_generation",
    VIDEO_GENERATION = "video_generation",
    VOICE_SYNTHESIS = "voice_synthesis",
    VIDEO_COMPOSITION = "video_composition",
    TREND_RESEARCH = "trend_research",
    BULK_GENERATION = "bulk_generation"
}
/**
 * Async job record — persisted to Firestore.
 */
export interface Job {
    id: string;
    type: JobType;
    status: JobStatus;
    userId: string;
    projectId: string | null;
    pipelineId: string | null;
    agentId: string;
    priority: number;
    input: Record<string, unknown>;
    output: Record<string, unknown> | null;
    error: {
        code: string;
        message: string;
        retryable: boolean;
    } | null;
    progress: number;
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    expiresAt: Date;
}
/**
 * Provider health state used by the circuit breaker.
 */
export interface ProviderHealthState {
    providerId: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    consecutiveFailures: number;
    lastFailure: Date | null;
    lastSuccess: Date | null;
    circuitOpen: boolean;
    circuitOpensAt: Date | null;
    averageLatencyMs: number;
    requestCount: number;
    errorRate: number;
}
/**
 * Streaming chunk from an LLM response.
 */
export interface StreamChunk {
    type: 'content' | 'tool_call' | 'done' | 'error';
    content: string;
    accumulated: string;
    tokensSoFar: number | null;
    finishReason: string | null;
}
/**
 * Model pricing per 1K tokens (or per unit for non-LLM).
 */
export interface ModelPricing {
    providerId: string;
    model: string;
    inputPer1kTokens: number;
    outputPer1kTokens: number;
    perImage: number | null;
    perSecondVideo: number | null;
    perCharacterVoice: number | null;
    lastUpdated: Date;
}
//# sourceMappingURL=ai.types.d.ts.map