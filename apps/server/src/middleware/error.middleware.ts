// ============================================================
// CreatorAI Studio — Error Handling Middleware
// ============================================================
// Centralized error handler — catches all errors from routes
// and sends consistent, structured error responses.
// ============================================================

import type { Request, Response, NextFunction } from 'express';
import { AppError, isOperationalError } from '@creatorai/shared';
import { env } from '../config/env';

/**
 * Global error handling middleware.
 * Must be the LAST middleware registered on the Express app.
 */
export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Generate a unique request ID for tracing
  const requestId = req.headers['x-request-id'] as string ?? generateRequestId();

  // Determine HTTP status code
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let details: unknown = undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    details = error.details;
  }

  // Log the error
  if (statusCode >= 500) {
    console.error(`[ERROR] [${requestId}] ${error.message}`, {
      stack: error.stack,
      path: req.path,
      method: req.method,
      userId: req.userId,
    });
  } else {
    console.warn(`[WARN] [${requestId}] ${error.message}`, {
      path: req.path,
      method: req.method,
      statusCode,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: isOperationalError(error) ? error.message : 'An unexpected error occurred',
      // Only include details for operational errors (not bugs)
      ...(isOperationalError(error) && details ? { details } : {}),
      // Include stack trace in development only
      ...(env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * 404 handler — catches requests to non-existent routes.
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    meta: {
      requestId: req.headers['x-request-id'] as string ?? generateRequestId(),
      timestamp: new Date().toISOString(),
    },
  });
}

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
