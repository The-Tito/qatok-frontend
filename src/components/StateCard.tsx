import Link from 'next/link';

export type StateKind = 'empty' | 'error' | 'forbidden' | 'expired' | 'not-found';

type Action = { label: string; href: string } | { label: string; onClick: () => void };

interface StateCardProps {
  kind: StateKind;
  title: string;
  message?: string;
  action?: Action;
  secondaryAction?: Action;
}

const tags: Partial<Record<StateKind, string>> = {
  error: '✕ Sin conexión',
  forbidden: '⊘ Sin permiso',
  expired: '⌛ Vencido',
  'not-found': '? No disponible',
};

function ActionButton({ action, primary }: { action: Action; primary: boolean }) {
  const variant = primary ? 'primary' : 'secondary';
  return 'href' in action ? (
    <Link className="pixel-button" data-variant={variant} data-size="md" href={action.href}>
      {action.label}
    </Link>
  ) : (
    <button
      className="pixel-button"
      data-variant={variant}
      data-size="md"
      type="button"
      onClick={action.onClick}
    >
      {action.label}
    </button>
  );
}

/** Estados de pantalla de `Estados.dc.html`: vacío, error, sin permiso, vencido y no encontrado. */
export function StateCard({ kind, title, message, action, secondaryAction }: StateCardProps) {
  const tag = tags[kind];
  return (
    <section className="state-card" data-kind={kind} role={kind === 'error' ? 'alert' : undefined}>
      {tag ? <span className="state-card-tag">{tag}</span> : null}
      {kind === 'empty' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/sprites/sparkle.svg" alt="" width={33} height={33} />
      ) : null}
      <h1 className="state-card-title">{title}</h1>
      {message ? <p className="state-card-message">{message}</p> : null}
      {action || secondaryAction ? (
        <div className="state-card-actions">
          {action ? <ActionButton action={action} primary /> : null}
          {secondaryAction ? <ActionButton action={secondaryAction} primary={false} /> : null}
        </div>
      ) : null}
    </section>
  );
}

/** Cargando: bloques del tamaño final y barra a rayas; nunca un spinner a pantalla completa. */
export function LoadingCard({
  label = 'Cargando',
  blocks = 2,
}: {
  label?: string;
  blocks?: number;
}) {
  return (
    <section className="state-card" data-kind="loading" aria-busy="true" aria-live="polite">
      <div className="skeleton skeleton-line" />
      {Array.from({ length: blocks }, (_, i) => (
        <div key={i} className="skeleton skeleton-block" />
      ))}
      <div className="loading-row">
        <span className="loading-label">{label}</span>
        <div className="stripe-bar" data-tone="ink" />
      </div>
    </section>
  );
}
