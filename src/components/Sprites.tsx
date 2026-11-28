// Sprites en línea cuando el color cambia (los fijos se usan con <img src="/sprites/…">).

const SPARKLE =
  'M5 0h1v3h-1z M4 3h3v1h-3z M3 4h5v1h-5z M0 5h11v1h-11z M3 6h5v1h-5z M4 7h3v1h-3z M5 8h1v3h-1z';

/** Destello decorativo de 11×11 en el color indicado. */
export function Sparkle({
  color,
  size = 21,
  className,
}: {
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={['pixel-icon', 'sparkle', className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 11 11"
      aria-hidden="true"
    >
      <path fill={color} d={SPARKLE} />
    </svg>
  );
}

/** Estudiante 16×16 (sprites/student.svg) con la camisa del color indicado. Decorativo. */
export function StudentSprite({
  shirt = 'var(--type-base)',
  size = 64,
  className,
}: {
  shirt?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={['pixel-icon', className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fill="#2A2238"
        d="M5 0h6v1h-6z M3 1h10v1h-10z M2 2h12v8h-12z M4 10h8v1h-8z M2 11h12v1h-12z M1 12h14v4h-14z"
      />
      <path fill="#4A3328" d="M5 1h6v1h-6z M3 2h10v3h-10z M3 5h1v1h-1z M12 5h1v1h-1z" />
      <path fill="#7A5A48" d="M6 2h3v1h-3z M4 3h2v1h-2z" />
      <path
        fill="#F2C9A0"
        d="M5 4h6v1h-6z M4 5h8v1h-8z M3 6h10v3h-10z M4 9h8v1h-8z M6 10h4v1h-4z"
      />
      <path fill="#D9A57C" d="M6 10h4v1h-4z M4 9h1v1h-1z M11 9h1v1h-1z" />
      <path fill="#2A2238" d="M5 6h2v2h-2z M9 6h2v2h-2z" />
      <path fill="#FFFFFF" d="M5 6h1v1h-1z M9 6h1v1h-1z" />
      <path fill="#E89A8A" d="M4 8h1v1h-1z M11 8h1v1h-1z" />
      <path fill="#B0705A" d="M7 8h2v1h-2z" />
      <path fill={shirt} d="M3 11h10v1h-10z M2 12h12v3h-12z" />
      <path fill="#2A2238" fillOpacity=".28" d="M2 12h2v3h-2z M12 12h2v3h-2z" />
      <path fill="#FFFFFF" d="M6 11h4v1h-4z M7 12h2v1h-2z" />
    </svg>
  );
}

/** Persona de cuerpo completo 16×24 (misma cabeza que el estudiante). Decorativa. */
export function PersonSprite({
  shirt = 'var(--type-base)',
  hair = '#4A3328',
  skin = '#F2C9A0',
  pants = '#3B3150',
  height = 72,
  className,
}: {
  shirt?: string;
  hair?: string;
  skin?: string;
  pants?: string;
  /** Alto en px; el ancho es 2/3 del alto. */
  height?: number;
  className?: string;
}) {
  return (
    <svg
      className={['pixel-icon', className].filter(Boolean).join(' ')}
      width={(height * 2) / 3}
      height={height}
      viewBox="0 0 16 24"
      aria-hidden="true"
    >
      <path
        fill="#2A2238"
        d="M5 0h6v1h-6z M3 1h10v1h-10z M2 2h12v8h-12z M4 10h8v1h-8z M2 11h12v7h-12z M1 12h14v5h-14z M3 18h10v1h-10z M3 19h4v3h-4z M9 19h4v3h-4z M2 22h5v2h-5z M9 22h5v2h-5z"
      />
      <path fill={hair} d="M5 1h6v1h-6z M3 2h10v3h-10z M3 5h1v1h-1z M12 5h1v1h-1z" />
      <path fill="#FFFFFF" fillOpacity=".22" d="M6 2h3v1h-3z M4 3h2v1h-2z" />
      <path
        fill={skin}
        d="M5 4h6v1h-6z M4 5h8v1h-8z M3 6h10v3h-10z M4 9h8v1h-8z M6 10h4v1h-4z M2 15h1v1h-1z M13 15h1v1h-1z"
      />
      <path fill="#2A2238" fillOpacity=".18" d="M6 10h4v1h-4z M4 9h1v1h-1z M11 9h1v1h-1z" />
      <path fill="#2A2238" d="M5 6h2v2h-2z M9 6h2v2h-2z" />
      <path fill="#FFFFFF" d="M5 6h1v1h-1z M9 6h1v1h-1z" />
      <path fill="#E89A8A" d="M4 8h1v1h-1z M11 8h1v1h-1z" />
      <path fill="#B0705A" d="M7 8h2v1h-2z" />
      <path fill={shirt} d="M3 11h10v6h-10z M2 12h1v3h-1z M13 12h1v3h-1z" />
      <path fill="#2A2238" fillOpacity=".28" d="M3 12h1v5h-1z M12 12h1v5h-1z" />
      <path fill="#FFFFFF" d="M6 11h4v1h-4z M7 12h2v1h-2z" />
      <path fill={pants} d="M4 18h8v1h-8z M4 19h2v3h-2z M10 19h2v3h-2z" />
      <path fill="#6B5A7E" d="M3 22h3v1h-3z M10 22h3v1h-3z" />
    </svg>
  );
}
