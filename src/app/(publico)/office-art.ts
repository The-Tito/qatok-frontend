// Arte pixel de la oficina de Entrar y Crear cuenta. Todo en unidades de una escena de
// 320×180 px: cada unidad es un "pixel" del dibujo y el SVG se escala para llenar la pantalla.

export const SCENE_W = 320;
export const SCENE_H = 180;

/**
 * Capas en orden de dibujo: [color, trazo]. Los rectángulos seguidos del mismo color se unen en
 * un solo trazo, así el SVG tiene pocos elementos aunque el dibujo tenga cientos de pixeles.
 */
export type Paths = [string, string][];

export const INK = '#2A2238';

/** Suma un rectángulo a la capa de su color. */
export function rect(paths: Paths, color: string, x: number, y: number, w: number, h: number) {
  const d = `M${x} ${y}h${w}v${h}h${-w}z`;
  const last = paths[paths.length - 1];
  if (last && last[0] === color) last[1] += d;
  else paths.push([color, d]);
}

/**
 * Dibuja un mapa de caracteres (una fila por texto) en (x, y). Cada carácter es un color de
 * `palette`; el punto es transparente. Las corridas del mismo color se unen en un rectángulo.
 */
export function sprite(
  paths: Paths,
  map: readonly string[],
  palette: Record<string, string>,
  x: number,
  y: number,
  flip = false,
) {
  // Los colores de un sprite no se tapan entre sí: se agrupan para dar un trazo por color.
  const byColor = new Map<string, string>();
  map.forEach((row, dy) => {
    const cells = flip ? [...row].reverse() : [...row];
    let start = 0;
    for (let i = 1; i <= cells.length; i += 1) {
      if (i === cells.length || cells[i] !== cells[start]) {
        const color = palette[cells[start] ?? '.'];
        if (color) {
          const d = `M${x + start} ${y + dy}h${i - start}v1h${start - i}z`;
          byColor.set(color, (byColor.get(color) ?? '') + d);
        }
        start = i;
      }
    }
  });
  for (const [color, d] of byColor) paths.push([color, d]);
}

// Personitas: la misma cabeza y hombros que sprites/student.svg, student-back.svg e
// interlocutor.svg (16 px de ancho), con el cuerpo extendido hacia abajo.
// o tinta · h pelo · H brillo del pelo · s piel · d sombra de piel · w blanco · c mejillas
// n nariz · t camisa · T sombra de camisa · p pantalón · k zapatos.
const HEAD_FRONT = [
  '.....oooooo.....',
  '...oohhhhhhoo...',
  '..ohhhHHHhhhho..',
  '..ohHHhhhhhhho..',
  '..ohhsssssshho..',
  '..ohssssssssho..',
  '..osswosswosso..',
  '..ossoossoosso..',
  '..oscssnnsscso..',
  '..oodssssssdoo..',
  '....ooddddoo....',
  '..otttwwwwttto..',
  '.oTTtttwwtttTTo.',
  '.oTTttttttttTTo.',
  '.oTTttttttttTTo.',
] as const;

/** Cara enojada (cejas y boca de interlocutor.svg) para la discusión. */
const FACE_MAD = [
  '..ohhsssssshho..',
  '..ohsossssosho..',
  '..ohssossossho..',
  '..ohsoossoosho..',
  '..ohsssoosssho..',
  '..ooosossosooo..',
] as const;

const HEAD_BACK = [
  '.....oooooo.....',
  '...oohhhhhhoo...',
  '..ohhhHHHhhhho..',
  '..ohHHhhhhhhho..',
  '..ohHHhhhHHhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '....ooddddoo....',
  '..otttttttttto..',
  '.oTTtttTTtttTTo.',
  '.oTTtttTTtttTTo.',
  '.oTTtttTTtttTTo.',
] as const;

const LEGS = [
  '.oTTttttttttTTo.',
  '.ossttttttttsso.',
  '..ooppppppppoo..',
  '...oppppppppo...',
  '...opppoopppo...',
  '...oppo..oppo...',
  '...oppo..oppo...',
  '...oppo..oppo...',
  '..okkko..okkko..',
  '..ooooo..ooooo..',
] as const;

/** Persona de pie, 16×25. */
export const STANDING: readonly string[] = [...HEAD_FRONT, ...LEGS];

/** La misma persona con la cara de discusión. */
export const STANDING_MAD: readonly string[] = [
  ...HEAD_FRONT.slice(0, 4),
  ...FACE_MAD,
  ...HEAD_FRONT.slice(10),
  ...LEGS,
];

/** Persona sentada de frente (detrás del escritorio solo se ven cabeza y hombros). */
const SEATED_FRONT = HEAD_FRONT;

/** Persona sentada de espaldas. */
const SEATED_BACK = HEAD_BACK;

const PLANT = [
  '..g.g...',
  '.gggGg..',
  'gGgggGg.',
  '.gggggg.',
  'gGggGgg.',
  '.ggGgg..',
  '..oooo..',
  '..oooo..',
  '...oo...',
] as const;

export interface Look {
  hair: string;
  skin: string;
  shirt: string;
  pants?: string;
}

/** Mezcla dos colores #RRGGBB: t = 0 da a, t = 1 da b. */
function mix(a: string, b: string, t: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2]
    .map((i) => Math.round(channel(a, i) * (1 - t) + channel(b, i) * t))
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

export function personPalette(look: Look): Record<string, string> {
  return {
    o: INK,
    h: look.hair,
    H: mix(look.hair, '#FFFFFF', 0.25),
    s: look.skin,
    d: mix(look.skin, INK, 0.15),
    w: '#FFFFFF',
    c: '#E89A8A',
    n: '#B0705A',
    t: look.shirt,
    T: mix(look.shirt, INK, 0.28),
    p: look.pants ?? '#3B3150',
    k: '#6B5A7E',
  };
}

const C = {
  wall: '#EFE7D6',
  wallDark: '#E2D6BE',
  trim: '#C9B79A',
  base: '#7A5A48',
  floor: '#C48F5F',
  plank: '#AE7A4D',
  plankLight: '#CF9D6E',
  carpet: '#6F80A6',
  carpetEdge: '#56678C',
  carpetDot: '#7D8EB3',
  deskTop: '#E4C59D',
  deskFront: '#A97D55',
  deskShade: '#8E6744',
  monitor: '#3B3150',
  monitorBack: '#5A5070',
  screen: '#163B2A',
  code: '#5FD27A',
  code2: '#B497E6',
  code3: '#E8A33D',
  chair: '#4A4458',
  chairDark: '#35303F',
  glass: '#BFE3F2',
  glassLight: '#E1F3FA',
  city: '#9DBFD3',
  white: '#FFFFFF',
  paper: '#F6F1E4',
  key: '#D4CEC4',
  leaf: '#4FA35A',
  leafDark: '#2F7A3C',
  pot: '#B5583B',
  red: '#D9483B',
  purple: '#8A5CC7',
  orange: '#E8A33D',
  green: '#4FA35A',
  tile: '#E7E2D8',
  tileDark: '#D3CCBF',
} as const;

const plantPalette = { g: C.leaf, G: C.leafDark, o: C.pot };

/** Compañeros que trabajan en los escritorios: [x, y, de frente, aspecto]. */
const WORKERS: ReadonlyArray<readonly [number, number, boolean, Look]> = [
  [12, 62, true, { hair: '#4A3328', skin: '#F2C9A0', shirt: '#4FA35A' }],
  [56, 62, true, { hair: '#2A2238', skin: '#C68A5E', shirt: '#E8A33D' }],
  [12, 100, false, { hair: '#B5583B', skin: '#F2C9A0', shirt: '#8A5CC7' }],
  [56, 100, false, { hair: '#7A5A48', skin: '#E0AE84', shirt: '#D9483B' }],
  [228, 62, true, { hair: '#2A2238', skin: '#A8714A', shirt: '#D9483B' }],
  [272, 62, true, { hair: '#E8C170', skin: '#F2C9A0', shirt: '#5A86C8' }],
  [228, 100, false, { hair: '#4A3328', skin: '#E0AE84', shirt: '#E8A33D' }],
  [272, 100, false, { hair: '#2A2238', skin: '#C68A5E', shirt: '#4FA35A' }],
];

function wall(p: Paths) {
  rect(p, C.wall, 0, 0, SCENE_W, 40);
  rect(p, C.trim, 0, 0, SCENE_W, 2);
  for (let x = 0; x < SCENE_W; x += 16) rect(p, C.wallDark, x, 2, 1, 36);
  rect(p, C.base, 0, 38, SCENE_W, 3);
  rect(p, INK, 0, 41, SCENE_W, 1);

  for (const x of [8, 44, 240, 276]) {
    rect(p, INK, x, 6, 32, 24);
    rect(p, C.glass, x + 2, 8, 28, 20);
    rect(p, C.glassLight, x + 2, 8, 28, 6);
    // Edificios de la ciudad al fondo.
    rect(p, C.city, x + 3, 18, 6, 10);
    rect(p, C.city, x + 11, 14, 5, 14);
    rect(p, C.city, x + 19, 20, 9, 8);
    rect(p, INK, x + 15, 8, 2, 20);
    rect(p, C.trim, x - 1, 30, 34, 2);
  }

  // Pizarrón con diagramas.
  rect(p, INK, 86, 8, 40, 24);
  rect(p, C.white, 88, 10, 36, 20);
  rect(p, C.purple, 91, 13, 8, 4);
  rect(p, C.green, 104, 13, 8, 4);
  rect(p, INK, 99, 15, 5, 1);
  rect(p, C.orange, 113, 21, 8, 4);
  rect(p, INK, 108, 17, 1, 6);
  rect(p, INK, 108, 22, 5, 1);
  rect(p, C.red, 91, 22, 12, 1);
  rect(p, C.red, 91, 25, 9, 1);
  rect(p, C.trim, 86, 32, 40, 2);

  // Reloj.
  rect(p, INK, 157, 8, 8, 8);
  rect(p, C.white, 158, 9, 6, 6);
  rect(p, INK, 161, 10, 1, 3);
  rect(p, INK, 161, 12, 2, 1);

  // Tablero de tareas con notas.
  rect(p, INK, 194, 8, 36, 24);
  rect(p, '#D9B98C', 196, 10, 32, 20);
  const notes = [C.orange, C.green, C.purple, C.red, C.orange, C.green];
  notes.forEach((color, i) => rect(p, color, 198 + (i % 3) * 10, 12 + Math.floor(i / 3) * 9, 8, 7));
}

function floor(p: Paths) {
  rect(p, C.floor, 0, 42, SCENE_W, SCENE_H - 42);
  for (let y = 42; y < SCENE_H; y += 6) {
    rect(p, C.plank, 0, y + 5, SCENE_W, 1);
    const offset = ((y / 6) % 3) * 13;
    for (let x = offset; x < SCENE_W; x += 40) rect(p, C.plank, x, y, 1, 5);
  }
  for (let y = 42; y < SCENE_H; y += 6) {
    const offset = ((y / 6) % 3) * 13;
    for (let x = offset + 20; x < SCENE_W; x += 40) rect(p, C.plankLight, x, y, 6, 1);
  }

  // Alfombra al centro (queda bajo el formulario).
  rect(p, C.carpetEdge, 104, 50, 112, 124);
  rect(p, C.carpet, 107, 53, 106, 118);
  for (let y = 58; y < 168; y += 8) {
    for (let x = 112; x < 210; x += 8) rect(p, C.carpetDot, x, y, 2, 2);
  }

  // Cocina con baldosas abajo a la izquierda.
  rect(p, C.tileDark, 0, 142, 40, SCENE_H - 142);
  for (let y = 142; y < SCENE_H; y += 6) {
    for (let x = ((y - 142) / 6) % 2 ? 0 : 6; x < 40; x += 12) rect(p, C.tile, x, y, 6, 6);
  }
}

function workstation(p: Paths, x: number, y: number, front: boolean, look: Look, i: number) {
  const palette = personPalette(look);
  if (front) {
    // Silla y persona detrás del escritorio; monitor de espaldas a un lado.
    rect(p, C.chairDark, x + 10, y - 15, 18, 15);
    rect(p, C.chair, x + 11, y - 14, 16, 13);
    sprite(p, SEATED_FRONT, palette, x + 11, y - 14);
    rect(p, C.deskShade, x, y, 38, 1);
    rect(p, C.deskTop, x, y + 1, 38, 8);
    rect(p, C.monitorBack, x + 28, y - 8, 9, 9);
    rect(p, INK, x + 31, y + 1, 2, 2);
    rect(p, C.key, x + 13, y + 3, 12, 2);
    rect(p, C.paper, x + 2, y + 3, 7, 4);
    rect(p, i % 2 ? C.red : C.white, x + 3, y + 2, 2, 2);
  } else {
    // Persona de espaldas: se ve su pantalla con código.
    rect(p, C.deskShade, x, y, 38, 1);
    rect(p, C.deskTop, x, y + 1, 38, 8);
    rect(p, INK, x + 12, y - 11, 14, 11);
    rect(p, C.screen, x + 13, y - 10, 12, 8);
    rect(p, C.code, x + 14, y - 9, 6, 1);
    rect(p, C.code2, x + 15, y - 7, 8, 1);
    rect(p, C.code, x + 15, y - 5, 5, 1);
    rect(p, C.code3, x + 14, y - 3, 7, 1);
    rect(p, INK, x + 18, y, 2, 2);
    rect(p, i % 2 ? C.orange : C.purple, x + 31, y + 2, 3, 3);
  }
  rect(p, C.deskFront, x, y + 9, 38, 5);
  rect(p, INK, x, y + 14, 38, 1);
  rect(p, INK, x + 1, y + 15, 2, 7);
  rect(p, INK, x + 35, y + 15, 2, 7);
  if (!front) {
    sprite(p, SEATED_BACK, palette, x + 11, y + 6);
    rect(p, C.chairDark, x + 10, y + 19, 18, 4);
    rect(p, C.chair, x + 11, y + 19, 16, 2);
  }
}

function furniture(p: Paths) {
  // Máquina de café y barra.
  rect(p, INK, 2, 128, 34, 14);
  rect(p, '#D8CFC0', 3, 129, 32, 12);
  rect(p, INK, 6, 119, 10, 10);
  rect(p, C.red, 7, 120, 8, 6);
  rect(p, INK, 9, 126, 4, 2);
  rect(p, C.white, 22, 124, 4, 5);
  rect(p, C.white, 28, 124, 4, 5);

  // Máquina de bebidas.
  rect(p, INK, 300, 112, 18, 34);
  rect(p, C.red, 301, 113, 16, 32);
  rect(p, C.glassLight, 303, 116, 9, 18);
  for (const [i, color] of [C.orange, C.green, C.purple, C.white].entries()) {
    rect(p, color, 304 + (i % 2) * 4, 118 + Math.floor(i / 2) * 7, 3, 5);
  }
  rect(p, INK, 304, 138, 10, 3);

  // Rack de servidores.
  rect(p, INK, 300, 24, 16, 40);
  rect(p, '#4A4458', 301, 25, 14, 38);
  for (let y = 27; y < 60; y += 6) rect(p, '#35303F', 302, y, 12, 4);

  // Sillón y librero abajo a la derecha.
  rect(p, INK, 236, 152, 52, 20);
  rect(p, C.purple, 237, 153, 50, 7);
  rect(p, '#A47FD6', 239, 160, 46, 10);
  rect(p, C.purple, 237, 160, 3, 11);
  rect(p, C.purple, 284, 160, 3, 11);
  rect(p, INK, 238, 172, 3, 3);
  rect(p, INK, 283, 172, 3, 3);

  // Mesa de café con laptop.
  rect(p, INK, 274, 134, 22, 10);
  rect(p, C.deskTop, 275, 135, 20, 6);
  rect(p, C.monitorBack, 280, 131, 9, 5);

  // Bote de basura y garrafón.
  rect(p, INK, 206, 134, 9, 20);
  rect(p, C.glass, 207, 135, 7, 8);
  rect(p, C.white, 207, 143, 7, 10);

  // Plantas.
  for (const [x, y] of [
    [96, 32],
    [218, 32],
    [96, 158],
    [210, 158],
    [290, 150],
    [140, 34],
  ] as const) {
    sprite(p, PLANT, plantPalette, x, y);
  }
}

/** Arte fijo de la oficina, como capas de color listas para <path>. */
export function drawOffice(): {
  paths: Paths;
  workers: { x: number; y: number; front: boolean }[];
} {
  const paths: Paths = [];
  wall(paths);
  floor(paths);
  furniture(paths);
  WORKERS.forEach(([x, y, front, look], i) => workstation(paths, x, y, front, look, i));
  return { paths, workers: WORKERS.map(([x, y, front]) => ({ x, y, front })) };
}

/** Escena ancha (400×100; en cajas angostas se recortan los lados) detrás del personaje en la simulación y al jugar. */
export const ROOM_W = 400;
export const ROOM_H = 100;
export const ROOM_FLOOR_Y = 68;

/**
 * Cuarto de oficina: pared del color del tipo de habilidad (var(--type-tint)), ventanas,
 * tablero, escritorio con monitor y planta. Las capas usan colores CSS, así que pueden ir
 * en `style.fill`.
 */
export function drawRoom(): Paths {
  const p: Paths = [];
  rect(p, 'var(--type-tint)', 0, 0, ROOM_W, ROOM_FLOOR_Y);
  for (let x = 6; x < ROOM_W; x += 12) rect(p, 'rgb(42 34 56 / 6%)', x, 0, 1, ROOM_FLOOR_Y - 3);
  rect(p, C.base, 0, ROOM_FLOOR_Y - 3, ROOM_W, 3);
  rect(p, INK, 0, ROOM_FLOOR_Y, ROOM_W, 1);

  // Piso de duela.
  rect(p, C.floor, 0, ROOM_FLOOR_Y + 1, ROOM_W, ROOM_H - ROOM_FLOOR_Y - 1);
  for (let y = ROOM_FLOOR_Y + 1, row = 0; y < ROOM_H; y += 6, row += 1) {
    rect(p, C.plank, 0, y + 5, ROOM_W, 1);
    for (let x = (row % 3) * 13; x < ROOM_W; x += 40) rect(p, C.plank, x, y, 1, 5);
  }
  for (let y = ROOM_FLOOR_Y + 1, row = 0; y < ROOM_H; y += 6, row += 1) {
    for (let x = (row % 3) * 13 + 20; x < ROOM_W; x += 40) rect(p, C.plankLight, x, y, 6, 1);
  }

  // Ventanas con la ciudad.
  for (const x of [128, 240]) {
    rect(p, INK, x, 10, 32, 26);
    rect(p, C.glass, x + 2, 12, 28, 22);
    rect(p, C.glassLight, x + 2, 12, 28, 7);
    rect(p, C.city, x + 3, 22, 6, 12);
    rect(p, C.city, x + 11, 18, 5, 16);
    rect(p, C.city, x + 19, 25, 9, 9);
    rect(p, INK, x + 15, 12, 2, 22);
    rect(p, C.trim, x - 1, 36, 34, 2);
  }

  // Tablero con notas y reloj.
  rect(p, INK, 80, 12, 28, 20);
  rect(p, '#D9B98C', 82, 14, 24, 16);
  [C.orange, C.green, C.purple, C.red].forEach((color, i) =>
    rect(p, color, 84 + (i % 2) * 11, 16 + Math.floor(i / 2) * 7, 9, 5),
  );
  rect(p, INK, 296, 12, 8, 8);
  rect(p, C.white, 297, 13, 6, 6);
  rect(p, INK, 300, 14, 1, 3);
  rect(p, INK, 300, 16, 2, 1);

  // Escritorios con monitor a los lados.
  for (const x of [24, 330]) {
    rect(p, INK, x, 48, 42, 1);
    rect(p, C.deskTop, x, 49, 42, 7);
    rect(p, C.deskFront, x, 56, 42, 5);
    rect(p, INK, x, 61, 42, 1);
    rect(p, INK, x + 2, 62, 2, 7);
    rect(p, INK, x + 38, 62, 2, 7);
    rect(p, INK, x + 12, 36, 16, 12);
    rect(p, C.screen, x + 13, 37, 14, 9);
    rect(p, C.code, x + 14, 38, 7, 1);
    rect(p, C.code2, x + 15, 40, 9, 1);
    rect(p, C.code3, x + 14, 42, 6, 1);
    rect(p, INK, x + 19, 48, 2, 1);
    rect(p, C.white, x + 32, 45, 4, 4);
  }

  // Planta a la derecha.
  sprite(p, PLANT, plantPalette, 112, 59);
  sprite(p, PLANT, plantPalette, 380, 59);
  return p;
}
