import { Router } from 'express';
import type { Sequelize } from 'sequelize';

import { applicationsRouter } from './features/applications/applications.routes.js';
import { technologiesRouter } from './features/technologies/technologies.routes.js';

export function apiRouter(database: Sequelize) {
    const router = Router();

    router.use('/applications', applicationsRouter(database));
    router.use('/technologies', technologiesRouter(database));

    return router;
}