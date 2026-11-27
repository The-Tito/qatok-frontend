'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useSession } from '../lib/use-session';
import { useSignOut } from '../lib/use-sign-out';

interface NavItem {
  href: string;
  label: string;
  /** Ruta del icono en una rejilla pequeña (sprites de la barra de v2). */
  icon: { viewBox: string; d: string };
  /** Otras rutas que marcan este destino como actual (Mi cuenta cuelga de Perfil). */
  also?: string[];
}

const STUDENT_NAV: NavItem[] = [
  {
    href: '/simulaciones',
    label: 'Jugar',
    icon: {
      viewBox: '0 0 11 11',
      d: 'M5 0h1v3h-1z M4 3h3v1h-3z M3 4h5v1h-5z M0 5h11v1h-11z M3 6h5v1h-5z M4 7h3v1h-3z M5 8h1v3h-1z',
    },
  },
  {
    href: '/perfil',
    label: 'Perfil',
    also: ['/cuenta'],
    icon: { viewBox: '0 0 12 12', d: 'M3 0h6v6h-6z M1 7h10v5h-10z' },
  },
  {
    href: '/evidencias',
    label: 'Evidencias',
    icon: {
      viewBox: '0 0 12 12',
      d: 'M1 0h10v1h-10z M2 1h8v4h-8z M3 5h6v1h-6z M4 6h4v1h-4z M5 7h2v2h-2z M3 9h6v1h-6z M2 10h8v2h-8z',
    },
  },
];

const ADMIN_NAV: { href: string; label: string; also?: string[] }[] = [
  { href: '/admin/simulaciones', label: 'Simulaciones' },
  { href: '/admin/habilidades', label: 'Habilidades' },
];

function isActive(pathname: string, href: string, also: string[] = []) {
  return [href, ...also].some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

function NavIcon({ icon }: { icon: NavItem['icon'] }) {
  return (
    <svg className="pixel-icon" width="20" height="20" viewBox={icon.viewBox} aria-hidden="true">
      <path fill="currentColor" d={icon.d} />
    </svg>
  );
}

function UserMenu({ accountHref }: { accountHref?: string }) {
  const session = useSession();
  const signOut = useSignOut();
  const name = session?.user.name ?? '';
  return (
    <span className="shell-user">
      {accountHref ? (
        <Link href={accountHref} className="shell-user-name">
          {name}
        </Link>
      ) : (
        <span className="shell-user-name">{name}</span>
      )}
      <span aria-hidden="true"> · </span>
      <button type="button" className="shell-sign-out" onClick={signOut}>
        Salir
      </button>
    </span>
  );
}

/**
 * Estructura del estudiante: barra superior desde 1024 px y BottomNav fijo debajo de 1024 px.
 * Se usa en catálogo, perfil, evidencias y cuenta; el juego tiene su propia barra.
 */
export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="student-shell">
      <header className="topbar" data-variant="student">
        <div className="topbar-inner">
          <Link href="/simulaciones" className="topbar-brand">
            QATO&apos;K
          </Link>
          <nav aria-label="Principal" className="topbar-nav">
            {STUDENT_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="topbar-link"
                aria-current={isActive(pathname, item.href, item.also) ? 'page' : undefined}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            ))}
          </nav>
          <UserMenu accountHref="/cuenta" />
        </div>
      </header>
      <main className="shell-main">{children}</main>
      <nav aria-label="Principal" className="bottom-nav">
        {STUDENT_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bottom-nav-link"
            aria-current={isActive(pathname, item.href, item.also) ? 'page' : undefined}
          >
            <NavIcon icon={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/** Estructura de admin (escritorio): barra tinta con «QATO'K · Admin», navegación y usuario. */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <header className="topbar" data-variant="admin">
        <div className="topbar-inner">
          <Link href="/admin/simulaciones" className="topbar-brand">
            QATO&apos;K <span className="topbar-badge">Admin</span>
          </Link>
          <nav aria-label="Administración" className="topbar-nav">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="topbar-link"
                aria-current={isActive(pathname, item.href, item.also) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <UserMenu />
        </div>
      </header>
      <main className="shell-main">{children}</main>
    </div>
  );
}
