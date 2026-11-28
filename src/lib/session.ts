// Sesión en localStorage (DEC-F04): { token, user } con la clave qatok.session.
// El rol se toma de user.role; el JWT no se decodifica. La API vuelve a comprobar todo.
import { Session } from '@qatok/shared';

export const SESSION_KEY = 'qatok.session';
export type SavedSession = ReturnType<typeof Session.parse>;

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedSession: SavedSession | null = null;

function readRaw(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function notify() {
  for (const listener of listeners) listener();
}

export function readSession(): SavedSession | null {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  cachedSession = null;
  if (!raw) return null;
  try {
    const parsed = Session.safeParse(JSON.parse(raw));
    if (parsed.success) cachedSession = parsed.data;
  } catch {
    // JSON dañado: se trata como sin sesión.
  }
  if (!cachedSession) removeRaw();
  return cachedSession;
}

export function saveSession(session: SavedSession) {
  signedOut = false;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notify();
}

/** Cambia solo los datos del usuario (por ejemplo, tras GET o PATCH /api/me). */
export function updateSessionUser(user: SavedSession['user']) {
  const current = readSession();
  if (current) saveSession({ ...current, user });
}

function removeRaw() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // El almacenamiento puede estar bloqueado en el navegador.
  }
}

let signedOut = false;

/** Borra la sesión. `signOut: true` cuando el usuario pulsó «Salir» (sin ruta de regreso). */
export function clearSession({ signOut = false }: { signOut?: boolean } = {}) {
  signedOut = signOut;
  removeRaw();
  notify();
}

/** true si la última sesión terminó con «Salir» y no por vencimiento. */
export function endedBySignOut() {
  return signedOut;
}

/** Para useSyncExternalStore: avisa en esta pestaña y cuando otra pestaña cambia la sesión. */
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === SESSION_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}
