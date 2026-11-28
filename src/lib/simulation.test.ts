import { describe, expect, it } from 'vitest';
import { difficultyText, durationText, typedSkills } from './simulation';

describe('simulation', () => {
  it('escribe la dificultad con estrellas', () => {
    expect(difficultyText('BASIC')).toBe('★ Básica');
    expect(difficultyText('INTERMEDIATE')).toBe('★★ Intermedia');
    expect(difficultyText('ADVANCED')).toBe('★★★ Avanzada');
  });

  it('omite la duración si no hay', () => {
    expect(durationText(15)).toBe('15 min');
    expect(durationText(null)).toBeNull();
  });

  it('ordena habilidades por peso y les pone su tipo', () => {
    const skills = typedSkills([
      {
        id: 'e0000000-0000-4000-8000-000000000201',
        name: 'Comunicación efectiva',
        visual_type: null,
        weight: 0.3,
        expected_level: 50,
      },
      {
        id: 'e0000000-0000-4000-8000-000000000203',
        name: 'Gestión del tiempo',
        visual_type: null,
        weight: 0.7,
        expected_level: 60,
      },
    ]);
    expect(skills.map((s) => [s.type, s.percent])).toEqual([
      ['CLOCK', 70],
      ['VOICE', 30],
    ]);
    expect(skills[0]?.typeLabel).toBe('Reloj');
  });
});
