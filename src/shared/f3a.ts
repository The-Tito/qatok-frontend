import { z } from 'zod';
import { FechaIso, Nivel, Uuid } from './comunes.js';
import { CatalogQuery, SimulationSummary, Synchronization } from './f1.js';
import { Attempt } from './f2.js';
import { SimulationOption, SimulationStep } from './simulation-admin.js';

const uuid = Uuid.transform((value) => value.toLowerCase());
const title = z.string().trim().min(1).max(150);
const count = z.number().int().nonnegative();
const skillRef = z.object({ id: Uuid, name: z.string() });
const simulationRef = z.object({ id: Uuid, title: z.string() });
const stepType = z.enum([
  'EMAIL',
  'MEETING',
  'CONVERSATION',
  'TASK',
  'INCIDENT',
] satisfies SimulationStep['type'][]);

export const SkillParams = z.object({ skillId: uuid });
export const EvidenceParams = z.object({ evidenceId: uuid });
export const RecommendationQuery = CatalogQuery.pick({ limit: true });
export const EvidenceQuery = CatalogQuery.pick({ limit: true, offset: true }).extend({
  skill_id: uuid.optional(),
});
export const EvidenceVisibility = z.enum(['PRIVATE', 'PUBLIC']);
export const CreateEvidenceInput = z.strictObject({ attempt_id: uuid, title: title.optional() });
export const UpdateEvidenceInput = z
  .strictObject({
    title: title.optional(),
    visibility: EvidenceVisibility.optional(),
  })
  .refine(
    (input) => input.title !== undefined || input.visibility !== undefined,
    'Provide a title or visibility',
  );
export type UpdateEvidenceInput = z.infer<typeof UpdateEvidenceInput>;

export const Evidence = z.object({
  id: Uuid,
  attempt_id: Uuid,
  title: z.string(),
  generated_at: FechaIso,
  visibility: EvidenceVisibility,
});
export type Evidence = z.infer<typeof Evidence>;
const evidenceSummary = Evidence.extend({
  simulation: simulationRef,
  skills: z.array(skillRef),
  active_shares: count,
});
export type EvidenceSummary = z.infer<typeof evidenceSummary>;
export const EvidenceList = z.object({ items: z.array(evidenceSummary), total: count });
export const EvidenceMutation = z.object({ evidence: Evidence, synchronization: Synchronization });
export const EvidenceUpdate = z.object({
  evidence: Evidence,
  synchronization: Synchronization.nullable(),
});

export const EvidenceDetail = z.object({
  evidence: Evidence,
  content: z.object({
    description: z.string(),
    simulation: simulationRef,
    score: Nivel,
    skills: z.array(skillRef),
    created_at: FechaIso,
    decisions: z.array(
      z.object({
        sequence: z.number().int().positive(),
        step: z.object({ title: z.string(), type: stepType }),
        option: z.string(),
        consequences: z.array(z.string()),
        feedback_type: SimulationOption.shape.feedback.shape.type,
      }),
    ),
  }),
});
export type EvidenceDetail = z.infer<typeof EvidenceDetail>;

export const ProfileSkill = skillRef.extend({
  current_level: Nivel,
  target: Nivel.nullable(),
  classification: z.enum(['STRENGTH', 'AREA_FOR_IMPROVEMENT', 'NO_REFERENCE']),
  correct: count,
  partial: count,
  incorrect: count,
});
export type ProfileSkill = z.infer<typeof ProfileSkill>;
export const Recommendation = z.object({
  simulation: SimulationSummary,
  skills_to_improve: z.array(z.string()),
  priority: z.number().nonnegative(),
});
export const Recommendations = z.object({ items: z.array(Recommendation) });
export const ProfileSkills = z.object({ items: z.array(ProfileSkill) });

export const SkillEvolution = z.object({
  current_level: Nivel.nullable(),
  points: z.array(
    z.object({
      finished_at: FechaIso,
      simulation: simulationRef,
      score: Nivel,
      weight: z.number().gt(0).max(1),
    }),
  ),
});

export const AttemptPath = z.object({
  attempt: Attempt,
  graph_pending: z.boolean(),
  decisions: z.array(
    z.object({
      sequence: z.number().int().positive(),
      step: z.object({ id: Uuid, title: z.string(), type: stepType }),
      option: SimulationOption.pick({ id: true, description: true }),
      consequences: SimulationOption.shape.consequences,
      feedback: SimulationOption.shape.feedback,
    }),
  ),
});
export type AttemptPath = z.infer<typeof AttemptPath>;

export const Profile = z.object({
  user: z.object({ id: Uuid, name: z.string() }),
  summary: z.object({ completed_attempts: count, evidence_count: count }),
  skills: z.array(ProfileSkill),
  recommendations: z.array(Recommendation),
  recent_evidence: z.array(Evidence.extend({ description: z.string() })),
  incomplete_data: z.array(z.enum(['graph', 'document'])),
  pending_sync_count: count,
});
