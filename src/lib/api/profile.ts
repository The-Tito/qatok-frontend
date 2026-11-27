// Perfil (contrato: F3a · /api/profile).
import { AttemptPath, Profile, Recommendations, SkillEvolution } from '@qatok/shared';
import { request } from './client';

export function getProfile(signal?: AbortSignal) {
  return request('/profile', { schema: Profile, signal });
}

export function getSkillEvolution(skillId: string, signal?: AbortSignal) {
  return request(`/profile/skills/${encodeURIComponent(skillId)}/evolution`, {
    schema: SkillEvolution,
    signal,
  });
}

export function listRecommendations(limit?: number, signal?: AbortSignal) {
  return request('/profile/recommendations', { schema: Recommendations, query: { limit }, signal });
}

export function getAttemptPath(attemptId: string, signal?: AbortSignal) {
  return request(`/profile/attempts/${encodeURIComponent(attemptId)}/path`, {
    schema: AttemptPath,
    signal,
  });
}
