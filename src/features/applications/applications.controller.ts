import type { Request, Response } from 'express';
import { ApplicationsService } from './applications.service.js';
import type { CreateApplicationInput, ListApplicationsInput, ApplicationParams, UpdateApplicationInput } from './applications.schema.js';

type ValidatedResponse<T> = Response<unknown, { validated: T }>;

export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  list = async (_req: Request, res: ValidatedResponse<{ query: ListApplicationsInput }>) => {
    res.json(await this.service.list(res.locals.validated.query));
  };

  show = async (_req: Request, res: ValidatedResponse<{ params: ApplicationParams }>) => {
    res.json({ data: await this.service.getById(res.locals.validated.params.id) });
  };

  create = async (_req: Request, res: ValidatedResponse<{ body: CreateApplicationInput }>) => {
    const application = await this.service.create(res.locals.validated.body);
    res.location(`/api/applications/${application.id}`).status(201).json({ data: application });
  };
  
  update = async (_req: Request, res: ValidatedResponse<{ params: ApplicationParams; body: UpdateApplicationInput }>) => {
    const { params, body } = res.locals.validated;
    res.json({ data: await this.service.update(params.id, body) });
  };

  delete = async (_req: Request, res: ValidatedResponse<{ params: ApplicationParams }>) => {
    await this.service.delete(res.locals.validated.params.id);
    res.status(204).send();
  };
}
