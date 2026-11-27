// Evidencias (contrato: F3a · /api/evidence).
import { EvidenceList } from '@qatok/shared';
import { request } from './client';

export interface EvidenceListQuery {
  skill_id?: string;
  limit?: number;
  offset?: number;
}

export function listEvidence(query: EvidenceListQuery = {}, signal?: AbortSignal) {
  return request('/evidence', { schema: EvidenceList, query: { ...query }, signal });
}
