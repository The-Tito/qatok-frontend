// Administración (contrato: /api/admin/simulations y /api/admin/skills). Solo rol ADMIN.
import {
  AdminSimulation,
  AdminSimulationList,
  Deletion,
  SimulationContent,
  SimulationMutation,
  SkillMutation,
  type SimulationInput,
  type SimulationStatus,
  type SimulationStep,
  type SkillInput,
} from '@qatok/shared';
import type { z } from 'zod';
import { request } from './client';
import { isApiError } from './errors';

const simPath = (id: string) => `/admin/simulations/${encodeURIComponent(id)}`;

export function listAdminSimulations(
  query: { status?: z.infer<typeof SimulationStatus>; limit?: number; offset?: number } = {},
  signal?: AbortSignal,
) {
  return request('/admin/simulations', {
    schema: AdminSimulationList,
    query: { ...query },
    signal,
  });
}

/**
 * El GET individual de Admin está disponible desde el PR #51 del backend.
 */
export const HAS_ADMIN_SIMULATION_GET = true;

/**
 * Una simulación de admin por ID, o null si no existe. Sin la ruta individual se busca en la
 * lista (100 por página, recorriendo páginas).
 */
export async function findAdminSimulation(id: string, signal?: AbortSignal) {
  if (HAS_ADMIN_SIMULATION_GET) {
    try {
      return await request(simPath(id), { schema: AdminSimulation, signal });
    } catch (error) {
      if (isApiError(error, 'NOT_FOUND')) return null;
      throw error;
    }
  }
  for (let offset = 0; ; offset += 100) {
    const page = await listAdminSimulations({ limit: 100, offset }, signal);
    const found = page.items.find((item) => item.id === id);
    if (found) return found;
    if (offset + page.items.length >= page.total || page.items.length === 0) return null;
  }
}

export function createAdminSimulation(input: z.input<typeof SimulationInput>) {
  return request('/admin/simulations', { method: 'POST', body: input, schema: AdminSimulation });
}

export function updateAdminSimulation(id: string, input: z.input<typeof SimulationInput>) {
  return request(simPath(id), { method: 'PUT', body: input, schema: AdminSimulation });
}

export function deleteAdminSimulation(id: string) {
  return request(simPath(id), { method: 'DELETE' });
}

export function deactivateSimulation(id: string) {
  return request(`${simPath(id)}/deactivate`, { method: 'POST', schema: SimulationMutation });
}

export function getSimulationContent(id: string, signal?: AbortSignal) {
  return request(`${simPath(id)}/content`, { schema: SimulationContent, signal });
}

export function saveSimulationContent(
  id: string,
  input: { version: number | null; steps: SimulationStep[] },
) {
  return request(`${simPath(id)}/content`, {
    method: 'PUT',
    body: input,
    schema: SimulationContent,
  });
}

export function publishSimulation(id: string, version: number) {
  return request(`${simPath(id)}/publish`, {
    method: 'POST',
    body: { version },
    schema: SimulationMutation,
  });
}

export function createSkill(input: z.input<typeof SkillInput>) {
  return request('/admin/skills', { method: 'POST', body: input, schema: SkillMutation });
}

export function updateSkill(id: string, input: z.input<typeof SkillInput>) {
  return request(`/admin/skills/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: input,
    schema: SkillMutation,
  });
}

export function deleteSkill(id: string) {
  return request(`/admin/skills/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    schema: Deletion,
  });
}
