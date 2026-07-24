// ============================================================
// CreatorAI Studio — Error Classes
// ============================================================
// Structured error hierarchy for consistent error handling
// across the entire platform.
// ============================================================
/**
 * Base application error — all custom errors extend this.
 */
export class AppError extends Error {
    code;
    statusCode;
    isOperational;
    details;
    constructor(message, code, statusCode = 500, isOperational = true, details) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        // Maintain proper prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
        // Capture stack trace (V8 engines only)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    /**
     * Serialize for API response.
     */
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
        };
    }
}
/**
 * Validation error — invalid input data (400).
 */
export class ValidationError extends AppError {
    validationErrors;
    constructor(message, validationErrors = []) {
        super(message, 'VALIDATION_ERROR', 400, true, { validationErrors });
        this.validationErrors = validationErrors;
    }
}
/**
 * Authentication error — missing or invalid credentials (401).
 */
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 'UNAUTHORIZED', 401);
    }
}
/**
 * Authorization error — insufficient permissions (403).
 */
export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 'FORBIDDEN', 403);
    }
}
/**
 * Not found error (404).
 */
export class NotFoundError extends AppError {
    constructor(resource, id) {
        super(`${resource} not found: ${id}`, 'NOT_FOUND', 404);
    }
}
/**
 * Rate limit error (429).
 */
export class RateLimitError extends AppError {
    retryAfter; // seconds
    constructor(retryAfter = 60) {
        super('Rate limit exceeded', 'RATE_LIMITED', 429, true, { retryAfter });
        this.retryAfter = retryAfter;
    }
}
/**
 * Quota exceeded error — plan limits reached (429).
 */
export class QuotaExceededError extends AppError {
    constructor(resource, limit) {
        super(`Quota exceeded for ${resource}. Limit: ${limit}. Upgrade your plan for higher limits.`, 'QUOTA_EXCEEDED', 429, true, { resource, limit });
    }
}
/**
 * Agent execution error — an agent failed during processing (500).
 */
export class AgentError extends AppError {
    agentId;
    retryable;
    constructor(agentId, message, retryable = true, details) {
        super(message, 'AGENT_ERROR', 500, true, { ...details, agentId });
        this.agentId = agentId;
        this.retryable = retryable;
    }
}
/**
 * Provider error — an AI provider returned an error (502).
 */
export class ProviderError extends AppError {
    providerId;
    providerMessage;
    retryable;
    constructor(providerId, providerMessage, retryable = true, statusCode = 502) {
        super(`Provider ${providerId} error: ${providerMessage}`, 'PROVIDER_ERROR', statusCode, true, { providerId, providerMessage });
        this.providerId = providerId;
        this.providerMessage = providerMessage;
        this.retryable = retryable;
    }
}
/**
 * Provider timeout error (504).
 */
export class ProviderTimeoutError extends AppError {
    providerId;
    timeoutMs;
    constructor(providerId, timeoutMs) {
        super(`Provider ${providerId} timed out after ${timeoutMs}ms`, 'PROVIDER_TIMEOUT', 504, true, { providerId, timeoutMs });
        this.providerId = providerId;
        this.timeoutMs = timeoutMs;
    }
}
/**
 * Pipeline error — the pipeline orchestration failed.
 */
export class PipelineError extends AppError {
    pipelineId;
    failedStep;
    constructor(pipelineId, message, failedStep = null) {
        super(message, 'PIPELINE_ERROR', 500, true, { pipelineId, failedStep });
        this.pipelineId = pipelineId;
        this.failedStep = failedStep;
    }
}
/**
 * Check if an error is an operational error (expected/handled)
 * vs a programmer error (bug).
 */
export function isOperationalError(error) {
    if (error instanceof AppError) {
        return error.isOperational;
    }
    return false;
}
//# sourceMappingURL=errors.js.map