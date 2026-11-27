// Tipos visuales de habilidad (01 · Tipos de habilidad). Los colores viven en globals.css
// (--type-<clave>-*); aquí solo la clave y el nombre, para data-type y textos.

export const SKILL_TYPES = {
  VOICE: { label: 'Voz' },
  FIRE: { label: 'Fuego' },
  CLOCK: { label: 'Reloj' },
  LEAF: { label: 'Hoja' },
  SPARK: { label: 'Chispa' },
  HEART: { label: 'Corazón' },
  MIND: { label: 'Mente' },
  STONE: { label: 'Piedra' },
} as const;
export type SkillTypeKey = keyof typeof SKILL_TYPES;

// PROVISIONAL (D1): mapa por ID del dataset. Se reemplaza por el campo de la API cuando exista.
const BY_SKILL_ID: Record<string, SkillTypeKey> = {
  'e0000000-0000-4000-8000-000000000201': 'VOICE',
  'e0000000-0000-4000-8000-000000000202': 'FIRE',
  'e0000000-0000-4000-8000-000000000203': 'CLOCK',
};

export function skillType(skillId: string): SkillTypeKey {
  return BY_SKILL_ID[skillId] ?? 'STONE';
}

export interface WeightedSkill {
  id: string;
  name: string;
  weight: number;
}

/**
 * Habilidad principal de una simulación: la de mayor peso; en empate, la primera por nombre.
 * Devuelve null si la simulación no tiene habilidades.
 */
export function mainSkill<T extends WeightedSkill>(skills: readonly T[]): T | null {
  let best: T | null = null;
  for (const skill of skills) {
    if (
      !best ||
      skill.weight > best.weight ||
      (skill.weight === best.weight && skill.name.localeCompare(best.name, 'es') < 0)
    ) {
      best = skill;
    }
  }
  return best;
}

/** Tipo visual de una simulación: el de su habilidad principal, o STONE si no tiene. */
export function simulationType(skills: readonly WeightedSkill[]): SkillTypeKey {
  const main = mainSkill(skills);
  return main ? skillType(main.id) : 'STONE';
}
