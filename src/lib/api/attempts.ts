// Partidas (contrato: F2 · /api/attempts).
import { AttemptList, type AttemptStatus } from '@qatok/shared';
import type { z } from 'zod';
import { request } from './client';

export interface AttemptListQuery {
  status?: z.infer<typeof AttemptStatus>;
  limit?: number;
  offset?: number;
}

export function listAttempts(query: AttemptListQuery = {}, signal?: AbortSignal) {
  return request('/attempts', { schema: AttemptList, query: { ...query }, signal });
}
