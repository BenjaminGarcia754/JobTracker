import type { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import type { CreateProductInput, ListProductsInput, ProductParams, UpdateProductInput } from './product.schema.js';

type ValidatedResponse<T> = Response<unknown, { validated: T }>;

export class ProductController {
  constructor(private readonly service: ProductService) {}

  list = async (_req: Request, res: ValidatedResponse<{ query: ListProductsInput }>) => {
    res.json(await this.service.list(res.locals.validated.query));
  };
  show = async (_req: Request, res: ValidatedResponse<{ params: ProductParams }>) => {
    res.json({ data: await this.service.getById(res.locals.validated.params.id) });
  };
  create = async (_req: Request, res: ValidatedResponse<{ body: CreateProductInput }>) => {
    const product = await this.service.create(res.locals.validated.body);
    res.location(`/api/products/${product.id}`).status(201).json({ data: product });
  };
  update = async (_req: Request, res: ValidatedResponse<{ params: ProductParams; body: UpdateProductInput }>) => {
    const { params, body } = res.locals.validated;
    res.json({ data: await this.service.update(params.id, body) });
  };
  delete = async (_req: Request, res: ValidatedResponse<{ params: ProductParams }>) => {
    await this.service.delete(res.locals.validated.params.id);
    res.status(204).send();
  };
}
