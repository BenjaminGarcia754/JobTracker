import { AppError } from "../../shared/errors/app-error.js";
import { TechnologiesRepository } from "./technologies.repository.js";
import { CreateTechnologyInput, ListTechnologiesInput, UpdateTechnologyInput } from "./technologies.schema.js";
export class TechnologiesService {
    constructor(private readonly repository: TechnologiesRepository) {}

    list(input: ListTechnologiesInput){ return this.repository.list(input); }
    
    create(input: CreateTechnologyInput){ return this.repository.create(input); }

    async getById(id: number){
        const technology = await this.repository.findById(id);
        if(!technology) throw new AppError(404, 'NOT_FOUND', 'Technology not found');
        return technology;
    }

    async update(id: number, input: UpdateTechnologyInput){
        const technology = await this.repository.update(id, input);
        if(!technology) throw new AppError(404, 'NOT_FOUND', 'Technology not found');
        return technology;
    }

    async delete(id: number){
        if(!await this.repository.delete(id)) throw new AppError(404, 'NOT_FOUND', 'Technology not found');
    }
}