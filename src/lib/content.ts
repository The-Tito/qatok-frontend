// Editor de contenido (issue 6.2): pasos de una simulación. Funciones puras, con pruebas.
import type { SimulationStep } from '@qatok/shared';

export type StepType = SimulationStep['type'];
export type Option = SimulationStep['options'][number];

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  EMAIL: 'Correo',
  MEETING: 'Reunión',
  CONVERSATION: 'Conversación',
  TASK: 'Tarea',
  INCIDENT: 'Incidente',
};

const uuid = () => crypto.randomUUID();

export function emptyContext(type: StepType): SimulationStep['context'] {
  switch (type) {
    case 'EMAIL':
      return { sender: '', subject: '', body: '' };
    case 'MEETING':
      return { participants: [''], agenda: [''] };
    case 'CONVERSATION':
      return { interlocutor: '', lines: [{ speaker: '', text: '' }] };
    case 'TASK':
      return { deliverables: [''], deadline_hours: 8 };
    case 'INCIDENT':
      return { timeline: [{ time: '', event: '' }], severity: 'MEDIUM' };
  }
}

export function emptyOption(): Option {
  return {
    id: uuid(),
    description: '',
    score: 0,
    next_step_id: null,
    consequences: [],
    feedback: { type: 'PARTIAL', comment: '', recommendation: '' },
  };
}

export function emptyStep(type: StepType, order: number): SimulationStep {
  return {
    id: uuid(),
    order,
    title: '',
    description: '',
    type,
    context: emptyContext(type),
    options: [emptyOption()],
  } as SimulationStep;
}

/** Cambia el tipo de un paso: conserva título, descripción y opciones; el contexto es nuevo. */
export function changeType(step: SimulationStep, type: StepType): SimulationStep {
  if (step.type === type) return step;
  return { ...step, type, context: emptyContext(type) } as SimulationStep;
}

/** Reordena (order = posición + 1). */
export function renumber(steps: SimulationStep[]): SimulationStep[] {
  return steps.map((step, index) => ({ ...step, order: index + 1 }));
}

/** Mueve un paso arriba (-1) o abajo (+1). */
export function moveStep(steps: SimulationStep[], index: number, delta: -1 | 1) {
  const target = index + delta;
  if (target < 0 || target >= steps.length) return steps;
  const next = [...steps];
  [next[index], next[target]] = [next[target]!, next[index]!];
  return renumber(next);
}

/** Quita un paso y las referencias a él (las opciones que llevaban ahí pasan a terminar). */
export function removeStep(steps: SimulationStep[], index: number) {
  const removed = steps[index];
  if (!removed) return steps;
  return renumber(
    steps
      .filter((_, i) => i !== index)
      .map(
        (step) =>
          ({
            ...step,
            options: step.options.map((option) =>
              option.next_step_id === removed.id ? { ...option, next_step_id: null } : option,
            ),
          }) as SimulationStep,
      ),
  );
}

const clean = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

/**
 * Antes de guardar: recorta textos y quita renglones vacíos de las listas (mientras se edita
 * se conservan para poder escribir). La valoración se redondea a 2 decimales.
 */
export function normalizeSteps(steps: SimulationStep[]): SimulationStep[] {
  return renumber(steps).map((step) => {
    const base = {
      ...step,
      title: step.title.trim(),
      description: step.description.trim(),
      options: step.options.map((option) => ({
        ...option,
        description: option.description.trim(),
        score: Math.round(Number(option.score) * 100) / 100,
        consequences: option.consequences
          .map((c) => ({ ...c, description: c.description.trim() }))
          .filter((c) => c.description),
        feedback: {
          ...option.feedback,
          comment: option.feedback.comment.trim(),
          recommendation: option.feedback.recommendation.trim(),
        },
      })),
    };
    switch (step.type) {
      case 'EMAIL':
        return {
          ...base,
          type: 'EMAIL',
          context: {
            sender: step.context.sender.trim(),
            subject: step.context.subject.trim(),
            body: step.context.body.trim(),
          },
        } as SimulationStep;
      case 'MEETING':
        return {
          ...base,
          type: 'MEETING',
          context: {
            participants: clean(step.context.participants),
            agenda: clean(step.context.agenda),
          },
        } as SimulationStep;
      case 'CONVERSATION':
        return {
          ...base,
          type: 'CONVERSATION',
          context: {
            interlocutor: step.context.interlocutor.trim(),
            lines: step.context.lines
              .map((line) => ({ speaker: line.speaker.trim(), text: line.text.trim() }))
              .filter((line) => line.speaker || line.text),
          },
        } as SimulationStep;
      case 'TASK':
        return {
          ...base,
          type: 'TASK',
          context: {
            deliverables: clean(step.context.deliverables),
            deadline_hours: Number(step.context.deadline_hours),
          },
        } as SimulationStep;
      case 'INCIDENT':
        return {
          ...base,
          type: 'INCIDENT',
          context: {
            severity: step.context.severity,
            timeline: step.context.timeline
              .map((entry) => ({ time: entry.time.trim(), event: entry.event.trim() }))
              .filter((entry) => entry.time || entry.event),
          },
        } as SimulationStep;
    }
  });
}

const OPTION_LETTERS = 'ABCDEF';
const FIELD_LABELS: Record<string, string> = {
  title: 'título',
  description: 'texto',
  sender: 'remitente',
  subject: 'asunto',
  body: 'cuerpo',
  participants: 'participantes',
  agenda: 'agenda',
  interlocutor: 'interlocutor',
  lines: 'diálogo',
  speaker: 'hablante',
  text: 'texto',
  deliverables: 'entregables',
  deadline_hours: 'plazo en horas',
  timeline: 'cronología',
  time: 'hora',
  event: 'evento',
  severity: 'severidad',
  options: 'opciones',
  score: 'valoración (0–100)',
  next_step_id: 'siguiente paso',
  consequences: 'consecuencias (máximo 3)',
  comment: 'comentario',
  recommendation: 'recomendación',
};

/** Ruta de un error de validación → texto para el autor: «Paso 2 · opción B · comentario». */
export function describePath(path: readonly PropertyKey[]): string {
  const parts: string[] = [];
  const [root, stepIndex, ...rest] = path;
  if (root !== 'steps') return 'Contenido';
  if (typeof stepIndex === 'number') parts.push(`Paso ${stepIndex + 1}`);
  let inOption = false;
  for (let i = 0; i < rest.length; i++) {
    const key = rest[i];
    const next = rest[i + 1];
    if (key === 'options' && typeof next === 'number') {
      parts.push(`opción ${OPTION_LETTERS[next] ?? next + 1}`);
      inOption = true;
      i++;
    } else if (key === 'consequences' && typeof next === 'number') {
      parts.push(`consecuencia ${next + 1}`);
      i++;
    } else if ((key === 'lines' || key === 'timeline') && typeof next === 'number') {
      parts.push(`${FIELD_LABELS[key]} ${next + 1}`);
      i++;
    } else if (key === 'description') {
      parts.push(inOption ? 'texto' : 'descripción');
    } else if (typeof key === 'string' && key !== 'context' && key !== 'feedback') {
      parts.push(FIELD_LABELS[key] ?? key);
    }
  }
  return parts.join(' · ');
}

export interface RouteEntry {
  step: number;
  option: string;
  target: string;
}

/** Mapa de rutas: de cada opción de cada paso a su destino (paso N o «Fin»). */
export function routeMap(steps: SimulationStep[]): RouteEntry[] {
  const orderById = new Map(steps.map((step, index) => [step.id, index + 1]));
  return steps.flatMap((step, index) =>
    step.options.map((option, optionIndex) => ({
      step: index + 1,
      option: OPTION_LETTERS[optionIndex] ?? String(optionIndex + 1),
      target:
        option.next_step_id === null
          ? 'Fin'
          : orderById.has(option.next_step_id)
            ? `Paso ${orderById.get(option.next_step_id)}`
            : '¿?',
    })),
  );
}

export { OPTION_LETTERS };

function analyzeRoutes(steps: SimulationStep[]) {
  const byId = new Map(steps.map((step) => [step.id, step]));
  const visiting = new Set<string>();
  const done = new Set<string>();
  let cycle = false;
  const visit = (id: string) => {
    if (visiting.has(id)) {
      cycle = true;
      return;
    }
    if (done.has(id)) return;
    const step = byId.get(id);
    if (!step) return;
    visiting.add(id);
    for (const option of step.options) {
      if (option.next_step_id !== null) visit(option.next_step_id);
    }
    visiting.delete(id);
    done.add(id);
  };
  const start = steps.find((step) => step.order === 1);
  if (start) visit(start.id);
  return {
    cycle,
    unreachable: steps.flatMap((step, index) => (done.has(step.id) ? [] : [index + 1])),
  };
}

/** Números en el editor de los pasos a los que no se llega desde el inicio. */
export function unreachableSteps(steps: SimulationStep[]): number[] {
  return analyzeRoutes(steps).unreachable;
}

/** ¿Alguna ruta desde el paso 1 contiene un ciclo? */
export function hasCycle(steps: SimulationStep[]): boolean {
  return analyzeRoutes(steps).cycle;
}

export interface CheckItem {
  label: string;
  ok: boolean;
}

/** «Antes de publicar»: las mismas reglas que aplica la API al publicar. */
export function publishChecklist(
  steps: SimulationStep[],
  { hasSkills, saved }: { hasSkills: boolean; saved: boolean },
): CheckItem[] {
  const { cycle, unreachable } = analyzeRoutes(steps);
  return [
    { label: 'Tiene al menos un paso (el primero es el inicio)', ok: steps.length > 0 },
    {
      label: 'Cada paso tiene al menos una opción',
      ok: steps.length > 0 && steps.every((step) => step.options.length > 0),
    },
    {
      label: 'Cada opción tiene al menos una consecuencia',
      ok:
        steps.length > 0 &&
        steps.every((step) => step.options.every((option) => option.consequences.length > 0)),
    },
    { label: 'Ninguna ruta vuelve a un paso anterior', ok: !cycle },
    {
      label: 'Se llega a todos los pasos desde el inicio',
      ok: unreachable.length === 0,
    },
    { label: 'Entrena al menos una habilidad', ok: hasSkills },
    { label: 'Los cambios están guardados', ok: saved },
  ];
}
