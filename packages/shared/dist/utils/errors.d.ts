/**
 * Base application error — all custom errors extend this.
 */
export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly details?: Record<string, unknown>;
    constructor(message: string, code: string, statusCode?: number, isOperational?: boolean, details?: Record<string, unknown>);
    /**
     * Serialize for API response.
     */
    toJSON(): {
        code: string;
        message: string;
        details: Record<string, unknown> | undefined;
    };
}
/**
 * Validation error — invalid input data (400).
 */
export declare class ValidationError extends AppError {
    readonly validationErrors: Array<{
        field: string;
        message: string;
    }>;
    constructor(message: string, validationErrors?: Array<{
        field: string;
        message: string;
    }>);
}
/**
 * Authentication error — missing or invalid credentials (401).
 */
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
/**
 * Authorization error — insufficient permissions (403).
 */
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
/**
 * Not found error (404).
 */
export declare class NotFoundError extends AppError {
    constructor(resource: string, id: string);
}
/**
 * Rate limit error (429).
 */
export declare class RateLimitError extends AppError {
    readonly retryAfter: number;
    constructor(retryAfter?: number);
}
/**
 * Quota exceeded error — plan limits reached (429).
 */
export declare class QuotaExceededError extends AppError {
    constructor(resource: string, limit: number);
}
/**
 * Agent execution error — an agent failed during processing (500).
 */
export declare class AgentError extends AppError {
    readonly agentId: string;
    readonly retryable: boolean;
    constructor(agentId: string, message: string, retryable?: boolean, details?: Record<string, unknown>);
}
/**
 * Provider error — an AI provider returned an error (502).
 */
export declare class ProviderError extends AppError {
    readonly providerId: string;
    readonly providerMessage: string;
    readonly retryable: boolean;
    constructor(providerId: string, providerMessage: string, retryable?: boolean, statusCode?: number);
}
/**
 * Provider timeout error (504).
 */
export declare class ProviderTimeoutError extends AppError {
    readonly providerId: string;
    readonly timeoutMs: number;
    constructor(providerId: string, timeoutMs: number);
}
/**
 * Pipeline error — the pipeline orchestration failed.
 */
export declare class PipelineError extends AppError {
    readonly pipelineId: string;
    readonly failedStep: string | null;
    constructor(pipelineId: string, message: string, failedStep?: string | null);
}
/**
 * Check if an error is an operational error (expected/handled)
 * vs a programmer error (bug).
 */
export declare function isOperationalError(error: Error): boolean;
//# sourceMappingURL=errors.d.ts.map