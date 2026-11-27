import { describe, expect, it } from 'vitest';
import { formatDate, plural } from './format';

describe('formatDate', () => {
  it('da día, mes corto sin punto y año', () => {
    // Mediodía UTC: la fecha es la misma en cualquier zona de América.
    expect(formatDate('2026-09-01T12:00:00.000Z')).toBe('1 sep 2026');
    expect(formatDate('2026-11-27T12:00:00.000Z')).toMatch(/^27 nov 2026$/);
  });
});

describe('plural', () => {
  it('elige singular o plural', () => {
    expect(plural(1, 'partida')).toBe('1 partida');
    expect(plural(4, 'partida')).toBe('4 partidas');
    expect(plural(0, 'evidencia')).toBe('0 evidencias');
    expect(plural(2, 'enlace', 'enlaces')).toBe('2 enlaces');
  });
});
