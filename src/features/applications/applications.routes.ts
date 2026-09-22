import type { Sequelize } from 'sequelize';
import { initApplicationsModel } from './applications.model.js';
import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { ApplicationsController } from './applications.controller.js';
import { ApplicationsRepository } from './applications.repository.js';
import { ApplicationsService } from './applications.service.js';
import { createApplicationSchema, listApplicationsSchema, applicationParamsSchema, updateApplicationSchema } from './applications.schema.js';

export function applicationsRouter(database: Sequelize) {
  const router = Router();
  const controller = new ApplicationsController(new ApplicationsService(new ApplicationsRepository(initApplicationsModel(database))));
  router.get('/', validate({ query: listApplicationsSchema }), controller.list);
  router.get('/:id', validate({ params: applicationParamsSchema }), controller.show);
  router.post('/', validate({ body: createApplicationSchema }), controller.create);
  router.patch('/:id', validate({ params: applicationParamsSchema, body: updateApplicationSchema }), controller.update);
  router.delete('/:id', validate({ params: applicationParamsSchema }), controller.delete);
  return router;
}
