import { drawRoom, ROOM_H, ROOM_W } from '../app/(publico)/office-art';

const room = drawRoom();

/** Cuarto de oficina pixel art detrás del personaje (simulación y jugar). Decorativo. */
export function SceneBackdrop({ className }: { className?: string }) {
  return (
    <svg
      className={['scene-backdrop', className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${ROOM_W} ${ROOM_H}`}
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {room.map(([color, d], i) => (
        <path key={i} style={{ fill: color }} d={d} />
      ))}
      {/* Detalles vivos: código que avanza en el monitor y una nube que cruza la ventana. */}
      <rect className="scene-cursor" x={36} y={42} width={3} height={1} fill="#5FD27A" />
      <rect className="scene-cloud" x={130} y={14} width={8} height={3} fill="#FFFFFF" />
    </svg>
  );
}
