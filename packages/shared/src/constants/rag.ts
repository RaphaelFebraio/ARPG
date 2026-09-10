export const ENTITY_TYPES = [
  'spell',
  'monster',
  'race',
  'class',
  'feature',
  'rule',
  'equipment',
  'condition',
  'background',
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];
