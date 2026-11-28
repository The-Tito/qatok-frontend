// Gráfica de escalones de la evolución de una habilidad (Evolucion.dc.html): cálculo puro.

export interface ChartBox {
  /** Ancho y alto totales del SVG. */
  width: number;
  height: number;
  /** Área de la gráfica dentro del SVG. */
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const MOBILE_CHART: ChartBox = {
  width: 346,
  height: 210,
  left: 34,
  top: 10,
  right: 338,
  bottom: 190,
};

/** y de un valor 0–100 (0 abajo). */
export function chartY(box: ChartBox, value: number) {
  const clamped = Math.min(100, Math.max(0, value));
  return Math.round(box.bottom - ((box.bottom - box.top) * clamped) / 100);
}

/** x de cada punto: repartidos con margen; uno solo va al centro. */
export function chartXs(box: ChartBox, count: number) {
  const inner = box.left + 20;
  const span = box.right - 20 - inner;
  if (count <= 0) return [];
  if (count === 1) return [Math.round((box.left + box.right) / 2)];
  return Array.from({ length: count }, (_, i) => Math.round(inner + (i * span) / (count - 1)));
}

/** Escalones: horizontal hasta el siguiente punto y luego vertical a su puntuación. */
export function stepPath(box: ChartBox, scores: number[]) {
  if (scores.length === 0) return '';
  const xs = chartXs(box, scores.length);
  let path = `M${box.left} ${chartY(box, scores[0]!)}`;
  scores.forEach((score, i) => {
    if (i > 0) path += `H${xs[i]}V${chartY(box, score)}`;
  });
  return `${path}H${box.right}`;
}

/** Cuadrados de 12 px en cada punto. */
export function markPath(box: ChartBox, scores: number[]) {
  const xs = chartXs(box, scores.length);
  return scores.map((score, i) => `M${xs[i]! - 6} ${chartY(box, score) - 6}h12v12h-12z`).join(' ');
}
