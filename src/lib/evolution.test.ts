import { describe, expect, it } from 'vitest';
import { MOBILE_CHART, chartXs, chartY, markPath, stepPath } from './evolution';

describe('evolution chart', () => {
  it('pasa de 0–100 a la altura de la gráfica', () => {
    expect(chartY(MOBILE_CHART, 0)).toBe(190);
    expect(chartY(MOBILE_CHART, 100)).toBe(10);
    expect(chartY(MOBILE_CHART, 50)).toBe(100);
    expect(chartY(MOBILE_CHART, 140)).toBe(10);
  });

  it('reparte los puntos y centra uno solo', () => {
    expect(chartXs(MOBILE_CHART, 1)).toEqual([186]);
    expect(chartXs(MOBILE_CHART, 3)).toEqual([54, 186, 318]);
    expect(chartXs(MOBILE_CHART, 0)).toEqual([]);
  });

  it('dibuja escalones como el prototipo', () => {
    expect(stepPath(MOBILE_CHART, [37.5, 92.5, 40])).toBe('M34 123H186V24H318V118H338');
    expect(stepPath(MOBILE_CHART, [])).toBe('');
  });

  it('marca cada punto con un cuadrado de 12 px', () => {
    expect(markPath(MOBILE_CHART, [50])).toBe('M180 94h12v12h-12z');
  });
});
