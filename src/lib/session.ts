import { Session } from '@qatok/shared';

const storageKey = 'qatok.session';
type SavedSession = ReturnType<typeof Session.parse>;

export function readSession(): SavedSession | null {
  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return null;
    const parsed = Session.safeParse(JSON.parse(value));
    if (parsed.success) return parsed.data;
    clearSession();
  } catch {
    clearSession();
  }
  return null;
}

export function saveSession(session: SavedSession) {
  localStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearSession() {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // El almacenamiento puede estar bloqueado en el navegador.
  }
}
