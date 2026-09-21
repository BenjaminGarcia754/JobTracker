import { createApp } from './app.js';
import { env } from './config/env.js';
import { createDatabase } from './config/database.js';

const database = createDatabase();
try {
  await database.authenticate();
  const server = createApp(database).listen(env.PORT, env.HOST, () => {
    console.log('API listening at http://' + env.HOST + ':' + env.PORT);
  });
  server.on('error', async (error) => {
    console.error(error.message);
    await database.close();
    process.exitCode = 1;
  });
  let closing = false;
  function shutdown() {
    if (closing) return;
    closing = true;
    const timeout = setTimeout(() => process.exit(1), 10_000);
    timeout.unref();
    server.close(async (error) => {
      try { await database.close(); process.exitCode = error ? 1 : 0; }
      catch { process.exitCode = 1; }
      finally { clearTimeout(timeout); }
    });
  }
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} catch (error) {
  console.error('Startup failed:', error instanceof Error ? error.message : 'Database connection failed');
  await database.close();
  process.exitCode = 1;
}
