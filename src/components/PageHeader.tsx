import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  /** Etiqueta corta sobre el título («Tu cuenta»). */
  eyebrow?: string;
  back?: { href: string; label: string };
}

/**
 * Encabezado de pantalla del estudiante. Móvil: barra de 64 px con ◀ y textos pequeños.
 * Desde 1024 px: enlace «◀ …», etiqueta y título grande (v2 · Web).
 */
export function PageHeader({ title, eyebrow, back }: PageHeaderProps) {
  return (
    <header className="page-header">
      {back ? (
        <Link href={back.href} className="page-header-back" aria-label={`Volver a ${back.label}`}>
          <span aria-hidden="true">◀</span>
          <span className="page-header-back-text" aria-hidden="true">
            {back.label}
          </span>
        </Link>
      ) : null}
      <div className="page-header-text">
        {eyebrow ? <span className="page-header-eyebrow">{eyebrow}</span> : null}
        <h1 className="page-header-title">{title}</h1>
      </div>
    </header>
  );
}
