import { ModelStatic } from "sequelize";
import { Technologies, TechnologiesModel } from "./technologies.model.js";
import { CreateTechnologyInput, ListTechnologiesInput, UpdateTechnologyInput } from "./technologies.schema.js";

export class TechnologiesRepository {
    constructor(private readonly model: ModelStatic<TechnologiesModel>){}

    async list({page, per_page}: ListTechnologiesInput){
        const {rows, count} = await this.model.findAndCountAll({
            offset: (page - 1) * per_page, limit: per_page,
            order: [['created_at', 'ASC'], ['id', 'ASC']],
        });
        return { data: rows.map((row) => row.get({plain: true})),
            meta: { page, per_page, total: count, last_page: Math.max(1, Math.ceil(count / per_page)) }
        }
    }

    async findById(id: number): Promise<Technologies | undefined> {
        return (await this.model.findByPk(id))?.get({plain: true});
    }

    async create(input: CreateTechnologyInput): Promise<Technologies> {
        return (await this.model.create(input)).get({plain: true});
    }

    async update(id: number, input: UpdateTechnologyInput): Promise<Technologies | undefined> {
        return this.model.sequelize!.transaction(async (transaction) => {
            const technology = await this.model.findByPk(id, {transaction, lock: transaction.LOCK.UPDATE});
            if(!technology) return undefined;
            await technology.update(input, {transaction});
            return technology.get({plain: true});
        })
    }

    async delete(id: number): Promise<boolean>{
        return (await this.model.destroy({where: {id}})) > 0;
    }
}