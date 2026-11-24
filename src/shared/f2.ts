import { z } from 'zod';
import { FechaIso, Nivel, Uuid } from './comunes.js';
import { CatalogQuery, Synchronization } from './f1.js';
import { SimulationOption, SimulationStep } from './simulation-admin.js';

const inputId = Uuid.transform((value) => value.toLowerCase());
export const AttemptParams = z.object({ attemptId: inputId });
export const StartAttemptInput = z.strictObject({ simulation_id: inputId });
export const RecordResponseInput = z.strictObject({ step_id: inputId, option_id: inputId });
export type RecordResponseInput = z.infer<typeof RecordResponseInput>;
export const AttemptStatus = z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']);
export const AttemptQuery = CatalogQuery.pick({ limit: true, offset: true }).extend({
  status: AttemptStatus.optional(),
});

export const Attempt = z.object({
  id: Uuid,
  simulation_id: Uuid,
  status: AttemptStatus,
  started_at: FechaIso,
  finished_at: FechaIso.nullable(),
  score: Nivel.nullable(),
});
export type Attempt = z.infer<typeof Attempt>;
export const AttemptList = z.object({
  items: z.array(Attempt),
  total: z.number().int().nonnegative(),
});

const options = z.array(SimulationOption.pick({ id: true, description: true })).min(1);
const [email, meeting, conversation, task, incident] = SimulationStep.options;
export const PlayerStep = z.discriminatedUnion('type', [
  email.extend({ options }),
  meeting.extend({ options }),
  conversation.extend({ options }),
  task.extend({ options }),
  incident.extend({ options }),
]);
export type PlayerStep = z.infer<typeof PlayerStep>;

export const AttemptResponse = z.object({
  id: Uuid,
  step_id: Uuid,
  option_id: Uuid,
  sequence: z.number().int().positive(),
  answered_at: FechaIso,
});
export type AttemptResponse = z.infer<typeof AttemptResponse>;

export const AttemptDetail = z.object({
  attempt: Attempt,
  current_step: PlayerStep.nullable(),
  responses: z.array(AttemptResponse),
});
export const AttemptMutation = z.object({ attempt: Attempt, synchronization: Synchronization });
export const AttemptStarted = AttemptMutation.extend({ current_step: PlayerStep });
export const ResponseRecorded = AttemptMutation.extend({
  response: AttemptResponse,
  next_step: PlayerStep.nullable(),
  consequences: SimulationOption.shape.consequences,
  feedback: SimulationOption.shape.feedback,
});
