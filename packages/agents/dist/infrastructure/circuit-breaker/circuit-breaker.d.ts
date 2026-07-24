import type { ProviderHealthState } from '@creatorai/shared';
export interface CircuitBreakerConfig {
    /** Number of consecutive failures before opening the circuit */
    failureThreshold: number;
    /** How long the circuit stays open before trying half-open (ms) */
    resetTimeoutMs: number;
    /** Number of successes in half-open state to close the circuit */
    halfOpenSuccessThreshold: number;
    /** Window for calculating error rate (ms) */
    monitorWindowMs: number;
    /** Error rate threshold to open circuit (0.0-1.0) */
    errorRateThreshold: number;
}
export declare class CircuitBreaker {
    private readonly providerId;
    private readonly config;
    private state;
    private consecutiveFailures;
    private consecutiveSuccessesInHalfOpen;
    private lastFailureTime;
    private lastSuccessTime;
    private circuitOpenedAt;
    private requestHistory;
    constructor(providerId: string, config?: Partial<CircuitBreakerConfig>);
    /**
     * Execute a function through the circuit breaker.
     * If the circuit is open, throws immediately without calling fn.
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Check if the circuit allows a request through.
     */
    canExecute(): boolean;
    /**
     * Get the current health state for monitoring.
     */
    getHealthState(): ProviderHealthState;
    /**
     * Manually reset the circuit breaker (e.g., after fixing a known issue).
     */
    reset(): void;
    private onSuccess;
    private onFailure;
    private transitionTo;
    private recordRequest;
    private getRecentRequests;
}
/**
 * Registry of circuit breakers — one per provider.
 */
export declare class CircuitBreakerRegistry {
    private static instance;
    private breakers;
    private constructor();
    static getInstance(): CircuitBreakerRegistry;
    static resetInstance(): void;
    /**
     * Get or create a circuit breaker for a provider.
     */
    getBreaker(providerId: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker;
    /**
     * Get health states of all providers.
     */
    getAllHealthStates(): ProviderHealthState[];
    /**
     * Find the first healthy provider from a list (ordered by preference).
     */
    findHealthyProvider(providerIds: string[]): string | null;
}
//# sourceMappingURL=circuit-breaker.d.ts.map