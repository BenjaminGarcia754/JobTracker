import type { Request,  Response} from "express";
import { TechnologiesService } from "./technologies.service.js";
import { CreateTechnologyInput, ListTechnologiesInput, TechnologyParams, UpdateTechnologyInput } from "./technologies.schema.js";
import { ApplicationParams } from "../applications/applications.schema.js";

type ValidatedResponse<T> = Response<unknown, {validated: T}>;

export class TechnologiesController {
    constructor(private readonly service: TechnologiesService){}

    list = async (_req: Request, res: ValidatedResponse<{query: ListTechnologiesInput}>) => {
        res.json(await this.service.list(res.locals.validated.query));
    }

    show = async (_req: Request, res: ValidatedResponse<{params: TechnologyParams}>) => {
        res.json({data: await this.service.getById(res.locals.validated.params.id)});
    }

    create = async (_req: Request, res: ValidatedResponse<{body: CreateTechnologyInput}>) => {
        const technology = await this.service.create(res.locals.validated.body);
        res.location(`/api/technologies/${technology.id}`).status(201).json({data: technology});
    }

    update = async (_req: Request, res: ValidatedResponse<{params: ApplicationParams; body: UpdateTechnologyInput}>) => {
        const { params, body } = res.locals.validated;
        res.json({data: await this.service.update(params.id, body)});
    }

    delete = async (_req: Request, res: ValidatedResponse<{params: TechnologyParams}>) => {
        await this.service.delete(res.locals.validated.params.id);
        res.status(204).send();
    }
}
