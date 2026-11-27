import { describe, expect, it } from 'vitest';
import {
  mainSkill,
  registerSkillTypes,
  resetSkillTypes,
  simulationType,
  skillType,
} from './skill-types';

const COMUNICACION = 'e0000000-0000-4000-8000-000000000201';
const CONFLICTOS = 'e0000000-0000-4000-8000-000000000202';
const TIEMPO = 'e0000000-0000-4000-8000-000000000203';

describe('skillType', () => {
  it('usa el mapa del dataset', () => {
    expect(skillType(COMUNICACION)).toBe('VOICE');
    expect(skillType(CONFLICTOS)).toBe('FIRE');
    expect(skillType(TIEMPO)).toBe('CLOCK');
  });

  it('cae en STONE para una habilidad sin tipo', () => {
    expect(skillType('e0000000-0000-4000-8000-000000000999')).toBe('STONE');
  });
});

describe('mainSkill y simulationType', () => {
  it('elige la de mayor peso', () => {
    const skills = [
      { id: TIEMPO, name: 'Gestión del tiempo', weight: 0.3 },
      { id: CONFLICTOS, name: 'Resolución de conflictos', weight: 0.7 },
    ];
    expect(mainSkill(skills)?.id).toBe(CONFLICTOS);
    expect(simulationType(skills)).toBe('FIRE');
  });

  it('en empate elige la primera por nombre', () => {
    const skills = [
      { id: TIEMPO, name: 'Gestión del tiempo', weight: 0.5 },
      { id: COMUNICACION, name: 'Comunicación efectiva', weight: 0.5 },
    ];
    expect(mainSkill(skills)?.id).toBe(COMUNICACION);
    expect(simulationType(skills)).toBe('VOICE');
  });

  it('sin habilidades es STONE', () => {
    expect(mainSkill([])).toBeNull();
    expect(simulationType([])).toBe('STONE');
  });
});

describe('visual_type de la API (D1)', () => {
  it('gana sobre la tabla provisional, en el objeto o registrado', () => {
    resetSkillTypes();
    expect(skillType({ id: COMUNICACION, visual_type: 'HEART' } as { id: string })).toBe('HEART');
    registerSkillTypes([{ id: TIEMPO, visual_type: 'LEAF' } as { id: string }]);
    expect(skillType(TIEMPO)).toBe('LEAF');
    resetSkillTypes();
  });

  it('ignora valores nulos o desconocidos', () => {
    registerSkillTypes([{ id: CONFLICTOS, visual_type: null } as { id: string }]);
    registerSkillTypes([{ id: CONFLICTOS, visual_type: 'AZUL' } as { id: string }]);
    expect(skillType(CONFLICTOS)).toBe('FIRE');
    resetSkillTypes();
  });
});
