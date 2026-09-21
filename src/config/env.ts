import 'dotenv/config';
import { z } from 'zod';

export const env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default('127.0.0.1'),
  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_NAME: z.string().min(1).default('express_starter'),
  DB_USER: z.string().min(1).default('starter'),
  DB_PASSWORD: z.string().default(''),
}).parse(process.env);
