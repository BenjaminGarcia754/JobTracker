import type { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import * as products from './migrations/001-create-products.js';

export function createMigrator(database: Sequelize) {
  return new Umzug({
    migrations: [{ name: '001-create-products', ...products }],
    context: database.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: database }),
    logger: console,
  });
}
