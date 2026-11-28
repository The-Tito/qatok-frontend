'use client';

import { useEffect, useState } from 'react';
import { babble } from '../../lib/sound';
import {
  personPalette,
  SCENE_H,
  SCENE_W,
  sprite,
  STANDING,
  STANDING_MAD,
  type Paths,
} from './office-art';

type Mood = 'talk' | 'mad' | 'ok';

/**
 * Las cuatro personitas, en dos parejas a los lados del formulario: la discusión es entre
 * las dos de adentro, de un lado al otro. `band` es la franja donde su globo debe caber
 * (lo que queda visible a los lados del formulario incluso en pantallas 4:3).
 */
const LEFT_BAND = [42, 104] as const;
const RIGHT_BAND = [216, 280] as const;
const PEOPLE = [
  {
    x: 48,
    feet: 162,
    band: LEFT_BAND,
    look: { hair: '#4A3328', skin: '#F2C9A0', shirt: '#E8A33D' },
    pitch: 420,
  },
  {
    x: 74,
    feet: 158,
    band: LEFT_BAND,
    look: { hair: '#2A2238', skin: '#C68A5E', shirt: '#8A5CC7' },
    pitch: 300,
  },
  {
    x: 228,
    feet: 150,
    band: RIGHT_BAND,
    look: { hair: '#B5583B', skin: '#F2C9A0', shirt: '#4FA35A' },
    pitch: 520,
  },
  {
    x: 252,
    feet: 146,
    band: RIGHT_BAND,
    look: { hair: '#7A5A48', skin: '#E0AE84', shirt: '#D9483B' },
    pitch: 360,
  },
].map((person, i) => {
  const paths: Paths = [];
  const mad: Paths = [];
  sprite(paths, STANDING, personPalette(person.look), 0, 0, i >= 2);
  sprite(mad, STANDING_MAD, personPalette(person.look), 0, 0, i >= 2);
  return { ...person, paths, mad };
});

const HEIGHT = STANDING.length;

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

const BUBBLE_FILL: Record<Mood, string> = { talk: '#FFFFFF', mad: '#F9D7D2', ok: '#D6EFD5' };
const BUBBLE_TEXT: Record<Mood, string> = { talk: '#2A2238', mad: '#8A1F16', ok: '#1F5A28' };

/** Capa animada sobre la oficina: personitas que platican, discuten y se ponen de acuerdo. */
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
  const speaker = line && line[0] >= 0 ? PEOPLE[line[0]] : undefined;
  const heated = line?.[2] === 'mad';

  let bubble = null;
  if (line && speaker) {
    const [, text, mood] = line;
    const width = Math.ceil(text.length * 3.2) + 6;
    // El globo se abre hacia la izquierda para no quedar bajo el formulario.
    // Centrado sobre la cabeza, pero sin salir de su franja visible.
    const [min, max] = speaker.band;
    const x = Math.round(Math.min(Math.max(speaker.x + 8 - width / 2, min), max - width));
    const y = speaker.feet - HEIGHT - 13;
    bubble = (
      <g className="office-bubble" key={step}>
        <rect x={x} y={y} width={width} height={9} fill="#2A2238" />
        <rect x={x + 1} y={y + 1} width={width - 2} height={7} fill={BUBBLE_FILL[mood]} />
        <rect x={speaker.x + 7} y={y + 9} width={2} height={2} fill="#2A2238" />
        <text
          x={x + width / 2}
          y={y + 6.2}
          textAnchor="middle"
          fontSize={4}
          fill={BUBBLE_TEXT[mood]}
          className="office-bubble-text"
        >
          {text}
        </text>
      </g>
    );
  }

  return (
    <svg
      className="office-svg"
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {PEOPLE.map((person, i) => {
        const mood =
          person === speaker ? line?.[2] : heated && (i === 1 || i === 2) ? 'mad' : undefined;
        return (
          <g key={i} transform={`translate(${person.x} ${person.feet - HEIGHT})`}>
            <g className="office-person" data-mood={mood}>
              {(mood === 'mad' ? person.mad : person.paths).map(([color, d], j) => (
                <path key={j} fill={color} d={d} />
              ))}
            </g>
          </g>
        );
      })}
      {bubble}
    </svg>
  );
}
