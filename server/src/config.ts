import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// DECISION: load the .env from the monorepo root (not server/), since the
// project keeps a single .env for every workspace.
const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('llama3.1:8b'),
  OLLAMA_EMBED_MODEL: z.string().default('nomic-embed-text'),

  WHISPER_CPP_PATH: z.string().default('./bin/whisper-cpp'),
  WHISPER_MODEL_PATH: z.string().default('./models/ggml-base.bin'),
  WHISPER_LANGUAGE: z.string().default('pt'),

  AUDIO_STORAGE_PATH: z.string().default('./data/audio'),
  PDF_STORAGE_PATH: z.string().default('./data/pdf'),

  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  RAG_SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.72),
  RAG_MAX_CHUNKS: z.coerce.number().int().positive().default(5),

  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

export type Config = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = JSON.stringify(parsed.error.flatten().fieldErrors);
  throw new Error(`Invalid environment variables: ${details}`);
}

export const config: Config = parsed.data;
