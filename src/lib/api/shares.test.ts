import { describe, expect, it } from 'vitest';
import { expiryDate, shareLink } from './shares';

describe('shares', () => {
  it('arma el enlace del frontend con el token', () => {
    expect(shareLink('abc_123-X', 'http://localhost:3000/')).toBe(
      'http://localhost:3000/e/abc_123-X',
    );
  });

  it('calcula el vencimiento en días', () => {
    const from = new Date('2026-11-26T12:00:00.000Z');
    expect(expiryDate(30, from).toISOString()).toBe('2026-12-26T12:00:00.000Z');
  });
});
