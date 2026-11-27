// Rutas de la app (04 · Rutas). Un solo lugar para cambiarlas.
import type { Account } from '@qatok/shared';

// La pantalla de entrar pasa a /entrar en el issue 1.1.
export const LOGIN_PATH = '/login';
export const STUDENT_HOME = '/simulaciones';
export const ADMIN_HOME = '/admin/simulaciones';

export function homeFor(role: Account['role']) {
  return role === 'ADMIN' ? ADMIN_HOME : STUDENT_HOME;
}

/** /login?next=<ruta> para volver después de entrar. Solo acepta rutas internas. */
export function loginUrl(next?: string) {
  const safe = safeNext(next);
  return safe ? `${LOGIN_PATH}?next=${encodeURIComponent(safe)}` : LOGIN_PATH;
}

/** Evita redirecciones abiertas: solo rutas que empiezan con una sola «/». */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return null;
  }
  return next;
}
