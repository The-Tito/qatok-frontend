// Enlaces para compartir (contrato: F3b · /api/evidence/:id/shares, /api/shares, /api/public).
import { EvidenceShare, EvidenceShareList, SharedEvidence } from '@qatok/shared';
import { request } from './client';

export function listShares(evidenceId: string, signal?: AbortSignal) {
  return request(`/evidence/${encodeURIComponent(evidenceId)}/shares`, {
    schema: EvidenceShareList,
    signal,
  });
}

export function createShare(
  evidenceId: string,
  input: { expires_in_days: number; recipient?: string },
) {
  return request(`/evidence/${encodeURIComponent(evidenceId)}/shares`, {
    method: 'POST',
    body: input,
    schema: EvidenceShare,
  });
}

/** 204 sin cuerpo. */
export function revokeShare(shareId: string) {
  return request(`/shares/${encodeURIComponent(shareId)}`, { method: 'DELETE' });
}

/** Pública, sin sesión: 404 INVALID_SHARE_LINK, 410 SHARE_LINK_EXPIRED. */
export function getSharedEvidence(token: string, signal?: AbortSignal) {
  return request(`/public/evidence/${encodeURIComponent(token)}`, {
    schema: SharedEvidence,
    auth: false,
    signal,
  });
}

/** El enlace que se comparte es del frontend: {origen}/e/{token} (public_url es de la API). */
export function shareLink(token: string, origin: string) {
  return `${origin.replace(/\/+$/, '')}/e/${encodeURIComponent(token)}`;
}

/** Fecha de vencimiento si se crea hoy con esa vigencia (para mostrar antes de crear). */
export function expiryDate(days: number, from: Date = new Date()) {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}
