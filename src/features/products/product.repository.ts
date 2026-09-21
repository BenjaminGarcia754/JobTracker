import type { ModelStatic } from 'sequelize';
import type { Product, ProductModel } from './product.model.js';
import type { CreateProductInput, ListProductsInput, UpdateProductInput } from './product.schema.js';

export class ProductRepository {
  constructor(private readonly model: ModelStatic<ProductModel>) {}

  async list({ page, per_page }: ListProductsInput) {
    const { rows, count } = await this.model.findAndCountAll({
      offset: (page - 1) * per_page, limit: per_page,
      order: [['created_at', 'ASC'], ['id', 'ASC']],
    });
    return { data: rows.map((row) => row.get({ plain: true })),
      meta: { page, per_page, total: count, last_page: Math.max(1, Math.ceil(count / per_page)) } };
  }

  async findById(id: string): Promise<Product | undefined> {
    return (await this.model.findByPk(id))?.get({ plain: true });
  }

  async create(input: CreateProductInput): Promise<Product> {
    return (await this.model.create(input)).get({ plain: true });
  }

  async update(id: string, input: UpdateProductInput): Promise<Product | undefined> {
    return this.model.sequelize!.transaction(async (transaction) => {
      const product = await this.model.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!product) return undefined;
      await product.update(input, { transaction });
      return product.get({ plain: true });
    });
  }

  async delete(id: string): Promise<boolean> {
    return (await this.model.destroy({ where: { id } })) > 0;
  }
}
