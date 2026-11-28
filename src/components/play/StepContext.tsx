import type { PlayerStep } from '@qatok/shared';
import { useSyncExternalStore } from 'react';
import { InterlocutorSprite, StudentSprite } from '../Sprites';
import { FrontDeskScene } from './FrontDeskScene';

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
      return <EmailContext context={step.context} />;
    case 'MEETING':
      return <MeetingContext context={step.context} />;
    case 'TASK':
      return <TaskContext context={step.context} />;
    case 'INCIDENT':
      return <IncidentContext context={step.context} />;
    case 'CONVERSATION':
      return <ConversationContext step={step} reveal={reveal} />;
  }
}

type ContextOf<T extends PlayerStep['type']> = Extract<PlayerStep, { type: T }>['context'];

/** «Mariana Torres <compras@x.com>» → nombre y dirección; si no trae <…>, todo es el nombre. */
export function splitSender(sender: string): { name: string; address?: string } {
  const match = /^(.*?)\s*<([^>]+)>\s*$/.exec(sender);
  const name = match?.[1]?.trim();
  return match && name ? { name, address: match[2] } : { name: sender };
}

/** Correo: ventana de bandeja dentro de un monitor (opción A + C). */
function EmailContext({ context }: { context: ContextOf<'EMAIL'> }) {
  const sender = splitSender(context.sender);
  return (
    <article className="ctx ctx-monitor" data-ctx="email">
      <div className="ctx-window">
        <div className="ctx-window-bar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sprites/envelope.svg" alt="" width={20} height={15} />
          <span className="ctx-window-title">Bandeja · 1 nuevo</span>
          <span className="ctx-window-buttons" aria-hidden="true">
            <i>_</i>
            <i>□</i>
            <i>×</i>
          </span>
        </div>
        <div className="ctx-window-tools" aria-hidden="true">
          <span>◀ Responder</span>
          <span>Reenviar ▶</span>
        </div>
        <div className="ctx-mail">
          <div className="ctx-inbox" aria-hidden="true">
            <span className="ctx-inbox-title">Bandeja (1)</span>
            <span className="ctx-inbox-row" data-current="">
              <b>{sender.name}</b>
              {context.subject}
            </span>
            <span className="ctx-inbox-row">
              <b>RR. HH.</b>Junta semanal
            </span>
            <span className="ctx-inbox-row">
              <b>Soporte TI</b>Mantenimiento
            </span>
          </div>
          <div className="ctx-mail-read">
            <div className="ctx-mail-head">
              <InterlocutorSprite className="ctx-mail-avatar" />
              <div className="ctx-mail-meta">
                <span className="ctx-mail-from">
                  <span className="sr-only">De: </span>
                  {sender.name}
                  <span className="ctx-new">Nuevo</span>
                </span>
                {sender.address ? (
                  <span className="ctx-break ctx-mail-address">{sender.address}</span>
                ) : null}
                <span className="ctx-mail-subject">
                  <span className="sr-only">Asunto: </span>
                  {context.subject}
                </span>
              </div>
            </div>
            <p className="ctx-email-body">{context.body}</p>
          </div>
        </div>
        <div className="ctx-window-foot" aria-hidden="true">
          <span>Correo nuevo</span>
          <span>1 de 1</span>
        </div>
      </div>
      <span className="ctx-monitor-led" aria-hidden="true" />
      <span className="ctx-monitor-stand" aria-hidden="true" />
    </article>
  );
}

const ATTENDEE_COLORS = ['#E8A33D', '#5A86C8', '#8A5CC7', '#D9483B', '#3E9C8F'];

/** Reunión: invitación de calendario. La fecha es la de hoy (el paso no trae fecha). */
function MeetingContext({ context }: { context: ContextOf<'MEETING'> }) {
  const today = useToday();
  let other = 0;
  return (
    <article className="ctx panel ctx-invite" data-ctx="meeting">
      <div className="ctx-day" aria-hidden="true">
        <span className="ctx-day-month">{today?.month ?? ''}</span>
        <span className="ctx-day-num">{today?.day ?? ''}</span>
        <span className="ctx-day-label">Hoy</span>
      </div>
      <div className="ctx-invite-main">
        <span className="ctx-key">Invitados · {context.participants.length}</span>
        <ul className="ctx-attendees" aria-label="Participantes">
          {context.participants.map((person, index) => {
            const isYou = person.trim().toLowerCase() === 'tú';
            const color = isYou
              ? 'var(--type-leaf-base)'
              : ATTENDEE_COLORS[other++ % ATTENDEE_COLORS.length];
            return (
              <li key={index}>
                <StudentSprite shirt={color} size={20} />
                {person}
              </li>
            );
          })}
        </ul>
        <span className="ctx-key">Orden del día</span>
        <ol className="ctx-agenda" aria-label="Agenda">
          {context.agenda.map((item, index) => (
            <li key={index}>
              <span className="ctx-box" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const noSubscribe = () => () => undefined;

/** Fecha de hoy solo en el navegador (en el servidor no hay zona horaria del usuario). */
function useToday() {
  const key = useSyncExternalStore(
    noSubscribe,
    () => new Date().toDateString(),
    () => null,
  );
  if (!key) return null;
  const date = new Date(key);
  return { month: MONTHS[date.getMonth()] ?? '', day: date.getDate() };
}

/** Bloques de horas del plazo: uno por hora, como mucho 8. */
const MAX_CELLS = 8;

/** Tarea: ticket de tablero con el plazo en bloques de horas. */
function TaskContext({ context }: { context: ContextOf<'TASK'> }) {
  const cells = Math.min(MAX_CELLS, Math.max(1, Math.ceil(context.deadline_hours)));
  return (
    <article className="ctx panel ctx-ticket" data-ctx="task">
      <div className="ctx-ticket-body">
        <div className="ctx-ticket-top">
          <span className="ctx-key">Entregables · {context.deliverables.length}</span>
          <span className="ctx-assignee">
            <StudentSprite shirt="var(--type-leaf-base)" size={22} />
            Asignada a ti
          </span>
        </div>
        <div className="ctx-deadline">
          <span>Vence en {hours(context.deadline_hours)}</span>
          <span className="ctx-cells" aria-hidden="true">
            {Array.from({ length: cells }, (_, index) => (
              <i key={index} data-current={index === 0 || undefined} />
            ))}
          </span>
        </div>
        <ul className="ctx-checklist" aria-label="Entregables">
          {context.deliverables.map((item, index) => (
            <li key={index}>
              <span className="ctx-box" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/** Incidente: cinta de peligro según la severidad y cronología vertical. */
function IncidentContext({ context }: { context: ContextOf<'INCIDENT'> }) {
  const severity = SEVERITY[context.severity];
  const events = context.timeline.length;
  return (
    <article className="ctx panel ctx-hazard" data-ctx="incident" data-severity={context.severity}>
      <div className="ctx-tape" aria-hidden="true" />
      <div className="ctx-head ctx-head-split ctx-severity">
        <span className="ctx-severity-label">
          <span aria-hidden="true">{severity.mark}</span> Severidad {severity.label.toLowerCase()}
        </span>
        <span className="ctx-key">
          {events} {events === 1 ? 'evento' : 'eventos'}
        </span>
      </div>
      <ol className="ctx-body ctx-timeline" aria-label="Cronología">
        {context.timeline.map((entry, index) => (
          <li key={index}>
            <span className="ctx-time">{entry.time}</span>
            <span>{entry.event}</span>
          </li>
        ))}
      </ol>
    </article>
  );
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
        <FrontDeskScene />
      </div>
      <div
        className="dialog-box panel"
        data-state={reveal && !reveal.ready ? 'revealing' : 'ready'}
        onClick={reveal && !reveal.ready ? reveal.skip : undefined}
      >
        <span className="dialog-name">
          {interlocutor}
          {role ? <span className="dialog-role"> · {role}</span> : null}
        </span>
        <InterlocutorSprite className="dialog-portrait" />
        <div className="dialog-lines">
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
