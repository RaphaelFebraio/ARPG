import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
});

export const campaignSchema = createCampaignSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const sessionLogStatusSchema = z.enum(['processing', 'ready', 'error']);

export const sessionNpcSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const sessionLogSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  sessionNumber: z.number().int().positive(),
  audioPath: z.string().nullable(),
  audioDuration: z.number().int().nonnegative().nullable(),
  rawTranscript: z.string().nullable(),
  summary: z.string(),
  npcs: z.array(sessionNpcSchema).default([]),
  locations: z.array(z.string()).default([]),
  items: z.array(z.string()).default([]),
  keyEvents: z.array(z.string()).default([]),
  sessionDate: z.string(),
  status: sessionLogStatusSchema,
  createdAt: z.string().datetime(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type Campaign = z.infer<typeof campaignSchema>;
export type SessionLog = z.infer<typeof sessionLogSchema>;
export type SessionLogStatus = z.infer<typeof sessionLogStatusSchema>;
