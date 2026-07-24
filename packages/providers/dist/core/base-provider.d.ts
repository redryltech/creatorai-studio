import type { IProvider, RateLimitStatus } from './provider.interface';
interface CircuitBreakerLike {
    execute<T>(fn: () => Promise<T>): Promise<T>;
    canExecute(): boolean;
}
export declare abstract class BaseProvider implements IProvider {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly version: string;
    protected apiKey: string;
    protected baseUrl: string;
    protected timeoutMs: number;
    protected maxRetries: number;
    private circuitBreaker;
    private rateLimitState;
    constructor(config: {
        apiKey: string;
        baseUrl?: string;
        timeoutMs?: number;
        maxRetries?: number;
    });
    /**
     * Inject a circuit breaker for this provider.
     * Called during bootstrap. If not set, requests go through without a breaker.
     */
    setCircuitBreaker(breaker: CircuitBreakerLike): void;
    isAvailable(): Promise<boolean>;
    getRateLimitStatus(): Promise<RateLimitStatus>;
    protected updateRateLimits(headers: {
        remaining?: number;
        limit?: number;
        resetsAt?: Date | null;
    }): void;
    /**
     * Make an HTTP request through the circuit breaker with retry and timeout.
     */
    protected request<T>(path: string, options?: {
        method?: string;
        body?: unknown;
        headers?: Record<string, string>;
        timeoutMs?: number;
    }): Promise<T>;
    /**
     * Get authorization headers. Override for non-Bearer auth schemes.
     */
    protected getAuthHeaders(): Record<string, string>;
}
export {};
//# sourceMappingURL=base-provider.d.ts.map