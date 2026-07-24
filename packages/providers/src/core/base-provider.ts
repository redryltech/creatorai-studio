// ============================================================
// CreatorAI Studio — Base Provider (with Circuit Breaker)
// ============================================================
// Every provider inherits retry logic, timeout handling,
// rate limit tracking, and circuit breaker integration.
//
// No agent ever calls a provider directly. The flow is:
//   Agent → Provider.method() → CircuitBreaker.execute() → HTTP request
// ============================================================

import type { IProvider, RateLimitStatus } from './provider.interface';
import { ProviderError, ProviderTimeoutError, retryWithBackoff } from '@creatorai/shared';

// We import the circuit breaker type but inject it — no hard dependency.
// In production, this is provided by the agent infrastructure layer.
interface CircuitBreakerLike {
  execute<T>(fn: () => Promise<T>): Promise<T>;
  canExecute(): boolean;
}

export abstract class BaseProvider implements IProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;

  protected apiKey: string;
  protected baseUrl: string;
  protected timeoutMs: number;
  protected maxRetries: number;
  private circuitBreaker: CircuitBreakerLike | null = null;

  private rateLimitState: RateLimitStatus = {
    remaining: -1,
    limit: -1,
    resetsAt: null,
  };

  constructor(config: {
    apiKey: string;
    baseUrl?: string;
    timeoutMs?: number;
    maxRetries?: number;
  }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? '';
    this.timeoutMs = config.timeoutMs ?? 60000;
    this.maxRetries = config.maxRetries ?? 2;
  }

  /**
   * Inject a circuit breaker for this provider.
   * Called during bootstrap. If not set, requests go through without a breaker.
   */
  setCircuitBreaker(breaker: CircuitBreakerLike): void {
    this.circuitBreaker = breaker;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || this.apiKey.length === 0) return false;
    if (this.circuitBreaker && !this.circuitBreaker.canExecute()) return false;
    return true;
  }

  async getRateLimitStatus(): Promise<RateLimitStatus> {
    return { ...this.rateLimitState };
  }

  protected updateRateLimits(headers: {
    remaining?: number;
    limit?: number;
    resetsAt?: Date | null;
  }): void {
    if (headers.remaining !== undefined) this.rateLimitState.remaining = headers.remaining;
    if (headers.limit !== undefined) this.rateLimitState.limit = headers.limit;
    if (headers.resetsAt !== undefined) this.rateLimitState.resetsAt = headers.resetsAt;
  }

  /**
   * Make an HTTP request through the circuit breaker with retry and timeout.
   */
  protected async request<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      headers?: Record<string, string>;
      timeoutMs?: number;
    } = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const timeout = options.timeoutMs ?? this.timeoutMs;

    const doRequest = async (): Promise<T> => {
      return retryWithBackoff(
        async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          try {
            const response = await fetch(url, {
              method: options.method ?? 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
                ...options.headers,
              },
              body: options.body ? JSON.stringify(options.body) : undefined,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Update rate limits from response headers
            this.updateRateLimits({
              remaining: parseHeaderInt(response.headers.get('x-ratelimit-remaining')),
              limit: parseHeaderInt(response.headers.get('x-ratelimit-limit')),
              resetsAt: parseHeaderDate(response.headers.get('x-ratelimit-reset')),
            });

            if (!response.ok) {
              const errorBody = await response.text().catch(() => 'Unknown error');
              const retryable = response.status >= 500 || response.status === 429;
              throw new ProviderError(this.id, `HTTP ${response.status}: ${errorBody}`, retryable, response.status);
            }

            return (await response.json()) as T;
          } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof ProviderError) throw error;

            if (error instanceof DOMException && error.name === 'AbortError') {
              throw new ProviderTimeoutError(this.id, timeout);
            }

            throw new ProviderError(
              this.id,
              error instanceof Error ? error.message : String(error),
              true,
            );
          }
        },
        this.maxRetries,
        1000,
        (error) => {
          if (error instanceof ProviderError) return error.retryable;
          if (error instanceof ProviderTimeoutError) return true;
          return false;
        },
      );
    };

    // Execute through circuit breaker if available
    if (this.circuitBreaker) {
      return this.circuitBreaker.execute(doRequest);
    }

    return doRequest();
  }

  /**
   * Get authorization headers. Override for non-Bearer auth schemes.
   */
  protected getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }
}

// ---- Helpers ----

function parseHeaderInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

function parseHeaderDate(value: string | null): Date | null {
  if (!value) return null;
  const timestamp = parseInt(value, 10);
  if (isNaN(timestamp)) return null;
  return new Date(timestamp * 1000);
}
