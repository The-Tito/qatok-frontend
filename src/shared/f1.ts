import { z } from 'zod';
import { FechaIso, Nivel, Uuid } from './comunes.js';

const name = z.string().trim().min(1).max(100);
const email = z.string().trim().toLowerCase().pipe(z.email().max(150));
// bcrypt considers at most 72 bytes. TextEncoder is available in Node and the browser.
const password = z
  .string()
  .refine(
    (value) => [...value].length >= 8 && new TextEncoder().encode(value).length <= 72,
    'Password must have at least 8 characters and at most 72 UTF-8 bytes',
  );
export const RegisterInput = z.strictObject({ name, email, password });
export const LoginInput = z.strictObject({ email, password });
export const UpdateAccountInput = z.strictObject({ name: name.optional() });
export const AccountRole = z.enum(['STUDENT', 'ADMIN']);
export const Account = z.object({
  id: Uuid,
  name,
  email,
  role: AccountRole,
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  registered_at: FechaIso,
});
export type Account = z.infer<typeof Account>;

export const Synchronization = z.object({
  graph: z.enum(['APPLIED', 'PENDING']),
  event_ids: z.array(Uuid),
});
export const Session = z.object({ user: Account, token: z.string().min(1) });
export const Registration = Session.extend({ synchronization: Synchronization });

export const SkillVisualType = z.enum([
  'VOICE',
  'FIRE',
  'CLOCK',
  'LEAF',
  'SPARK',
  'HEART',
  'MIND',
  'STONE',
]);
export type SkillVisualType = z.infer<typeof SkillVisualType>;

export const SkillInput = z.strictObject({
  name,
  description: z.string().trim(),
  category: z.string().trim().max(50),
  target_level: Nivel.int().nullable().optional(),
  visual_type: SkillVisualType.nullable().optional(),
});
export const Skill = SkillInput.extend({
  id: Uuid,
  target_level: Nivel.int().nullable(),
  visual_type: SkillVisualType.nullable(),
});
export type Skill = z.infer<typeof Skill>;
export const SkillList = z.object({ items: z.array(Skill), total: z.number().int().nonnegative() });
export const SkillMutation = z.object({ skill: Skill, synchronization: Synchronization });
export const Deletion = z.object({ deleted: z.literal(true), synchronization: Synchronization });

export const SimulationDifficulty = z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']);
const queryInteger = (min: number, max: number) =>
  z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(min).max(max));
export const CatalogQuery = z.strictObject({
  search: z.string().trim().min(1).max(150).optional(),
  skill_id: Uuid.optional(),
  difficulty: SimulationDifficulty.optional(),
  limit: queryInteger(1, 100).default(20),
  offset: queryInteger(0, Number.MAX_SAFE_INTEGER).default(0),
});
export const SimulationSummary = z.object({
  id: Uuid,
  title: z.string(),
  description: z.string(),
  difficulty: SimulationDifficulty,
  estimated_duration: z.number().int().positive().nullable(),
  status: z.literal('PUBLISHED'),
  skills: z.array(
    z.object({
      id: Uuid,
      name,
      visual_type: SkillVisualType.nullable(),
      weight: z.number().gt(0).max(1),
      expected_level: Nivel,
    }),
  ),
});
export type SimulationSummary = z.infer<typeof SimulationSummary>;
export const SimulationCatalog = z.object({
  items: z.array(SimulationSummary),
  total: z.number().int().nonnegative(),
});
