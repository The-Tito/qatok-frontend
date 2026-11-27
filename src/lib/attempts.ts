// Presentación de partidas (Mis partidas, Recorrido).
import type { Attempt } from '@qatok/shared';

export const ATTEMPT_STATUS = {
  IN_PROGRESS: { label: 'En curso', badge: '▶ En curso', filter: 'En curso' },
  COMPLETED: { label: 'Completada', badge: '★ Completada', filter: 'Completadas' },
  ABANDONED: { label: 'Abandonada', badge: '✕ Abandonada', filter: 'Abandonadas' },
} as const;

/** Minutos entre inicio y fin, redondeados (mínimo 1). Null si no terminó. */
export function durationMinutes(attempt: Pick<Attempt, 'started_at' | 'finished_at'>) {
  if (!attempt.finished_at) return null;
  const ms = new Date(attempt.finished_at).getTime() - new Date(attempt.started_at).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  return Math.max(1, Math.round(ms / 60_000));
}
