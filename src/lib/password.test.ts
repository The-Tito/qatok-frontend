import { describe, expect, it } from 'vitest';
import { PASSWORD_RULES, passwordMeetsRules, passwordTooLong } from './password';

const passed = (password: string) =>
  PASSWORD_RULES.filter((rule) => rule.test(password)).map((rule) => rule.id);

describe('reglas de contraseña', () => {
  it('marca cada regla por separado', () => {
    expect(passed('')).toEqual([]);
    expect(passed('abc')).toEqual(['lower']);
    expect(passed('ABCdefgh')).toEqual(['length', 'upper', 'lower']);
    expect(passed('Ñandú2026')).toEqual(['length', 'upper', 'lower', 'digit']);
  });

  it('acepta solo si cumple todo y no pasa de 72 bytes', () => {
    expect(passwordMeetsRules('Secreta123')).toBe(true);
    expect(passwordMeetsRules('secreta123')).toBe(false);
    expect(passwordTooLong('Aa1' + 'ñ'.repeat(35))).toBe(true);
    expect(passwordMeetsRules('Aa1' + 'ñ'.repeat(35))).toBe(false);
  });
});
