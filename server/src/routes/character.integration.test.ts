import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';

// DECISION: hits the real local Postgres via Fastify's `.inject()` (no
// network hop, but the full route/schema/service/DB stack) — same
// rationale as the RAG integration tests: mocking the DB here would miss
// exactly the kind of bug this suite exists to catch (see the partial
// PUT test below).
describe('character routes (integration)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const validCharacter = {
    name: 'Aria Nightsong',
    race: 'elf',
    subrace: 'high-elf',
    class: 'wizard',
    background: 'acolyte',
    str: 8,
    dex: 14,
    con: 13,
    int: 15,
    wis: 12,
    cha: 10,
    hpMax: 8,
    skills: [{ skill: 'arcana', proficient: true }],
    equipment: [{ name: 'Quarterstaff', quantity: 1, equipped: true }],
  };

  it('creates, lists, fetches, and deletes a character', async () => {
    const createResponse = await app.inject({ method: 'POST', url: '/characters', payload: validCharacter });
    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json();
    const characterId = created.data.id as string;
    expect(created.data.level).toBe(1);
    expect(created.data.ac).toBe(10);

    const listResponse = await app.inject({ method: 'GET', url: '/characters' });
    expect(listResponse.json().data.some((c: { id: string }) => c.id === characterId)).toBe(true);

    const getResponse = await app.inject({ method: 'GET', url: `/characters/${characterId}` });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().data.name).toBe('Aria Nightsong');

    const deleteResponse = await app.inject({ method: 'DELETE', url: `/characters/${characterId}` });
    expect(deleteResponse.statusCode).toBe(204);

    const getAfterDelete = await app.inject({ method: 'GET', url: `/characters/${characterId}` });
    expect(getAfterDelete.statusCode).toBe(404);
  });

  it('does not wipe skills/equipment on a partial PUT', async () => {
    const createResponse = await app.inject({ method: 'POST', url: '/characters', payload: validCharacter });
    const characterId = createResponse.json().data.id as string;

    const putResponse = await app.inject({
      method: 'PUT',
      url: `/characters/${characterId}`,
      payload: { level: 2, hpMax: 14 },
    });

    expect(putResponse.statusCode).toBe(200);
    const updated = putResponse.json().data;
    expect(updated.level).toBe(2);
    expect(updated.hpMax).toBe(14);
    expect(updated.skills).toEqual(validCharacter.skills);
    expect(updated.equipment).toEqual(validCharacter.equipment);

    await app.inject({ method: 'DELETE', url: `/characters/${characterId}` });
  });

  it('returns 404 for a character belonging to nobody', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/characters/00000000-0000-0000-0000-000000000000',
    });
    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('NOT_FOUND');
  });
});
