import { Sequelize } from 'sequelize';
import { env } from './env.js';

export function createDatabase(database = env.DB_NAME) {
  return new Sequelize(database, env.DB_USER, env.DB_PASSWORD, {
    dialect: 'mysql', host: env.DB_HOST, port: env.DB_PORT,
    logging: false, timezone: '+00:00',
    pool: { max: 5, min: 0, acquire: 30_000, idle: 10_000 },
    define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
  });
}
