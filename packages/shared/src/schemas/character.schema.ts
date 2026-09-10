import { z } from 'zod';
import { SKILLS } from '../constants/skills';

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

export const createCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  race: z.string().min(1).max(50),
  subrace: z.string().max(50).optional(),
  class: z.string().min(1).max(50),
  level: z.number().int().min(1).max(20).default(1),
  background: z.string().min(1).max(50),
  alignment: z.string().max(30).optional(),
  str: abilityScoreValueSchema,
  dex: abilityScoreValueSchema,
  con: abilityScoreValueSchema,
  int: abilityScoreValueSchema,
  wis: abilityScoreValueSchema,
  cha: abilityScoreValueSchema,
  hpMax: z.number().int().positive(),
  ac: z.number().int().positive().default(10),
  speed: z.number().int().positive().default(30),
  proficiency: z.number().int().positive().default(2),
  skills: z.array(characterSkillSchema).default([]),
  equipment: z.array(characterEquipmentItemSchema).default([]),
  spells: z.array(characterSpellSchema).default([]),
  features: z.array(characterFeatureSchema).default([]),
  personality: characterPersonalitySchema.default({}),
});

export const characterSchema = createCharacterSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const updateCharacterSchema = createCharacterSchema.partial();

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;
export type Character = z.infer<typeof characterSchema>;
