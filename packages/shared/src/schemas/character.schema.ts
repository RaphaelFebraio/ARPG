import { z } from 'zod';
import { SKILLS } from '../constants/skills.js';

export const abilityScoreValueSchema = z.number().int().min(1).max(30);

export const characterSkillSchema = z.object({
  skill: z.enum(SKILLS),
  proficient: z.boolean(),
});

export const characterEquipmentItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  equipped: z.boolean().default(false),
});

export const characterSpellSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(0).max(9),
  prepared: z.boolean().default(true),
});

export const characterFeatureSchema = z.object({
  name: z.string().min(1),
  source: z.string().min(1),
  description: z.string().min(1),
});

export const characterPersonalitySchema = z.object({
  traits: z.string().optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
  appearance: z.string().optional(),
});

// DECISION: field validators live here with no `.default()` so that
// `updateCharacterSchema` (a `.partial()` of this shape) stays a true
// partial update — Zod's `.partial()` only makes a field optional, it
// doesn't strip an inner `.default()`, so a schema built by partial-ing an
// already-defaulted object still emits `default: []`-style JSON Schema
// keywords. Fastify's AJV validator has `useDefaults` on, so it would fill
// those into every PUT request regardless of what the caller sent —
// silently wiping skills/equipment/etc. on any partial update that didn't
// explicitly re-send them. `createCharacterSchema` applies `.default()`
// on top of this shape instead, where defaults are actually wanted.
const characterFieldsShape = {
  name: z.string().min(1).max(100),
  race: z.string().min(1).max(50),
  subrace: z.string().max(50).optional(),
  class: z.string().min(1).max(50),
  level: z.number().int().min(1).max(20),
  background: z.string().min(1).max(50),
  alignment: z.string().max(30).optional(),
  str: abilityScoreValueSchema,
  dex: abilityScoreValueSchema,
  con: abilityScoreValueSchema,
  int: abilityScoreValueSchema,
  wis: abilityScoreValueSchema,
  cha: abilityScoreValueSchema,
  hpMax: z.number().int().positive(),
  ac: z.number().int().positive(),
  speed: z.number().int().positive(),
  proficiency: z.number().int().positive(),
  skills: z.array(characterSkillSchema),
  equipment: z.array(characterEquipmentItemSchema),
  spells: z.array(characterSpellSchema),
  features: z.array(characterFeatureSchema),
  personality: characterPersonalitySchema,
};

export const createCharacterSchema = z.object({
  ...characterFieldsShape,
  level: characterFieldsShape.level.default(1),
  ac: characterFieldsShape.ac.default(10),
  speed: characterFieldsShape.speed.default(30),
  proficiency: characterFieldsShape.proficiency.default(2),
  skills: characterFieldsShape.skills.default([]),
  equipment: characterFieldsShape.equipment.default([]),
  spells: characterFieldsShape.spells.default([]),
  features: characterFieldsShape.features.default([]),
  personality: characterFieldsShape.personality.default({}),
});

export const characterSchema = createCharacterSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const updateCharacterSchema = z.object(characterFieldsShape).partial();

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;
export type Character = z.infer<typeof characterSchema>;
