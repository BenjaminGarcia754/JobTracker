import { AppError } from '../../shared/errors/app-error.js';
import { ApplicationsRepository } from './applications.repository.js';
import type { CreateApplicationInput, ListApplicationsInput, UpdateApplicationInput } from './applications.schema.js';

export class ApplicationsService {
  constructor(private readonly repository: ApplicationsRepository) {}
  
  list(input: ListApplicationsInput) { return this.repository.list(input); }

  create(input: CreateApplicationInput) { return this.repository.create(input); }

  async getById(id: number) {
    const application = await this.repository.findById(id);
    if (!application) throw new AppError(404, 'NOT_FOUND', 'Application not found');
    return application;
  }

  async update(id: number, input: UpdateApplicationInput) {
    const application = await this.repository.update(id, input);
    if (!application) throw new AppError(404, 'NOT_FOUND', 'Application not found');
    return application;
  }

  async delete(id: number) {
    if (!await this.repository.delete(id)) throw new AppError(404, 'NOT_FOUND', 'Application not found');
  }
}
