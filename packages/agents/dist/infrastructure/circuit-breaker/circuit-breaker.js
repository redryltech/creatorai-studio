// ============================================================
// CreatorAI Studio — Circuit Breaker
// ============================================================
// Prevents cascading failures when an AI provider goes down.
//
// States:
//   CLOSED  → Normal operation, requests pass through
//   OPEN    → Provider is down, requests fail immediately (no wasted time/money)
//   HALF_OPEN → Testing if provider has recovered
//
// Why this matters:
// - Runway goes down → Without circuit breaker, every video generation
//   attempt waits for a 60s timeout, queues back up, pipeline stalls.
// - With circuit breaker → After 3 failures, circuit opens,
//   orchestrator switches to fallback provider instantly.
//
// This is not optional infrastructure. It's required for
// any production system that depends on external APIs.
// ============================================================
import { Logger } from '../logger';
const log = Logger.for('CircuitBreaker');
const DEFAULT_CONFIG = {
    failureThreshold: 5,
    resetTimeoutMs: 60000, // 1 minute
    halfOpenSuccessThreshold: 2,
    monitorWindowMs: 120000, // 2 minutes
    errorRateThreshold: 0.5, // 50% error rate
};
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "closed";
    CircuitState["OPEN"] = "open";
    CircuitState["HALF_OPEN"] = "half_open";
})(CircuitState || (CircuitState = {}));
export class CircuitBreaker {
    providerId;
    config;
    state = CircuitState.CLOSED;
    consecutiveFailures = 0;
    consecutiveSuccessesInHalfOpen = 0;
    lastFailureTime = null;
    lastSuccessTime = null;
    circuitOpenedAt = null;
    requestHistory = [];
    constructor(providerId, config = {}) {
        this.providerId = providerId;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /**
     * Execute a function through the circuit breaker.
     * If the circuit is open, throws immediately without calling fn.
     */
    async execute(fn) {
        // Check if we should allow the request
        if (!this.canExecute()) {
            log.warn('Circuit is OPEN — rejecting request', {
                providerId: this.providerId,
                consecutiveFailures: this.consecutiveFailures,
                reopensAt: this.circuitOpenedAt
                    ? new Date(this.circuitOpenedAt.getTime() + this.config.resetTimeoutMs).toISOString()
                    : null,
            });
            throw new Error(`Circuit breaker OPEN for provider "${this.providerId}". ` +
                `${this.consecutiveFailures} consecutive failures. ` +
                `Will retry in ${Math.round(this.config.resetTimeoutMs / 1000)}s.`);
        }
        const startTime = performance.now();
        try {
            const result = await fn();
            const latencyMs = Math.round(performance.now() - startTime);
            this.onSuccess(latencyMs);
            return result;
        }
        catch (error) {
            const latencyMs = Math.round(performance.now() - startTime);
            this.onFailure(latencyMs);
            throw error;
        }
    }
    /**
     * Check if the circuit allows a request through.
     */
    canExecute() {
        switch (this.state) {
            case CircuitState.CLOSED:
                return true;
            case CircuitState.OPEN: {
                // Check if reset timeout has elapsed → transition to half-open
                if (this.circuitOpenedAt) {
                    const elapsed = Date.now() - this.circuitOpenedAt.getTime();
                    if (elapsed >= this.config.resetTimeoutMs) {
                        this.transitionTo(CircuitState.HALF_OPEN);
                        return true;
                    }
                }
                return false;
            }
            case CircuitState.HALF_OPEN:
                // Allow limited requests in half-open state
                return true;
        }
    }
    /**
     * Get the current health state for monitoring.
     */
    getHealthState() {
        const recentRequests = this.getRecentRequests();
        const errorRate = recentRequests.length > 0
            ? recentRequests.filter((r) => !r.success).length / recentRequests.length
            : 0;
        const avgLatency = recentRequests.length > 0
            ? recentRequests.reduce((sum, r) => sum + r.latencyMs, 0) / recentRequests.length
            : 0;
        return {
            providerId: this.providerId,
            status: this.state === CircuitState.CLOSED ? 'healthy'
                : this.state === CircuitState.HALF_OPEN ? 'degraded'
                    : 'unhealthy',
            consecutiveFailures: this.consecutiveFailures,
            lastFailure: this.lastFailureTime,
            lastSuccess: this.lastSuccessTime,
            circuitOpen: this.state === CircuitState.OPEN,
            circuitOpensAt: this.circuitOpenedAt
                ? new Date(this.circuitOpenedAt.getTime() + this.config.resetTimeoutMs)
                : null,
            averageLatencyMs: Math.round(avgLatency),
            requestCount: recentRequests.length,
            errorRate,
        };
    }
    /**
     * Manually reset the circuit breaker (e.g., after fixing a known issue).
     */
    reset() {
        this.transitionTo(CircuitState.CLOSED);
        this.consecutiveFailures = 0;
        this.consecutiveSuccessesInHalfOpen = 0;
        this.requestHistory = [];
        log.info('Circuit breaker manually reset', { providerId: this.providerId });
    }
    // ---- Private ----
    onSuccess(latencyMs) {
        this.recordRequest(true, latencyMs);
        this.consecutiveFailures = 0;
        this.lastSuccessTime = new Date();
        if (this.state === CircuitState.HALF_OPEN) {
            this.consecutiveSuccessesInHalfOpen++;
            if (this.consecutiveSuccessesInHalfOpen >= this.config.halfOpenSuccessThreshold) {
                this.transitionTo(CircuitState.CLOSED);
            }
        }
    }
    onFailure(latencyMs) {
        this.recordRequest(false, latencyMs);
        this.consecutiveFailures++;
        this.lastFailureTime = new Date();
        if (this.state === CircuitState.HALF_OPEN) {
            // Any failure in half-open immediately opens the circuit
            this.transitionTo(CircuitState.OPEN);
            return;
        }
        if (this.state === CircuitState.CLOSED) {
            // Check threshold
            if (this.consecutiveFailures >= this.config.failureThreshold) {
                this.transitionTo(CircuitState.OPEN);
                return;
            }
            // Also check error rate
            const recentRequests = this.getRecentRequests();
            if (recentRequests.length >= 10) {
                const errorRate = recentRequests.filter((r) => !r.success).length / recentRequests.length;
                if (errorRate >= this.config.errorRateThreshold) {
                    this.transitionTo(CircuitState.OPEN);
                }
            }
        }
    }
    transitionTo(newState) {
        const oldState = this.state;
        this.state = newState;
        if (newState === CircuitState.OPEN) {
            this.circuitOpenedAt = new Date();
            this.consecutiveSuccessesInHalfOpen = 0;
        }
        if (newState === CircuitState.CLOSED) {
            this.circuitOpenedAt = null;
            this.consecutiveSuccessesInHalfOpen = 0;
        }
        log.info(`Circuit breaker state transition: ${oldState} → ${newState}`, {
            providerId: this.providerId,
            consecutiveFailures: this.consecutiveFailures,
        });
    }
    recordRequest(success, latencyMs) {
        this.requestHistory.push({
            timestamp: Date.now(),
            success,
            latencyMs,
        });
        // Prune old records outside the monitor window
        const cutoff = Date.now() - this.config.monitorWindowMs;
        this.requestHistory = this.requestHistory.filter((r) => r.timestamp > cutoff);
    }
    getRecentRequests() {
        const cutoff = Date.now() - this.config.monitorWindowMs;
        return this.requestHistory.filter((r) => r.timestamp > cutoff);
    }
}
/**
 * Registry of circuit breakers — one per provider.
 */
export class CircuitBreakerRegistry {
    static instance = null;
    breakers = new Map();
    constructor() { }
    static getInstance() {
        if (!CircuitBreakerRegistry.instance) {
            CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
        }
        return CircuitBreakerRegistry.instance;
    }
    static resetInstance() {
        CircuitBreakerRegistry.instance = null;
    }
    /**
     * Get or create a circuit breaker for a provider.
     */
    getBreaker(providerId, config) {
        let breaker = this.breakers.get(providerId);
        if (!breaker) {
            breaker = new CircuitBreaker(providerId, config);
            this.breakers.set(providerId, breaker);
        }
        return breaker;
    }
    /**
     * Get health states of all providers.
     */
    getAllHealthStates() {
        return Array.from(this.breakers.values()).map((b) => b.getHealthState());
    }
    /**
     * Find the first healthy provider from a list (ordered by preference).
     */
    findHealthyProvider(providerIds) {
        for (const id of providerIds) {
            const breaker = this.breakers.get(id);
            if (!breaker || breaker.canExecute()) {
                return id;
            }
        }
        return null;
    }
}
//# sourceMappingURL=circuit-breaker.js.map