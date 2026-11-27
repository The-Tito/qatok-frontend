import { describe, expect, it } from 'vitest';
import { durationMinutes } from './attempts';

describe('durationMinutes', () => {
  it('cuenta los minutos entre inicio y fin', () => {
    expect(
      durationMinutes({
        started_at: '2026-10-01T10:00:00.000Z',
        finished_at: '2026-10-01T10:14:00.000Z',
      }),
    ).toBe(14);
  });

  it('da al menos 1 minuto y null si no terminó o las fechas no cuadran', () => {
    expect(
      durationMinutes({
        started_at: '2026-10-01T10:00:00.000Z',
        finished_at: '2026-10-01T10:00:10.000Z',
      }),
    ).toBe(1);
    expect(
      durationMinutes({ started_at: '2026-10-01T10:00:00.000Z', finished_at: null }),
    ).toBeNull();
    expect(
      durationMinutes({
        started_at: '2026-10-01T10:00:00.000Z',
        finished_at: '2026-09-01T10:00:00.000Z',
      }),
    ).toBeNull();
  });
});
