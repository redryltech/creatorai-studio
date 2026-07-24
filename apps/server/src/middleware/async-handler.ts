// ============================================================
// CreatorAI Studio — Async Route Handler Wrapper
// ============================================================
// Eliminates the try/catch boilerplate from every route.
// Any unhandled promise rejection is forwarded to Express
// error middleware automatically.
//
// Before: router.get('/x', async (req, res, next) => { try { ... } catch(e) { next(e); } });
// After:  router.get('/x', asyncHandler(async (req, res) => { ... }));
// ============================================================

import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;

/**
 * Wraps an async route handler to catch rejected promises
 * and forward them to the Express error middleware.
 */
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
