import type { Character, CreateCharacterInput, UpdateCharacterInput } from '@grimoire/shared';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { characters } from '../db/schema.js';
import { NotFoundError } from '../errors.js';

type CharacterRow = typeof characters.$inferSelect;

const toCharacter = (row: CharacterRow): Character => ({
  id: row.id,
  userId: row.userId,
  name: row.name,
  race: row.race,
  subrace: row.subrace ?? undefined,
  class: row.class,
  level: row.level,
  background: row.background,
  alignment: row.alignment ?? undefined,
  str: row.str,
  dex: row.dex,
  con: row.con,
  int: row.int,
  wis: row.wis,
  cha: row.cha,
  hpMax: row.hpMax,
  ac: row.ac,
  speed: row.speed,
  proficiency: row.proficiency,
  skills: row.skills as Character['skills'],
  equipment: row.equipment as Character['equipment'],
  spells: row.spells as Character['spells'],
  features: row.features as Character['features'],
  personality: row.personality as Character['personality'],
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export class CharacterService {
  async list(userId: string): Promise<Character[]> {
    const rows = await db.select().from(characters).where(eq(characters.userId, userId));
    return rows.map(toCharacter);
  }

  async create(userId: string, input: CreateCharacterInput): Promise<Character> {
    const [row] = await db
      .insert(characters)
      .values({ ...input, userId })
      .returning();

    if (!row) throw new NotFoundError('Não foi possível criar o personagem.');
    return toCharacter(row);
  }

  async getById(userId: string, id: string): Promise<Character> {
    const [row] = await db
      .select()
      .from(characters)
      .where(and(eq(characters.id, id), eq(characters.userId, userId)))
      .limit(1);

    if (!row) throw new NotFoundError('Personagem não encontrado.');
    return toCharacter(row);
  }

  async update(userId: string, id: string, input: UpdateCharacterInput): Promise<Character> {
    const [row] = await db
      .update(characters)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(characters.id, id), eq(characters.userId, userId)))
      .returning();

    if (!row) throw new NotFoundError('Personagem não encontrado.');
    return toCharacter(row);
  }

  async delete(userId: string, id: string): Promise<void> {
    const deleted = await db
      .delete(characters)
      .where(and(eq(characters.id, id), eq(characters.userId, userId)))
      .returning({ id: characters.id });

    if (deleted.length === 0) throw new NotFoundError('Personagem não encontrado.');
  }
}
