import type { RequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';

type Schemas = Partial<Record<'body' | 'query' | 'params', z.ZodType>>;

export function validate(schemas: Schemas): RequestHandler {
  return async (req, res, next) => {
    const validated: Record<string, unknown> = {};
    const issues: { source: string; path: string; message: string }[] = [];
    for (const source of ['body', 'query', 'params'] as const) {
      const schema = schemas[source];
      if (!schema) continue;
      const result = await schema.safeParseAsync(req[source]);
      if (result.success) validated[source] = result.data;
      else issues.push(...result.error.issues.map((issue) => ({ source, path: issue.path.join('.'), message: issue.message })));
    }
    if (issues.length) { next(new AppError(422, 'VALIDATION_ERROR', 'Invalid request data', issues)); return; }
    // Express 5 exposes req.query as a getter; keep parsed/coerced data in locals.
    res.locals.validated = validated;
    next();
  };
}
