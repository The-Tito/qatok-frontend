import { SkillInput } from '@qatok/shared';

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

/**
 * D1: el selector de Admin › Habilidades se activa solo cuando el contrato (src/shared, copia
 * del backend) ya acepta `visual_type` en SkillInput. Sin cambiar código del front.
 */
export const SUPPORTS_VISUAL_TYPE = 'visual_type' in SkillInput.shape;

export const SKILL_TYPE_KEYS = Object.keys(SKILL_TYPES) as SkillTypeKey[];

export function isSkillTypeKey(value: unknown): value is SkillTypeKey {
  return typeof value === 'string' && value in SKILL_TYPES;
}

/**
 * D1 · El tipo visual lo guardará la API en la habilidad (`visual_type`, propuesta en
 * docs/pendientes-backend.md). Hasta entonces se usa esta tabla por ID del dataset y, para
 * cualquier otra habilidad, STONE. Cuando la API lo mande, gana el valor de la API.
 */
const BY_SKILL_ID: Record<string, SkillTypeKey> = {
  'e0000000-0000-4000-8000-000000000201': 'VOICE',
  'e0000000-0000-4000-8000-000000000202': 'FIRE',
  'e0000000-0000-4000-8000-000000000203': 'CLOCK',
};

/** Tipos que mandó la API (GET /api/skills u otra respuesta con `visual_type`). */
const fromApi = new Map<string, SkillTypeKey>();

/** Guarda los tipos que trae la API; los que no traen campo (o traen nulo) no cambian nada. */
export function registerSkillTypes(skills: readonly { id: string }[]) {
  for (const skill of skills) {
    const value = (skill as { visual_type?: unknown }).visual_type;
    if (isSkillTypeKey(value)) fromApi.set(skill.id, value);
  }
}

/**
 * Tipo visual de una habilidad: el de la API (en el objeto o ya registrado), si no la tabla
 * provisional, si no STONE. Acepta el ID o la habilidad.
 */
export function skillType(skill: string | { id: string }): SkillTypeKey {
  const id = typeof skill === 'string' ? skill : skill.id;
  const own =
    typeof skill === 'string' ? undefined : (skill as { visual_type?: unknown }).visual_type;
  if (isSkillTypeKey(own)) return own;
  return fromApi.get(id) ?? BY_SKILL_ID[id] ?? 'STONE';
}

/** Solo para pruebas. */
export function resetSkillTypes() {
  fromApi.clear();
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
  return main ? skillType(main) : 'STONE';
}
