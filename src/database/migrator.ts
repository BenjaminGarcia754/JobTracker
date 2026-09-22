import type { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';

import * as applications from './migrations/001-create-applications.js';

export function createMigrator(database: Sequelize) {
  return new Umzug({
    migrations: [
      { name: '001-create-applications', ...applications }
    ],
    context: database.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: database }),
    logger: console,
  });
}