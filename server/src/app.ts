import cors from '@fastify/cors';
import fastify, { type FastifyInstance } from 'fastify';
import { config } from './config.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import { healthRoutes } from './routes/health.js';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
  });

  await app.register(cors, { origin: true });

  registerErrorHandler(app);

  await app.register(healthRoutes);

  return app;
};
