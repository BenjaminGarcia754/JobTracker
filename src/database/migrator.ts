import type { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function createMigrator(database: Sequelize) {
  return new Umzug({
    migrations: {
      glob: ['migrations/**/*.{ts,js}', {
        cwd: import.meta.dirname,
      }],

      resolve: ({ name, path: migrationPath, context }) => {
        const normalizedName = path.parse(name).name;

        return {
          name: normalizedName,

          up: async () => {
            const migration = await import(
              pathToFileURL(migrationPath!).href
            );

            await migration.up({ context });
          },

          down: async () => {
            const migration = await import(
              pathToFileURL(migrationPath!).href
            );

            await migration.down({ context });
          },
        };
      },
    },

    context: database.getQueryInterface(),

    storage: new SequelizeStorage({
      sequelize: database,
    }),

    logger: console,
  });
}