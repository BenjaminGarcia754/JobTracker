import { createDatabase } from '../config/database.js';
import { createMigrator } from './migrator.js';

const command = process.argv[2] ?? 'up';
if (!['up', 'down', 'status'].includes(command)) throw new Error('Use up, down or status');
const database = createDatabase();
try {
  await database.authenticate();
  const migrator = createMigrator(database);
  if (command === 'up') await migrator.up();
  else if (command === 'down') await migrator.down();
  else console.log({ executed: await migrator.executed(), pending: await migrator.pending() });
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Migration failed');
  process.exitCode = 1;
} finally { await database.close(); }
