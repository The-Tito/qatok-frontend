import type { PlayerStep } from '@qatok/shared';
import { SceneBackdrop } from '../SceneBackdrop';
import { InterlocutorSprite } from '../Sprites';

export const STEP_TYPES: Record<
  PlayerStep['type'],
  { label: string; sprite: string; question: string; width: number; height: number }
> = {
  EMAIL: { label: 'Correo', sprite: 'envelope', question: '¿Qué haces?', width: 36, height: 27 },
  MEETING: { label: 'Reunión', sprite: 'meeting', question: '¿Qué haces?', width: 36, height: 30 },
  CONVERSATION: {
    label: 'Conversación',
    sprite: 'bubble',
    question: '¿Qué respondes?',
    width: 32,
    height: 29,
  },
  TASK: { label: 'Tarea', sprite: 'task', question: '¿Qué haces?', width: 25, height: 30 },
  INCIDENT: {
    label: 'Incidente',
    sprite: 'incident',
    question: '¿Qué haces?',
    width: 33,
    height: 30,
  },
};

const SEVERITY = {
  LOW: { label: 'Baja', mark: '▽' },
  MEDIUM: { label: 'Media', mark: '◆' },
  HIGH: { label: 'Alta', mark: '▲' },
} as const;

const two = (n: number) => String(n).padStart(2, '0');
const hours = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} h`;

/**
 * Situación del paso: un renderizador por tipo (02 · Jugar). Los textos salen del contexto
 * de la API tal cual; nunca se muestran valoraciones ni retroalimentación antes de decidir.
 */
export interface Reveal {
  /** Letras visibles del diálogo (escritura letra por letra, issue 7.1). */
  chars: number;
  ready: boolean;
  /** Muestra todo el texto (tocar, Enter o Espacio). */
  skip: () => void;
}

export function StepContext({ step, reveal }: { step: PlayerStep; reveal?: Reveal }) {
  switch (step.type) {
    case 'EMAIL':
      return (
        <article className="ctx panel" data-ctx="email">
          <div className="ctx-head ctx-head-rows">
            <div className="ctx-row">
              <span className="ctx-key">De</span>
              <span className="ctx-break">{step.context.sender}</span>
            </div>
            <div className="ctx-row">
              <span className="ctx-key">Asunto</span>
              <span className="ctx-strong">{step.context.subject}</span>
            </div>
          </div>
          <p className="ctx-body ctx-email-body">{step.context.body}</p>
        </article>
      );
    case 'MEETING':
      return (
        <article className="ctx panel" data-ctx="meeting">
          <div className="ctx-head">
            <span className="ctx-key">Participantes</span>
            <ul className="ctx-people" aria-label="Participantes">
              {step.context.participants.map((person, index) => (
                <li key={index}>{person}</li>
              ))}
            </ul>
          </div>
          <div className="ctx-body">
            <span className="ctx-key">Agenda</span>
            <ol className="ctx-agenda">
              {step.context.agenda.map((item, index) => (
                <li key={index}>
                  <span className="ctx-num" aria-hidden="true">
                    {two(index + 1)}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </article>
      );
    case 'TASK':
      return (
        <article className="ctx panel" data-ctx="task">
          <div className="ctx-head ctx-head-split">
            <span className="ctx-key">Entregables · {step.context.deliverables.length}</span>
            <span className="ctx-pill" data-tone="type">
              Plazo: {hours(step.context.deadline_hours)}
            </span>
          </div>
          <ul className="ctx-body ctx-checklist" aria-label="Entregables">
            {step.context.deliverables.map((item, index) => (
              <li key={index}>
                <span className="ctx-box" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </article>
      );
    case 'INCIDENT': {
      const severity = SEVERITY[step.context.severity];
      return (
        <article className="ctx panel" data-ctx="incident" data-severity={step.context.severity}>
          <div className="ctx-head ctx-head-split ctx-severity">
            <span className="ctx-key">Severidad</span>
            <span className="ctx-pill">
              <span aria-hidden="true">{severity.mark}</span> {severity.label}
            </span>
          </div>
          <div className="ctx-body">
            <span className="ctx-key">Cronología</span>
            <ol className="ctx-timeline">
              {step.context.timeline.map((entry, index) => (
                <li key={index}>
                  <span className="ctx-time">{entry.time}</span>
                  <span>{entry.event}</span>
                </li>
              ))}
            </ol>
          </div>
        </article>
      );
    }
    case 'CONVERSATION':
      return <ConversationContext step={step} reveal={reveal} />;
  }
}

function ConversationContext({
  step,
  reveal,
}: {
  step: Extract<PlayerStep, { type: 'CONVERSATION' }>;
  reveal?: Reveal;
}) {
  const { interlocutor, lines } = step.context;
  const speaker = lines.find((line) => line.speaker !== interlocutor)?.speaker;
  // El rol solo se muestra si el nombre no lo trae ya («Mariana Torres (Cliente)»).
  const role = speaker && !interlocutor.includes(speaker) ? speaker : undefined;
  return (
    <div className="ctx-conversation">
      <div className="ctx-scene panel">
        <SceneBackdrop />
        <div className="ctx-nameplate">
          <span className="ctx-nameplate-name">{interlocutor}</span>
          {role ? <span className="ctx-nameplate-role">{role}</span> : null}
        </div>
        <div className="ctx-platform" aria-hidden="true" />
        <InterlocutorSprite className="ctx-interlocutor" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sprites/student-back.svg" alt="" className="ctx-student" />
      </div>
      <div
        className="dialog-box panel"
        data-state={reveal && !reveal.ready ? 'revealing' : 'ready'}
        onClick={reveal && !reveal.ready ? reveal.skip : undefined}
      >
        {visibleLines(lines, reveal).map((line, index) => (
          <p key={index} className="dialog-line" data-current={line.current || undefined}>
            <span className="dialog-speaker">{line.speaker}</span>
            {/* Mientras se escribe, el lector de pantalla recibe el texto completo. */}
            <span className="dialog-text" aria-hidden={line.partial || undefined}>
              {line.shown}
            </span>
            {line.partial ? <span className="sr-only">{line.text}</span> : null}
          </p>
        ))}
        {reveal && !reveal.ready ? (
          <button type="button" className="dialog-skip" onClick={reveal.skip}>
            Mostrar todo
          </button>
        ) : (
          <span className="dialog-more" aria-hidden="true">
            ▼
          </span>
        )}
      </div>
    </div>
  );
}

/** Recorta las líneas a las letras visibles. Sin reveal (o listo) se muestra todo. */
function visibleLines(lines: { speaker: string; text: string }[], reveal?: Reveal) {
  let left = reveal && !reveal.ready ? reveal.chars : Infinity;
  let currentMarked = false;
  return lines.map((line) => {
    const shown = line.text.slice(0, Math.max(0, left));
    left -= line.text.length;
    const partial = shown.length < line.text.length;
    const current = partial && !currentMarked;
    if (current) currentMarked = true;
    return { ...line, shown, partial, current };
  });
}
