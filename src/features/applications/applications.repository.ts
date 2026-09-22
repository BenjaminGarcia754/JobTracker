import type { ModelStatic } from 'sequelize';
import type { Applications, ApplicationsModel } from './applications.model.js';
import type { CreateApplicationInput, ListApplicationsInput, UpdateApplicationInput } from './applications.schema.js';

export class ApplicationsRepository {
  constructor(private readonly model: ModelStatic<ApplicationsModel>) {}

  async list({ page, per_page }: ListApplicationsInput) {
    const { rows, count } = await this.model.findAndCountAll({
      offset: (page - 1) * per_page, limit: per_page,
      order: [['created_at', 'ASC'], ['id', 'ASC']],
    });
    return { data: rows.map((row) => row.get({ plain: true })),
      meta: { page, per_page, total: count, last_page: Math.max(1, Math.ceil(count / per_page)) } };
  }

  async findById(id: number): Promise<Applications | undefined> {
    return (await this.model.findByPk(id))?.get({ plain: true });
  }

  async create(input: CreateApplicationInput): Promise<Applications> {
    return (await this.model.create(input)).get({ plain: true });
  }

  async update(id: number, input: UpdateApplicationInput): Promise<Applications | undefined> {
    return this.model.sequelize!.transaction(async (transaction) => {
      const application = await this.model.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!application) return undefined;
      await application.update(input, { transaction });
      return application.get({ plain: true });
    });
  }

  async delete(id: number): Promise<boolean> {
    return (await this.model.destroy({ where: { id } })) > 0;
  }
}
