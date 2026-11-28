import { InterlocutorSprite } from '../Sprites';

/**
 * Escena de la conversación: escritorio de atención en la oficina abierta. El interlocutor
 * está detrás del escritorio y el estudiante de espaldas en primer plano. Todo vive en un
 * solo SVG de 160×80, así la escena crece o se encoge con la tarjeta sin que nada se mueva
 * de su lugar. La pared toma el color del tipo de habilidad. Decorativo.
 */

const W = 160;
const H = 80;
const INK = '#2A2238';
const WOOD = '#8B5E3C';
const WOOD_DARK = '#6B4428';
const PANEL = '#A8743F';

type Layer = [fill: string, rects: string];

/** «x y w h, x y w h» → trazo SVG de rectángulos. */
function d(rects: string): string {
  return rects
    .split(',')
    .map((rect) => {
      const [x, y, w, h] = rect.trim().split(/\s+/);
      return `M${x} ${y}h${w}v${h}h-${w}z`;
    })
    .join('');
}

function Paths({ layers }: { layers: Layer[] }) {
  return (
    <>
      {layers.map(([fill, rects], index) => (
        <path key={index} style={{ fill }} d={d(rects)} />
      ))}
    </>
  );
}

const SEAMS =
  '0 55 160 1,0 64 160 1,0 73 160 1,20 47 1 8,60 47 1 8,100 47 1 8,140 47 1 8,40 56 1 8,80 56 1 8,120 56 1 8,10 65 1 8,50 65 1 8,90 65 1 8,130 65 1 8,30 74 1 6,70 74 1 6,110 74 1 6,150 74 1 6';

const ROOM: Layer[] = [
  ['var(--type-tint)', '0 0 160 47'],
  ['rgba(42,34,56,.07)', '0 38 160 8'],
  [INK, '0 46 160 1'],
  ['#C48F5F', '0 47 160 33'],
  ['#B07E50', SEAMS],
  // Ventana con ciudad
  [INK, '7 5 46 30'],
  ['#BFE3F2', '9 7 42 26'],
];

const CITY: Layer[] = [['#8FB3C9', '9 21 8 12,18 16 6 17,25 23 9 10,35 14 7 19,43 19 8 14']];

const CITY_LIGHTS: Layer[] = [
  ['#FFE680', '20 19 1 1,20 23 1 1,37 17 1 1,39 21 1 1,37 26 1 1,46 22 1 1'],
];

const WALL: Layer[] = [
  [INK, '29 7 2 26'],
  ['#FFFFFF', '6 34 48 2'],
  // Reloj
  [INK, '62 7 11 11'],
  ['#FFFFFF', '63 8 9 9'],
  // Corcho con notas
  [INK, '79 6 28 18'],
  ['#C9925A', '80 7 26 16'],
  ['#FFE680', '82 9 5 5'],
  ['#F9D7D2', '89 10 5 5'],
  ['#D6EFD5', '96 9 6 5'],
  ['#DCE6F6', '84 16 7 4'],
  ['#FBE3B5', '97 16 6 5'],
  // Librero
  [INK, '124 9 29 38'],
  [WOOD, '125 10 27 36'],
  [INK, '125 21 27 1,125 33 27 1'],
  ['#D9483B', '126 13 2 8,131 23 2 10'],
  ['#4FA35A', '128 14 2 7,127 35 3 10'],
  ['#E8A33D', '130 12 3 9,129 25 2 8'],
  ['#5A86C8', '133 14 2 7,126 24 3 9'],
  ['#8A5CC7', '135 13 2 8,130 36 2 9'],
  ['#2E7D3A', '143 14 6 7'],
  ['#F1E6CF', '138 27 11 6'],
  ['#F3F1EC', '140 35 3 10,144 35 3 10'],
  // Compañera al fondo: monitor y escritorio
  [INK, '70 26 14 10'],
  ['#3B3150', '71 27 12 8'],
  [INK, '76 36 2 3'],
  [WOOD, '60 39 32 3'],
  [INK, '61 42 1 5,90 42 1 5'],
];

const CODE: Layer[] = [['#8FD3F0', '72 28 7 1,72 30 9 1,72 32 5 1']];
const COWORKER: Layer[] = [
  ['#4A3328', '62 27 6 3'],
  ['#F2C9A0', '62 30 6 4,67 37 3 1'],
  ['#E8A33D', '61 34 8 5'],
];
const LAMP: Layer[] = [
  [INK, '113 0 1 5,108 5 11 3'],
  ['#FFE680', '110 8 7 1'],
  ['rgba(255,246,214,.12)', '104 9 19 30'],
];

/** Lo que queda delante del interlocutor: escritorio, monitor, papeles y taza. */
const DESK: Layer[] = [
  [INK, '84 51 76 1'],
  [WOOD, '84 52 76 4'],
  [WOOD_DARK, '84 56 76 2'],
  [PANEL, '86 58 72 22'],
  [WOOD_DARK, '86 66 72 1'],
  [INK, '92 40 16 11'],
  ['#3B3150', '93 41 14 9'],
  [INK, '99 51 2 1'],
  ['#FFFFFF', '122 49 12 3,144 46 5 5'],
  [INK, '122 51 12 1,144 51 5 1,149 47 1 3'],
];
const STEAM: Layer[] = [['rgba(255,255,255,.8)', '145 41 1 3,147 39 1 3']];
const POT: Layer[] = [
  [INK, '64 66 12 9'],
  ['#D9483B', '65 67 10 7'],
  ['#B5362B', '65 72 10 2'],
];
const LEAVES: Layer[] = [
  ['#2E7D3A', '65 56 3 9,72 57 3 8'],
  ['#4FA35A', '64 58 3 8,68 54 3 12,73 59 3 7,66 55 2 3'],
];

export function FrontDeskScene() {
  return (
    <svg
      className="front-desk"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="front-desk-window">
          <rect x={9} y={7} width={42} height={26} />
        </clipPath>
      </defs>
      <Paths layers={ROOM} />
      <g clipPath="url(#front-desk-window)">
        <path
          className="fd-cloud"
          style={{ fill: '#FFFFFF' }}
          d={d('4 11 10 3,6 10 5 1,26 15 8 2,28 14 4 1')}
        />
      </g>
      <Paths layers={CITY} />
      <g className="fd-lights">
        <Paths layers={CITY_LIGHTS} />
      </g>
      <Paths layers={WALL} />
      <path className="fd-hand" style={{ fill: INK }} d={d('67 9 1 4')} />
      <path style={{ fill: INK }} d={d('67 12 3 1')} />
      <g className="fd-code">
        <Paths layers={CODE} />
      </g>
      <g className="fd-typing">
        <Paths layers={COWORKER} />
      </g>
      <g className="fd-lamp">
        <Paths layers={LAMP} />
      </g>
      <g className="ctx-interlocutor">
        <InterlocutorSprite x={106} y={22} size={32} />
      </g>
      <Paths layers={DESK} />
      <g className="fd-steam">
        <Paths layers={STEAM} />
      </g>
      <Paths layers={POT} />
      <g className="fd-sway">
        <Paths layers={LEAVES} />
      </g>
      <image
        className="ctx-student"
        href="/sprites/student-back.svg"
        x={10}
        y={52}
        width={32}
        height={32}
      />
    </svg>
  );
}
