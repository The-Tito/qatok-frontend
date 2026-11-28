'use client';

import { useEffect, useState } from 'react';
import { PersonSprite } from '../../components/Sprites';
import { babble } from '../../lib/sound';

type Mood = 'talk' | 'mad' | 'ok';

const PEOPLE = [
  { shirt: '#E8A33D', hair: '#4A3328', skin: '#F2C9A0', pants: '#3B3150', pitch: 420 },
  { shirt: '#8A5CC7', hair: '#2A2238', skin: '#C68A5E', pants: '#4A3328', pitch: 300 },
  { shirt: '#4FA35A', hair: '#B5583B', skin: '#F2C9A0', pants: '#3B3150', pitch: 520 },
  { shirt: '#D9483B', hair: '#7A5A48', skin: '#E0AE84', pants: '#2A2238', pitch: 360 },
] as const;

/** Guion en bucle: [quién, texto, tono, ms]. quién = -1 es una pausa. */
const SCRIPT: ReadonlyArray<readonly [number, string, Mood, number]> = [
  [0, 'Hola', 'talk', 1600],
  [1, '¿Café?', 'talk', 1600],
  [2, '...', 'talk', 1400],
  [3, '</> listo', 'ok', 1800],
  [-1, '', 'talk', 2500],
  [0, '¿Deploy hoy?', 'talk', 1800],
  [1, 'Sí, ya', 'talk', 1500],
  [2, '¡¿Viernes?!', 'mad', 1800],
  [1, '¡Ya está!', 'mad', 1500],
  [2, '¡No probaste!', 'mad', 1700],
  [1, '#@%!', 'mad', 1400],
  [2, '¡¡!!', 'mad', 1300],
  [3, 'Calma...', 'talk', 1800],
  [3, '¿Revisamos?', 'talk', 1800],
  [1, '...ok', 'talk', 1500],
  [2, 'Va', 'ok', 1400],
  [0, 'Lunes ✓', 'ok', 1800],
  [-1, '', 'talk', 6000],
];

/** Fondo de Entrar y Crear cuenta: oficina de IT con personitas que platican y discuten. */
export function OfficeScene() {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let current = -1;
    let timer = 0;
    const next = () => {
      // Con la pestaña oculta el guion espera, sin gastar nada.
      if (!document.hidden) {
        current = (current + 1) % SCRIPT.length;
        setStep(current);
        const line = SCRIPT[current];
        const person = line ? PEOPLE[line[0]] : undefined;
        if (line && person)
          babble(person.pitch, Math.max(4, line[1].length + 2), line[2] === 'mad');
      }
      timer = window.setTimeout(next, SCRIPT[current]?.[3] ?? 1000);
    };
    timer = window.setTimeout(next, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const line = SCRIPT[step];
  const speaker = line && line[0] >= 0 ? line[0] : -1;
  const heated = line?.[2] === 'mad';

  return (
    <div className="office" aria-hidden="true">
      <div className="office-window office-window-1" />
      <div className="office-window office-window-2" />
      <div className="office-board">
        {['#8A5CC7', '#4FA35A', '#E8A33D', '#D9483B', '#4FA35A', '', '#8A5CC7', '', '#4FA35A'].map(
          (color, i) => (
            <i key={i} style={color ? { background: color } : undefined} />
          ),
        )}
      </div>
      <div className="office-desk office-desk-1">
        <span className="office-monitor" />
      </div>
      <div className="office-desk office-desk-2">
        <span className="office-monitor" />
      </div>
      {PEOPLE.map((person, i) => {
        // En la discusión, quien escucha también se altera.
        const mood = i === speaker ? line?.[2] : heated && (i === 1 || i === 2) ? 'mad' : undefined;
        return (
          <div key={i} className={`office-person office-person-${i + 1}`} data-mood={mood}>
            <span
              className="office-bubble"
              data-mood={line?.[2]}
              data-shown={i === speaker || undefined}
            >
              {i === speaker ? line?.[1] : ''}
            </span>
            <PersonSprite
              shirt={person.shirt}
              hair={person.hair}
              skin={person.skin}
              pants={person.pants}
              className="office-sprite"
            />
          </div>
        );
      })}
    </div>
  );
}
