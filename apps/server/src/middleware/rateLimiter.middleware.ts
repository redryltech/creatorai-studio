// ============================================================
// CreatorAI Studio — Rate Limiting Middleware
// ============================================================

import rateLimit from 'express-rate-limit';
import type { Request } from 'express';
import { env } from '../config/env';

/**
 * General API rate limiter.
 * Applies to all routes.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: env.NODE_ENV === 'development' ? 200 : 60, // More lenient in dev
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.userId ?? req.ip ?? 'anonymous',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please slow down.',
    },
  },
});

/**
 * Strict rate limiter for expensive operations (AI generation).
 */
export const agentRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.NODE_ENV === 'development' ? 30 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.userId ?? req.ip ?? 'anonymous',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many generation requests. Please wait before trying again.',
    },
  },
});

/**
 * Auth route rate limiter (prevent brute force).
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip ?? 'anonymous',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});
