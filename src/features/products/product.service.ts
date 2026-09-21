import { AppError } from '../../shared/errors/app-error.js';
import { ProductRepository } from './product.repository.js';
import type { CreateProductInput, ListProductsInput, UpdateProductInput } from './product.schema.js';

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  list(input: ListProductsInput) { return this.repository.list(input); }
  create(input: CreateProductInput) { return this.repository.create(input); }

  async getById(id: string) {
    const product = await this.repository.findById(id);
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
    return product;
  }

  async update(id: string, input: UpdateProductInput) {
    const product = await this.repository.update(id, input);
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Product not found');
    return product;
  }

  async delete(id: string) {
    if (!await this.repository.delete(id)) throw new AppError(404, 'NOT_FOUND', 'Product not found');
  }
}
