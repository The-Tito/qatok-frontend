import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'type' | 'secondary' | 'danger';

interface CommonProps {
  variant?: ButtonVariant;
  /** `lg` (56 px) para la acción principal de una pantalla móvil; `md` (48 px) por defecto. */
  size?: 'md' | 'lg';
  /** Ocupa todo el ancho de su contenedor. */
  block?: boolean;
  children: ReactNode;
  className?: string;
}

type AsLink = CommonProps & { href: string; disabled?: never };
type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };

/**
 * Botón de 01 · Componentes (Main §04): `primary` (tinta), `type` (dark del tipo activo,
 * ver data-type), `secondary` (blanco con borde) y `danger` (texto de error). Deshabilitado:
 * borde discontinuo. Con `href` es un enlace de Next.
 */
export function PixelButton({
  variant = 'primary',
  size = 'md',
  block = false,
  children,
  className,
  href,
  ...rest
}: AsLink | AsButton) {
  const classes = ['pixel-button', className].filter(Boolean).join(' ');
  const data = { 'data-variant': variant, 'data-size': size, 'data-block': block || undefined };

  if (href !== undefined) {
    return (
      <Link href={href} className={classes} {...data}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = rest as Omit<AsButton, keyof CommonProps | 'href'>;
  return (
    <button type={type} className={classes} {...data} {...buttonProps}>
      {children}
    </button>
  );
}
