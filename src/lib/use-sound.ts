'use client';

import { useSyncExternalStore } from 'react';
import { isSoundOn, subscribeSound } from './sound';

/** Preferencia de sonido; en el servidor siempre apagado. */
export function useSoundOn(): boolean {
  return useSyncExternalStore(subscribeSound, isSoundOn, () => false);
}
