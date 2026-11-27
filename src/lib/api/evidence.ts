// Evidencias (contrato: F3a · /api/evidence).
import { EvidenceDetail, EvidenceList, EvidenceMutation } from '@qatok/shared';
import { request } from './client';

export interface EvidenceListQuery {
  skill_id?: string;
  limit?: number;
  offset?: number;
}

const evidencePath = (evidenceId: string) => `/evidence/${encodeURIComponent(evidenceId)}`;

export function listEvidence(query: EvidenceListQuery = {}, signal?: AbortSignal) {
  return request('/evidence', { schema: EvidenceList, query: { ...query }, signal });
}

/** 409 EVIDENCE_ALREADY_EXISTS con details.evidence_id si el intento ya tiene evidencia. */
export function createEvidence(input: { attempt_id: string; title?: string }) {
  return request('/evidence', { method: 'POST', body: input, schema: EvidenceMutation });
}

export function getEvidence(evidenceId: string, signal?: AbortSignal) {
  return request(evidencePath(evidenceId), { schema: EvidenceDetail, signal });
}
