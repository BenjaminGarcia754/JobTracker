import { Router } from "express";
import { Sequelize } from "sequelize";
import { TechnologiesController } from "./technologies.controller.js";
import { TechnologiesService } from "./technologies.service.js";
import { TechnologiesRepository } from "./technologies.repository.js";
import { initTechnologiesModel } from "./technologies.model.js";
import { validate } from "../../shared/middleware/validate.js";
import { createTechnologySchema, listTechnologiesSchema, technologyParamsSchema, updateTechnologySchema } from "./technologies.schema.js";

export function technologiesRouter(database: Sequelize){
    const router = Router();
    const controller = new TechnologiesController(new TechnologiesService(new TechnologiesRepository(initTechnologiesModel(database))));
    router.get('/', validate({query: listTechnologiesSchema}), controller.list)
    router.get('/:id', validate({params: technologyParamsSchema}), controller.show);
    router.post('/', validate({body: createTechnologySchema}), controller.create);
    router.patch('/:id', validate({body: updateTechnologySchema, params: technologyParamsSchema}), controller.update);
    router.delete('/:id', validate({params: technologyParamsSchema}), controller.delete)    
    return router;
}