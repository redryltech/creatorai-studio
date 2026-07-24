// ============================================================
// CreatorAI Studio — Request Validation Middleware
// ============================================================
// Uses Zod schemas to validate request body, query, and params.
// Rejects invalid requests with detailed error messages
// BEFORE they reach the controller.
// ============================================================

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '@creatorai/shared';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Create a validation middleware for a specific Zod schema.
 *
 * @param schema - Zod schema to validate against
 * @param source - Which part of the request to validate (body, query, params)
 * @returns Express middleware function
 *
 * @example
 * ```ts
 * router.post('/projects', validate(createProjectSchema), projectController.create);
 * router.get('/projects', validate(paginationSchema, 'query'), projectController.list);
 * ```
 */
export function validate(schema: z.ZodSchema, source: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = req[source];
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return next(
        new ValidationError(
          `Validation failed for request ${source}`,
          errors,
        ),
      );
    }

    // Replace the request data with the parsed (and potentially transformed) data
    // This ensures defaults are applied and types are correct
    (req as Record<string, unknown>)[source] = result.data;
    next();
  };
}

/**
 * Validate multiple parts of the request at once.
 *
 * @example
 * ```ts
 * router.put(
 *   '/projects/:id',
 *   validateMultiple({
 *     params: z.object({ id: z.string() }),
 *     body: updateProjectSchema,
 *   }),
 *   projectController.update,
 * );
 * ```
 */
export function validateMultiple(schemas: Partial<Record<RequestPart, z.ZodSchema>>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const allErrors: Array<{ field: string; message: string }> = [];

    for (const [source, schema] of Object.entries(schemas) as [RequestPart, z.ZodSchema][]) {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: `${source}.${err.path.join('.')}`,
          message: err.message,
        }));
        allErrors.push(...errors);
      } else {
        (req as Record<string, unknown>)[source] = result.data;
      }
    }

    if (allErrors.length > 0) {
      return next(new ValidationError('Validation failed', allErrors));
    }

    next();
  };
}
