import { rulesQuerySchema, type RulesQueryInput } from '@grimoire/shared';
import type { FastifyInstance } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { RagService } from '../services/rag.service.js';

export const rulesRoutes = async (app: FastifyInstance): Promise<void> => {
  const ragService = new RagService();

  app.post(
    '/rules/query',
    { schema: { body: zodToJsonSchema(rulesQuerySchema, { $refStrategy: 'none' }) } },
    async (request, reply) => {
      const input = request.body as RulesQueryInput;
      const result = await ragService.answerQuery(input);
      reply.send({ success: true, data: result });
    },
  );
};
