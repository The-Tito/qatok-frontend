// Partidas (contrato: F2 · /api/attempts).
import {
  AttemptDetail,
  AttemptList,
  AttemptMutation,
  AttemptStarted,
  ResponseRecorded,
  type AttemptStatus,
  type RecordResponseInput,
} from '@qatok/shared';
import type { z } from 'zod';
import { request } from './client';

export interface AttemptListQuery {
  status?: z.infer<typeof AttemptStatus>;
  limit?: number;
  offset?: number;
}

const attemptPath = (attemptId: string) => `/attempts/${encodeURIComponent(attemptId)}`;

export function listAttempts(query: AttemptListQuery = {}, signal?: AbortSignal) {
  return request('/attempts', { schema: AttemptList, query: { ...query }, signal });
}

/** 409 ACTIVE_ATTEMPT_EXISTS con details.attempt_id si ya hay una partida en curso. */
export function startAttempt(simulationId: string) {
  return request('/attempts', {
    method: 'POST',
    body: { simulation_id: simulationId },
    schema: AttemptStarted,
  });
}

export function getAttempt(attemptId: string, signal?: AbortSignal) {
  return request(attemptPath(attemptId), { schema: AttemptDetail, signal });
}

export function respondStep(attemptId: string, input: RecordResponseInput) {
  return request(`${attemptPath(attemptId)}/responses`, {
    method: 'POST',
    body: input,
    schema: ResponseRecorded,
  });
}

export function abandonAttempt(attemptId: string) {
  return request(`${attemptPath(attemptId)}/abandon`, {
    method: 'POST',
    schema: AttemptMutation,
  });
}
