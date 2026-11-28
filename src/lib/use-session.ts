'use client';

import { useSyncExternalStore } from 'react';
import { readSession, subscribeSession, type SavedSession } from './session';

/**
 * Sesión guardada, reactiva a cambios en esta pestaña y en otras.
 * En el servidor y en la primera hidratación vale `undefined` (todavía no se sabe).
 */
export function useSession(): SavedSession | null | undefined {
  return useSyncExternalStore(subscribeSession, readSession, () => undefined);
}
