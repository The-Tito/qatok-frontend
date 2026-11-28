import {
  drawOffice,
  INK,
  personPalette,
  SCENE_H,
  SCENE_W,
  sprite,
  STANDING,
  type Paths,
} from './office-art';

const office = drawOffice();

// Compañera que camina por el pasillo con papeles.
const walker: Paths = [];
sprite(
  walker,
  STANDING,
  personPalette({ hair: '#B5583B', skin: '#E0AE84', shirt: '#5A86C8' }),
  0,
  0,
);

/** Fondo fijo de la oficina (se dibuja en el servidor; solo se animan detalles con CSS). */
export function OfficeBackdrop() {
  return (
    <svg
      className="office-svg"
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {office.paths.map(([color, d], i) => (
        <path key={i} fill={color} d={d} />
      ))}
      {office.workers.map(({ x, y, front }, i) =>
        front ? (
          <g key={i} className="office-typing" style={{ animationDelay: `${-i * 0.17}s` }}>
            <rect x={x + 14} y={y + 2} width={3} height={2} fill="#F2C9A0" />
            <rect x={x + 21} y={y + 2} width={3} height={2} fill="#F2C9A0" />
          </g>
        ) : (
          <rect
            key={i}
            className="office-cursor"
            x={x + 21}
            y={y - 5}
            width={2}
            height={1}
            fill="#5FD27A"
            style={{ animationDelay: `${-i * 0.3}s` }}
          />
        ),
      )}
      {[27, 33, 39, 45, 51, 57].map((y, i) => (
        <rect
          key={y}
          className="office-led"
          x={i % 2 ? 311 : 312}
          y={y + 1}
          width={2}
          height={1}
          fill={i % 3 ? '#5FD27A' : '#E8A33D'}
          style={{ animationDelay: `${-i * 0.23}s` }}
        />
      ))}
      <g className="office-walker" transform="translate(100 123)">
        <g className="office-walker-body">
          {walker.map(([color, d], i) => (
            <path key={i} fill={color} d={d} />
          ))}
          <rect x={11} y={14} width={5} height={4} fill="#F6F1E4" stroke={INK} strokeWidth={0.5} />
        </g>
      </g>
    </svg>
  );
}
