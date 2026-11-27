// Perfil (contrato: F3a · /api/profile).
import { Profile } from '@qatok/shared';
import { request } from './client';

export function getProfile(signal?: AbortSignal) {
  return request('/profile', { schema: Profile, signal });
}
