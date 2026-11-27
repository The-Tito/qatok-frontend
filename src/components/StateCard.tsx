import Link from 'next/link';

export type StateKind = 'loading' | 'empty' | 'error' | 'forbidden' | 'expired' | 'not-found';

const icons: Record<StateKind, string> = {
  loading: '…',
  empty: '○',
  error: '✕',
  forbidden: '⊘',
  expired: '⌛',
  'not-found': '?',
};

interface StateCardProps {
  kind: StateKind;
  title: string;
  message?: string;
  action?: { label: string; href: string } | { label: string; onClick: () => void };
}

/** Estados de pantalla (vacío, error, sin permiso, vencido…). El estilo completo llega en 0.3. */
export function StateCard({ kind, title, message, action }: StateCardProps) {
  return (
    <section
      className="state-card"
      data-kind={kind}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-busy={kind === 'loading' || undefined}
    >
      <span className="state-card-icon" aria-hidden="true">
        {icons[kind]}
      </span>
      <h1 className="state-card-title">{title}</h1>
      {message ? <p className="state-card-message">{message}</p> : null}
      {action ? (
        'href' in action ? (
          <Link className="state-card-action" href={action.href}>
            {action.label}
          </Link>
        ) : (
          <button className="state-card-action" type="button" onClick={action.onClick}>
            {action.label}
          </button>
        )
      ) : null}
    </section>
  );
}
