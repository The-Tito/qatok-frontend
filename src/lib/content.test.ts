import { SimulationContentInput, type SimulationStep } from '@qatok/shared';
import { describe, expect, it } from 'vitest';
import {
  changeType,
  describePath,
  emptyStep,
  moveStep,
  normalizeSteps,
  removeStep,
  routeMap,
  unreachableSteps,
} from './content';

function filledEmail(order: number): SimulationStep {
  const step = emptyStep('EMAIL', order);
  return {
    ...step,
    title: ' Correo ',
    description: 'Llega un correo',
    context: { sender: 'Ana', subject: 'Hola', body: 'Texto' },
    options: step.options.map((o) => ({
      ...o,
      description: 'Responder',
      score: 80.456,
      feedback: { type: 'CORRECT' as const, comment: 'Bien', recommendation: 'Sigue' },
    })),
  } as SimulationStep;
}

describe('content', () => {
  it('crea pasos válidos para el contrato una vez llenos', () => {
    const steps = normalizeSteps([filledEmail(1)]);
    expect(steps[0]?.title).toBe('Correo');
    expect(steps[0]?.options[0]?.score).toBe(80.46);
    expect(SimulationContentInput.safeParse({ version: null, steps }).success).toBe(true);
  });

  it('un paso vacío no pasa la validación del contrato', () => {
    const result = SimulationContentInput.safeParse({
      version: null,
      steps: normalizeSteps([emptyStep('TASK', 1)]),
    });
    expect(result.success).toBe(false);
  });

  it('quita renglones vacíos de las listas al normalizar', () => {
    const step = { ...emptyStep('MEETING', 1) };
    const meeting = {
      ...step,
      context: { participants: ['Tú', ' ', 'Laura'], agenda: ['', 'Plan'] },
    };
    const [normalized] = normalizeSteps([meeting as typeof step]);
    expect(normalized?.context).toEqual({ participants: ['Tú', 'Laura'], agenda: ['Plan'] });
  });

  it('cambiar el tipo reinicia el contexto y conserva el resto', () => {
    const step = filledEmail(1);
    const changed = changeType(step, 'INCIDENT');
    expect(changed.type).toBe('INCIDENT');
    expect(changed.title).toBe(step.title);
    expect(changed.context).toEqual({ timeline: [{ time: '', event: '' }], severity: 'MEDIUM' });
  });

  it('mover y quitar pasos renumera y suelta las referencias', () => {
    const a = filledEmail(1);
    const b = filledEmail(2);
    a.options[0]!.next_step_id = b.id;
    const moved = moveStep([a, b], 1, -1);
    expect(moved.map((s) => [s.id, s.order])).toEqual([
      [b.id, 1],
      [a.id, 2],
    ]);
    const removed = removeStep([a, b], 1);
    expect(removed).toHaveLength(1);
    expect(removed[0]?.options[0]?.next_step_id).toBeNull();
  });

  it('describe rutas de error para el autor', () => {
    expect(describePath(['steps', 1, 'options', 0, 'feedback', 'comment'])).toBe(
      'Paso 2 · opción A · comentario',
    );
    expect(describePath(['steps', 0, 'description'])).toBe('Paso 1 · descripción');
    expect(describePath(['steps', 0, 'context', 'timeline', 2, 'event'])).toBe(
      'Paso 1 · cronología 3 · evento',
    );
  });

  it('arma el mapa de rutas y detecta pasos inalcanzables', () => {
    const a = filledEmail(1);
    const b = filledEmail(2);
    const c = filledEmail(3);
    a.options[0]!.next_step_id = c.id;
    expect(routeMap([a, b, c]).map((r) => `${r.step}${r.option}→${r.target}`)).toEqual([
      '1A→Paso 3',
      '2A→Fin',
      '3A→Fin',
    ]);
    expect(unreachableSteps([a, b, c])).toEqual([2]);
  });
});
