import cors from '@fastify/cors';
import fastify, { type FastifyInstance } from 'fastify';
import { config } from './config.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import { characterRoutes } from './routes/character.js';
import { healthRoutes } from './routes/health.js';
import { rulesRoutes } from './routes/rules.js';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
  });

  await app.register(cors, { origin: true });

  registerErrorHandler(app);

  await app.register(healthRoutes);
  await app.register(rulesRoutes);
  await app.register(characterRoutes);

  return app;
};
