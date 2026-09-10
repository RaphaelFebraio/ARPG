import type { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';

export const healthRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/health', async (_request, reply) => {
    let databaseOk = false;

    try {
      await db.execute(sql`SELECT 1`);
      databaseOk = true;
    } catch {
      databaseOk = false;
    }

    const status = databaseOk ? 'ok' : 'degraded';

    reply.status(databaseOk ? 200 : 503).send({
      success: true,
      data: { status, database: databaseOk ? 'ok' : 'unavailable' },
    });
  });
};
