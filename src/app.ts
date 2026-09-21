import type { Sequelize } from 'sequelize';
import express from 'express';
import helmet from 'helmet';
import { productRouter } from './features/products/product.routes.js';
import { AppError } from './shared/errors/app-error.js';
import { errorHandler } from './shared/middleware/error-handler.js';

export function createApp(database: Sequelize) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
  app.use('/api/products', productRouter(database));
  app.use((_req, _res, next) => next(new AppError(404, 'NOT_FOUND', 'Route not found')));
  app.use(errorHandler);
  return app;
}
