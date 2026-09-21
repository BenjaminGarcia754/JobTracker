import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) { next(error); return; }
  if (error instanceof AppError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message, ...(error.details === undefined ? {} : { details: error.details }) } });
    return;
  }
  const type = typeof error === 'object' && error !== null && 'type' in error ? error.type : undefined;
  if (type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Invalid JSON body' } });
    return;
  }
  if (type === 'entity.too.large') {
    res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Body exceeds 100kb' } });
    return;
  }
  const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
  if (status === 400 || status === 415) {
    res.status(status).json({ error: {
      code: status === 400 ? 'BAD_REQUEST' : 'UNSUPPORTED_MEDIA_TYPE',
      message: status === 400 ? 'Invalid request' : 'Unsupported request encoding',
    } });
    return;
  }
  console.error(error);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
};
