// Rutas de la app (04 · Rutas). Un solo lugar para cambiarlas.
import type { Account } from '@qatok/shared';

export const LOGIN_PATH = '/entrar';
export const REGISTER_PATH = '/registro';
export const STUDENT_HOME = '/simulaciones';
export const ADMIN_HOME = '/admin/simulaciones';

export function homeFor(role: Account['role']) {
  return role === 'ADMIN' ? ADMIN_HOME : STUDENT_HOME;
}

/** /entrar?next=<ruta> para volver después de entrar. Solo acepta rutas internas. */
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

const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/');

/**
 * A dónde ir después de entrar: la ruta de regreso si es interna y del área del rol
 * (admin → /admin/…, estudiante → lo demás); si no, el inicio del rol.
 */
export function afterLogin(role: Account['role'], next: string | null | undefined) {
  const safe = safeNext(next);
  if (!safe || safe === LOGIN_PATH || safe === REGISTER_PATH) return homeFor(role);
  const pathname = safe.split(/[?#]/)[0] ?? safe;
  return isAdminPath(pathname) === (role === 'ADMIN') ? safe : homeFor(role);
}
