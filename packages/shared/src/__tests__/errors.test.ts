import { describe, it, expect } from 'vitest';
import {
  AppError, ValidationError, AuthenticationError, AuthorizationError,
  NotFoundError, RateLimitError, AgentError, ProviderError,
  ProviderTimeoutError, PipelineError, isOperationalError,
} from '../utils/errors';

describe('Error Hierarchy', () => {
  it('AppError has correct properties', () => {
    const err = new AppError('test', 'TEST_CODE', 500, true, { extra: 1 });
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_CODE');
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
    expect(err.details).toEqual({ extra: 1 });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('ValidationError has status 400', () => {
    const err = new ValidationError('bad input', [{ field: 'x', message: 'required' }]);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.validationErrors).toHaveLength(1);
  });

  it('AuthenticationError has status 401', () => {
    expect(new AuthenticationError().statusCode).toBe(401);
  });

  it('AuthorizationError has status 403', () => {
    expect(new AuthorizationError().statusCode).toBe(403);
  });

  it('NotFoundError formats message with resource and ID', () => {
    const err = new NotFoundError('Project', 'proj_123');
    expect(err.message).toBe('Project not found: proj_123');
    expect(err.statusCode).toBe(404);
  });

  it('RateLimitError has retryAfter', () => {
    const err = new RateLimitError(30);
    expect(err.statusCode).toBe(429);
    expect(err.retryAfter).toBe(30);
  });

  it('AgentError captures agent ID', () => {
    const err = new AgentError('script', 'failed', true);
    expect(err.agentId).toBe('script');
    expect(err.retryable).toBe(true);
  });

  it('ProviderError captures provider details', () => {
    const err = new ProviderError('openai', 'rate limit', true, 429);
    expect(err.providerId).toBe('openai');
    expect(err.statusCode).toBe(429);
  });

  it('ProviderTimeoutError captures timeout info', () => {
    const err = new ProviderTimeoutError('replicate', 30000);
    expect(err.providerId).toBe('replicate');
    expect(err.timeoutMs).toBe(30000);
    expect(err.statusCode).toBe(504);
  });

  it('isOperationalError distinguishes operational from programmer errors', () => {
    expect(isOperationalError(new ValidationError('test'))).toBe(true);
    expect(isOperationalError(new NotFoundError('x', '1'))).toBe(true);
    expect(isOperationalError(new Error('random bug'))).toBe(false);
  });

  it('toJSON serializes for API response', () => {
    const err = new AppError('msg', 'CODE', 400);
    const json = err.toJSON();
    expect(json).toEqual({ code: 'CODE', message: 'msg', details: undefined });
  });
});
