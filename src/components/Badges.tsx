import { SKILL_TYPES, type SkillTypeKey } from '../lib/skill-types';

/** Chip del tipo (tint con texto dark). Muestra el nombre de la habilidad o del tipo y, opcional, el peso. */
export function TypeChip({
  type,
  label,
  weight,
}: {
  type: SkillTypeKey;
  /** Nombre de la habilidad. Sin él se muestra el nombre del tipo. */
  label?: string;
  /** Peso entre 0 y 1; se muestra en %. */
  weight?: number;
}) {
  return (
    <span className="chip" data-type={type}>
      {label ?? SKILL_TYPES[type].label}
      {weight !== undefined ? ` · ${Math.round(weight * 100)}%` : null}
    </span>
  );
}

/** Chip neutro (relleno suave), para filtros o datos sin tipo. */
export function Chip({ children, selected }: { children: React.ReactNode; selected?: boolean }) {
  return (
    <span className="chip" data-neutral="" data-selected={selected || undefined}>
      {children}
    </span>
  );
}

export type FeedbackResult = 'CORRECT' | 'PARTIAL' | 'INCORRECT';

const feedback: Record<FeedbackResult, { icon: string; label: string }> = {
  CORRECT: { icon: '★', label: 'Acierto' },
  PARTIAL: { icon: '◆', label: 'Parcial' },
  INCORRECT: { icon: '✕', label: 'Error' },
};

/** ★ Acierto / ◆ Parcial / ✕ Error con los colores de retroalimentación. */
export function FeedbackBadge({ result }: { result: FeedbackResult }) {
  const { icon, label } = feedback[result];
  return (
    <span className="badge" data-result={result}>
      <span aria-hidden="true">{icon}</span> {label}
    </span>
  );
}

export type Impact = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

const impacts: Record<Impact, { icon: string; label: string }> = {
  POSITIVE: { icon: '▲', label: 'Positiva' },
  NEUTRAL: { icon: '■', label: 'Neutra' },
  NEGATIVE: { icon: '▼', label: 'Negativa' },
};

/** ▲ Positiva / ■ Neutra / ▼ Negativa (impacto de una consecuencia). */
export function ImpactBadge({ impact }: { impact: Impact }) {
  const { icon, label } = impacts[impact];
  return (
    <span className="badge" data-impact={impact}>
      <span aria-hidden="true">{icon}</span> {label}
    </span>
  );
}

export type Classification = 'STRENGTH' | 'AREA_FOR_IMPROVEMENT';

/** ▲ Fortaleza / ▼ Área de mejora (perfil). NO_REFERENCE no lleva etiqueta. */
export function ClassificationBadge({ classification }: { classification: Classification }) {
  const strength = classification === 'STRENGTH';
  return (
    <span className="badge" data-classification={classification}>
      <span aria-hidden="true">{strength ? '▲' : '▼'}</span>{' '}
      {strength ? 'Fortaleza' : 'Área de mejora'}
    </span>
  );
}
