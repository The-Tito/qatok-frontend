import { z } from 'zod';
import { FechaIso, Uuid } from './comunes.js';
import { EvidenceDetail } from './f3a.js';

export const ShareParams = z.object({
  shareId: Uuid.transform((value) => value.toLowerCase()),
});
export const ShareToken = z.string().regex(/^[A-Za-z0-9_-]{1,255}$/);
export const CreateShareInput = z.strictObject({
  expires_in_days: z.number().int().min(1).max(90).default(30),
  recipient: z.string().trim().min(1).max(150).optional(),
});
export type CreateShareInput = z.infer<typeof CreateShareInput>;

export const EvidenceShare = z.object({
  id: Uuid,
  token: ShareToken,
  public_url: z.string(),
  recipient: z.string().nullable(),
  created_at: FechaIso,
  expires_at: FechaIso.nullable(),
  status: z.enum(['ACTIVE', 'REVOKED']),
  is_valid: z.boolean(),
});
export type EvidenceShare = z.infer<typeof EvidenceShare>;

export const EvidenceShareList = z.object({
  items: z.array(EvidenceShare),
  total: z.number().int().nonnegative(),
});

const snapshot = EvidenceDetail.shape.content;
export const SharedEvidence = z.object({
  title: z.string(),
  generated_at: FechaIso,
  owner: z.object({ name: z.string() }),
  content: snapshot.pick({ description: true, score: true, decisions: true }).extend({
    simulation: z.object({ title: z.string() }),
    skills: z.array(z.object({ name: z.string() })),
  }),
});
export type SharedEvidence = z.infer<typeof SharedEvidence>;
