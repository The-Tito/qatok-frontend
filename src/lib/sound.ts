// Efectos de sonido generados con Web Audio (sin archivos). Apagados por defecto; la
// preferencia se guarda en localStorage con la clave qatok.sound ("on" | "off").

export const SOUND_KEY = 'qatok.sound';

const listeners = new Set<() => void>();
let context: AudioContext | null = null;

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === 'on';
  } catch {
    return false;
  }
}

export function setSoundOn(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
  } catch {
    // Sin almacenamiento: la preferencia dura solo esta visita.
  }
  // El navegador solo deja crear el audio tras un clic: este es ese momento.
  if (on)
    audio()
      ?.resume()
      .catch(() => undefined);
  listeners.forEach((listener) => listener());
}

export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  context ??= new AudioContext();
  return context;
}

/**
 * "Habla" de personita: un bip cuadrado de 8 bits por sílaba, con tono al azar alrededor de
 * `pitch` (Hz). `heated` sube el tono y la velocidad (discusión).
 */
export function babble(pitch: number, syllables: number, heated = false): void {
  if (!isSoundOn() || document.hidden) return;
  const ctx = audio();
  if (!ctx || ctx.state !== 'running') return;

  const pace = heated ? 0.62 : 1;
  const tone = heated ? 1.35 : 1;
  const volume = heated ? 0.05 : 0.035;
  let at = ctx.currentTime + 0.02;

  for (let i = 0; i < syllables; i += 1) {
    const length = 0.055 * pace;
    const frequency = pitch * tone * (0.85 + Math.random() * 0.45);
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, at);
    oscillator.frequency.linearRampToValueAtTime(
      frequency * (0.9 + Math.random() * 0.22),
      at + length,
    );
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(at);
    oscillator.stop(at + length + 0.05);
    at += (i % 4 === 3 ? 0.16 : 0.075) * pace;
  }
}
