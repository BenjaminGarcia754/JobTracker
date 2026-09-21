import type { Sequelize } from 'sequelize';
import { initProductModel } from './product.model.js';
import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { ProductController } from './product.controller.js';
import { ProductRepository } from './product.repository.js';
import { ProductService } from './product.service.js';
import { createProductSchema, listProductsSchema, productParamsSchema, updateProductSchema } from './product.schema.js';

export function productRouter(database: Sequelize) {
  const router = Router();
  const controller = new ProductController(new ProductService(new ProductRepository(initProductModel(database))));
  router.get('/', validate({ query: listProductsSchema }), controller.list);
  router.get('/:id', validate({ params: productParamsSchema }), controller.show);
  router.post('/', validate({ body: createProductSchema }), controller.create);
  router.patch('/:id', validate({ params: productParamsSchema, body: updateProductSchema }), controller.update);
  router.delete('/:id', validate({ params: productParamsSchema }), controller.delete);
  return router;
}
