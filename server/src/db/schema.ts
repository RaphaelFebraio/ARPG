import { sql } from 'drizzle-orm';
import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { vector } from './vector-type.js';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const characters = pgTable('characters', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  race: varchar('race', { length: 50 }).notNull(),
  subrace: varchar('subrace', { length: 50 }),
  class: varchar('class', { length: 50 }).notNull(),
  level: integer('level').notNull().default(1),
  background: varchar('background', { length: 50 }).notNull(),
  alignment: varchar('alignment', { length: 30 }),
  str: integer('str').notNull(),
  dex: integer('dex').notNull(),
  con: integer('con').notNull(),
  int: integer('int').notNull(),
  wis: integer('wis').notNull(),
  cha: integer('cha').notNull(),
  hpMax: integer('hp_max').notNull(),
  ac: integer('ac').notNull().default(10),
  speed: integer('speed').notNull().default(30),
  proficiency: integer('proficiency').notNull().default(2),
  skills: jsonb('skills').notNull().default([]),
  equipment: jsonb('equipment').notNull().default([]),
  spells: jsonb('spells').notNull().default([]),
  features: jsonb('features').notNull().default([]),
  personality: jsonb('personality').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessionLogs = pgTable(
  'session_logs',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    sessionNumber: integer('session_number').notNull(),
    audioPath: text('audio_path'),
    audioDuration: integer('audio_duration'),
    rawTranscript: text('raw_transcript'),
    summary: text('summary').notNull(),
    npcs: jsonb('npcs').notNull().default([]),
    locations: jsonb('locations').notNull().default([]),
    items: jsonb('items').notNull().default([]),
    keyEvents: jsonb('key_events').notNull().default([]),
    sessionDate: date('session_date').notNull().defaultNow(),
    status: varchar('status', { length: 20 }).notNull().default('processing'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('session_logs_campaign_session_idx').on(
      table.campaignId,
      table.sessionNumber.desc(),
    ),
  ],
);

export const ruleChunks = pgTable(
  'rule_chunks',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    content: text('content').notNull(),
    embedding: vector(768)('embedding').notNull(),
    source: varchar('source', { length: 50 }).notNull(),
    chapter: varchar('chapter', { length: 200 }),
    section: varchar('section', { length: 200 }),
    entityType: varchar('entity_type', { length: 30 }).notNull(),
    entityName: varchar('entity_name', { length: 200 }).notNull(),
    pageStart: integer('page_start'),
    pageEnd: integer('page_end'),
    tokenCount: integer('token_count').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('rule_chunks_embedding_idx')
      .using('hnsw', table.embedding.op('vector_cosine_ops'))
      .with({ m: 16, ef_construction: 64 }),
    index('rule_chunks_entity_type_idx').on(table.entityType),
  ],
);
