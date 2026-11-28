'use client';

import { setSoundOn } from '../lib/sound';
import { useSoundOn } from '../lib/use-sound';

/** Botón de sonido sí/no (apagado por defecto). */
export function SoundToggle({ className }: { className?: string }) {
  const on = useSoundOn();
  return (
    <button
      type="button"
      className={['sound-toggle', className].filter(Boolean).join(' ')}
      aria-pressed={on}
      aria-label={on ? 'Desactivar sonido' : 'Activar sonido'}
      onClick={() => setSoundOn(!on)}
    >
      <span aria-hidden="true">♪</span> {on ? 'Sí' : 'No'}
    </button>
  );
}
