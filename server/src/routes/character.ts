import {
  createCharacterSchema,
  updateCharacterSchema,
  type CreateCharacterInput,
  type UpdateCharacterInput,
} from '@grimoire/shared';
import type { FastifyInstance } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { CharacterService } from '../services/character.service.js';
import { getDevUserId } from '../services/dev-user.service.js';

const idParamsSchema = {
  type: 'object',
  properties: { id: { type: 'string', format: 'uuid' } },
  required: ['id'],
} as const;

export const characterRoutes = async (app: FastifyInstance): Promise<void> => {
  const characterService = new CharacterService();

  app.get('/characters', async (_request, reply) => {
    const userId = await getDevUserId();
    const characterList = await characterService.list(userId);
    reply.send({ success: true, data: characterList });
  });

  app.post(
    '/characters',
    { schema: { body: zodToJsonSchema(createCharacterSchema, { $refStrategy: 'none' }) } },
    async (request, reply) => {
      const userId = await getDevUserId();
      const character = await characterService.create(userId, request.body as CreateCharacterInput);
      reply.status(201).send({ success: true, data: character });
    },
  );

  app.get('/characters/:id', { schema: { params: idParamsSchema } }, async (request, reply) => {
    const userId = await getDevUserId();
    const { id } = request.params as { id: string };
    const character = await characterService.getById(userId, id);
    reply.send({ success: true, data: character });
  });

  app.put(
    '/characters/:id',
    { schema: { params: idParamsSchema, body: zodToJsonSchema(updateCharacterSchema, { $refStrategy: 'none' }) } },
    async (request, reply) => {
      const userId = await getDevUserId();
      const { id } = request.params as { id: string };
      const character = await characterService.update(userId, id, request.body as UpdateCharacterInput);
      reply.send({ success: true, data: character });
    },
  );

  app.delete('/characters/:id', { schema: { params: idParamsSchema } }, async (request, reply) => {
    const userId = await getDevUserId();
    const { id } = request.params as { id: string };
    await characterService.delete(userId, id);
    reply.status(204).send();
  });
};
