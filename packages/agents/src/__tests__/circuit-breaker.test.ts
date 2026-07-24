import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker, CircuitBreakerRegistry } from '../infrastructure/circuit-breaker/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test-provider', {
      failureThreshold: 3,
      resetTimeoutMs: 100,
      halfOpenSuccessThreshold: 1,
      monitorWindowMs: 5000,
      errorRateThreshold: 0.5,
    });
  });

  it('starts in closed state (allows requests)', () => {
    expect(breaker.canExecute()).toBe(true);
    expect(breaker.getHealthState().status).toBe('healthy');
  });

  it('passes through successful calls', async () => {
    const result = await breaker.execute(() => Promise.resolve(42));
    expect(result).toBe(42);
    expect(breaker.getHealthState().status).toBe('healthy');
  });

  it('opens after failure threshold', async () => {
    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }
    expect(breaker.canExecute()).toBe(false);
    expect(breaker.getHealthState().circuitOpen).toBe(true);
  });

  it('rejects requests when open', async () => {
    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }
    await expect(breaker.execute(() => Promise.resolve('x'))).rejects.toThrow(/Circuit breaker OPEN/);
  });

  it('transitions to half-open after timeout', async () => {
    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }
    // Wait for reset timeout
    await new Promise((r) => setTimeout(r, 150));
    expect(breaker.canExecute()).toBe(true);
    expect(breaker.getHealthState().status).toBe('degraded'); // half-open
  });

  it('closes after success in half-open', async () => {
    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }
    await new Promise((r) => setTimeout(r, 150));
    await breaker.execute(() => Promise.resolve('recovered'));
    expect(breaker.getHealthState().status).toBe('healthy');
    expect(breaker.canExecute()).toBe(true);
  });

  it('reset() returns to closed state', async () => {
    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }
    breaker.reset();
    expect(breaker.canExecute()).toBe(true);
    expect(breaker.getHealthState().status).toBe('healthy');
  });
});

describe('CircuitBreakerRegistry', () => {
  beforeEach(() => { CircuitBreakerRegistry.resetInstance(); });

  it('creates and retrieves breakers', () => {
    const reg = CircuitBreakerRegistry.getInstance();
    const b1 = reg.getBreaker('openai');
    const b2 = reg.getBreaker('openai');
    expect(b1).toBe(b2); // Same instance
  });

  it('findHealthyProvider returns first healthy', () => {
    const reg = CircuitBreakerRegistry.getInstance();
    reg.getBreaker('p1');
    reg.getBreaker('p2');
    expect(reg.findHealthyProvider(['p1', 'p2'])).toBe('p1');
  });
});
