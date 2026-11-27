// Catálogo (contrato: F1 · /api/simulations y /api/skills).
import {
  SimulationCatalog,
  SimulationSummary,
  SkillList,
  type SimulationDifficulty,
} from '@qatok/shared';
import type { z } from 'zod';
import { request } from './client';

export interface CatalogFilters {
  search?: string;
  skill_id?: string;
  difficulty?: z.infer<typeof SimulationDifficulty>;
}

export function listSimulations(
  query: CatalogFilters & { limit?: number; offset?: number },
  signal?: AbortSignal,
) {
  return request('/simulations', { schema: SimulationCatalog, query: { ...query }, signal });
}

export function getSimulation(simulationId: string, signal?: AbortSignal) {
  return request(`/simulations/${encodeURIComponent(simulationId)}`, {
    schema: SimulationSummary,
    signal,
  });
}

export function listSkills(signal?: AbortSignal) {
  return request('/skills', { schema: SkillList, signal });
}
