// Presentación de simulaciones (01 · Tipos de habilidad, 02 · Catálogo).
import type { SimulationSummary } from '@qatok/shared';
import { SKILL_TYPES, skillType, type SkillTypeKey } from './skill-types';

export type Difficulty = SimulationSummary['difficulty'];

export const DIFFICULTIES: { value: Difficulty; stars: string; label: string; short: string }[] = [
  { value: 'BASIC', stars: '★', label: 'Básica', short: 'Básica' },
  { value: 'INTERMEDIATE', stars: '★★', label: 'Intermedia', short: 'Media' },
  { value: 'ADVANCED', stars: '★★★', label: 'Avanzada', short: 'Avanzada' },
];

export function difficultyText(difficulty: Difficulty) {
  const found = DIFFICULTIES.find((item) => item.value === difficulty);
  return found ? `${found.stars} ${found.label}` : difficulty;
}

export function durationText(minutes: number | null) {
  return minutes === null ? null : `${minutes} min`;
}

export interface TypedSkill {
  id: string;
  name: string;
  weight: number;
  type: SkillTypeKey;
  typeLabel: string;
  /** Peso en %, redondeado. */
  percent: number;
}

/** Habilidades ordenadas por peso (mayor primero; empate por nombre), con su tipo visual. */
export function typedSkills(skills: SimulationSummary['skills']): TypedSkill[] {
  return [...skills]
    .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name, 'es'))
    .map((skill) => {
      const type = skillType(skill.id);
      return {
        id: skill.id,
        name: skill.name,
        weight: skill.weight,
        type,
        typeLabel: SKILL_TYPES[type].label,
        percent: Math.round(skill.weight * 100),
      };
    });
}
