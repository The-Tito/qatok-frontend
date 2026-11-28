import type { SkillTypeKey } from '../lib/skill-types';

interface LevelBarProps {
  /** Nombre de la habilidad: etiqueta accesible y texto visible. */
  label: string;
  /** Nivel actual, 0 a 100. */
  value: number;
  /** Nivel objetivo, 0 a 100. Sin objetivo no hay marca. */
  target?: number | null;
  type: SkillTypeKey;
  /** Oculta la fila de nombre y valor (cuando ya se muestran aparte). */
  compact?: boolean;
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));
const format = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ''));

/** Barra de nivel segmentada (Main §06) con marca vertical del objetivo. */
export function LevelBar({ label, value, target, type, compact = false }: LevelBarProps) {
  const hasTarget = target !== null && target !== undefined;
  const text = hasTarget ? `${format(value)} / ${format(target)}` : format(value);
  return (
    <div className="level" data-type={type}>
      {compact ? null : (
        <div className="level-head">
          <span className="level-name">{label}</span>
          <span className="level-value">{text}</span>
        </div>
      )}
      <div
        className="level-bar"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={
          hasTarget ? `${format(value)} de 100, objetivo ${format(target)}` : undefined
        }
      >
        <div className="level-fill" style={{ width: `${clamp(value)}%` }} />
        {hasTarget ? <div className="level-target" style={{ left: `${clamp(target)}%` }} /> : null}
      </div>
    </div>
  );
}
