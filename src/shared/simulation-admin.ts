import { z } from 'zod';
import { Uuid } from './comunes.js';
import { CatalogQuery, SimulationDifficulty, SimulationSummary, Synchronization } from './f1.js';

export const SimulationStatus = z.enum(['DRAFT', 'PUBLISHED', 'INACTIVE']);
export const AdminSimulation = SimulationSummary.extend({ status: SimulationStatus });
export type AdminSimulation = z.infer<typeof AdminSimulation>;
export const AdminSimulationList = z.object({
  items: z.array(AdminSimulation),
  total: z.number().int().nonnegative(),
});
export const AdminSimulationQuery = CatalogQuery.pick({ limit: true, offset: true }).extend({
  status: SimulationStatus.optional(),
});
const text = (max: number) => z.string().min(1).max(max).regex(/\S/u);
const version = z.number().int().positive();
const uuidV4 = z.uuidv4().transform((value) => value.toLowerCase());
const score = z.number().min(0).max(100).multipleOf(0.01);

export const SimulationInput = z.strictObject({
  title: text(150),
  description: z.string(),
  difficulty: SimulationDifficulty,
  estimated_duration: z.number().int().min(1).max(2_147_483_647).nullable().optional(),
  skills: z
    .array(
      z.strictObject({
        skill_id: Uuid.transform((value) => value.toLowerCase()),
        weight: z.number().min(0.01).max(1).multipleOf(0.01),
        expected_level: z.number().int().min(0).max(100),
      }),
    )
    .min(1)
    .max(20)
    .refine(
      (skills) => new Set(skills.map((skill) => skill.skill_id)).size === skills.length,
      'Skill IDs must be unique',
    ),
});

const consequence = z.strictObject({
  id: uuidV4.optional(),
  description: text(1000),
  impact: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
  type: z.enum(['RELATIONSHIP', 'TIME', 'QUALITY', 'REPUTATION']),
});
const option = z.strictObject({
  id: uuidV4,
  description: text(1000),
  score,
  next_step_id: uuidV4.nullable(),
  consequences: z.array(consequence).max(3),
  feedback: z.strictObject({
    type: z.enum(['CORRECT', 'PARTIAL', 'INCORRECT']),
    comment: text(1000),
    recommendation: text(1000),
  }),
});
const step = {
  id: uuidV4,
  order: z.number().int().positive(),
  title: text(150),
  description: text(1000),
  options: z.array(option).max(6),
};
const items = (length: number, max: number) => z.array(text(length)).min(1).max(max);
export const SimulationStep = z.discriminatedUnion('type', [
  z.strictObject({
    ...step,
    type: z.literal('EMAIL'),
    context: z.strictObject({ sender: text(200), subject: text(200), body: text(5000) }),
  }),
  z.strictObject({
    ...step,
    type: z.literal('MEETING'),
    context: z.strictObject({ participants: items(150, 20), agenda: items(300, 20) }),
  }),
  z.strictObject({
    ...step,
    type: z.literal('CONVERSATION'),
    context: z.strictObject({
      interlocutor: text(150),
      lines: z
        .array(z.strictObject({ speaker: text(100), text: text(1000) }))
        .min(1)
        .max(50),
    }),
  }),
  z.strictObject({
    ...step,
    type: z.literal('TASK'),
    context: z.strictObject({
      deliverables: items(300, 20),
      deadline_hours: z.number().positive().max(8760),
    }),
  }),
  z.strictObject({
    ...step,
    type: z.literal('INCIDENT'),
    context: z.strictObject({
      timeline: z
        .array(z.strictObject({ time: text(100), event: text(1000) }))
        .min(1)
        .max(50),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    }),
  }),
]);
export type SimulationStep = z.infer<typeof SimulationStep>;
const steps = z.array(SimulationStep).max(30);
export const SimulationContentInput = z.strictObject({ version: version.nullable(), steps });
export const SimulationContent = z.object({ version, steps });
export const PublishSimulationInput = z.strictObject({ version });
export const SimulationMutation = z.object({
  simulation: AdminSimulation,
  synchronization: Synchronization,
});
