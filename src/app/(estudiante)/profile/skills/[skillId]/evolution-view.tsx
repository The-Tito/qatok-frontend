'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '../../../../../components/PageHeader';
import { LoadingCard, StateCard } from '../../../../../components/StateCard';
import { getProfile, getSkillEvolution, isApiError } from '../../../../../lib/api';
import { MOBILE_CHART, chartY, markPath, stepPath } from '../../../../../lib/evolution';
import { formatDate } from '../../../../../lib/format';
import { SKILL_TYPES, skillType } from '../../../../../lib/skill-types';

const formatLevel = (n: number) => String(Math.round(n * 10) / 10);
const CLASSIFICATION = {
  STRENGTH: '▲ Fortaleza',
  AREA_FOR_IMPROVEMENT: '▼ Área de mejora',
  NO_REFERENCE: '',
} as const;

/** P3 · Evolución de una habilidad (C-05): gráfica de escalones y partidas que cuentan. */
export function EvolutionView({ skillId }: { skillId: string }) {
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => getProfile(signal),
  });
  const evolution = useQuery({
    queryKey: ['evolution', skillId],
    queryFn: ({ signal }) => getSkillEvolution(skillId, signal),
  });

  const header = (
    <PageHeader
      title="Evolución"
      eyebrow="Evolución de una habilidad"
      back={{ href: '/profile', label: 'Perfil' }}
    />
  );

  if (evolution.isError) {
    return (
      <div className="evolution">
        {header}
        {isApiError(evolution.error, 'NOT_FOUND', 'VALIDATION_ERROR') ? (
          <StateCard
            kind="not-found"
            title="No encontramos esta habilidad"
            message="Puede que ya no exista."
            action={{ label: 'Volver al perfil', href: '/profile' }}
          />
        ) : (
          <StateCard
            kind="error"
            title="No pudimos cargar esta pantalla"
            message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
            action={{ label: 'Reintentar', onClick: () => void evolution.refetch() }}
          />
        )}
      </div>
    );
  }
  if (!evolution.data || profile.isPending) {
    return (
      <div className="evolution">
        {header}
        <LoadingCard />
      </div>
    );
  }

  const skills = profile.data?.skills ?? [];
  const skill = skills.find((item) => item.id === skillId);
  const type = skillType(skillId);
  const name = skill?.name ?? evolution.data.points[0]?.simulation.title ?? 'Habilidad';
  const target = skill?.target ?? null;
  const points = evolution.data.points;
  const scores = points.map((point) => point.score);
  const level = evolution.data.current_level;
  const box = MOBILE_CHART;
  const aria =
    points.length === 0
      ? `Sin partidas que cuenten para ${name}.`
      : `Puntuaciones de ${name}: ${scores.map(formatLevel).join(', ')}.${target === null ? '' : ` Objetivo ${formatLevel(target)}.`}`;

  return (
    <div className="evolution" data-type={type}>
      {header}
      <div className="evolution-body">
        {skills.length > 1 ? (
          <nav className="evolution-skills" aria-label="Habilidad">
            {skills.map((item) => (
              <Link
                key={item.id}
                href={`/profile/skills/${item.id}`}
                className="filter-chip evolution-chip"
                data-type={skillType(item)}
                aria-current={item.id === skillId ? 'page' : undefined}
              >
                {SKILL_TYPES[skillType(item)].label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="evolution-layout">
          <section className="evolution-card panel" aria-labelledby="evolucion-nombre">
            <div className="profile-card-bar">
              <span>Tipo {SKILL_TYPES[type].label}</span>
              <span>{skill ? CLASSIFICATION[skill.classification] : ''}</span>
            </div>
            <div className="evolution-summary">
              <span className="evolution-name-block">
                <h2 id="evolucion-nombre" className="evolution-name">
                  {name}
                </h2>
                <span className="evolution-target">
                  {target === null ? 'Sin objetivo' : `Objetivo ${formatLevel(target)}`}
                </span>
              </span>
              <span className="evolution-level">
                <span className="evolution-level-value">
                  {level === null ? '—' : formatLevel(level)}
                </span>
                <span className="evolution-level-label">Nivel actual</span>
              </span>
            </div>
            <div className="evolution-chart">
              <svg
                role="img"
                aria-label={aria}
                viewBox={`0 0 ${box.width} ${box.height}`}
                className="evolution-svg"
              >
                <rect
                  x={box.left}
                  y={box.top}
                  width={box.right - box.left}
                  height={box.bottom - box.top}
                  fill="var(--color-fill)"
                />
                <path
                  d={[25, 50, 75]
                    .map((v) => `M${box.left} ${chartY(box, v)}H${box.right}`)
                    .join(' ')}
                  stroke="var(--color-line-soft)"
                  strokeWidth={2}
                  fill="none"
                />
                <path
                  d={`M${box.left} ${box.top}V${box.bottom}H${box.right}`}
                  stroke="var(--color-ink)"
                  strokeWidth={3}
                  fill="none"
                />
                {[0, 50, 100].map((v) => (
                  <text
                    key={v}
                    x={box.left - 6}
                    y={chartY(box, v) + 4}
                    textAnchor="end"
                    className="evolution-axis"
                  >
                    {v}
                  </text>
                ))}
                {target === null ? null : (
                  <>
                    <path
                      d={`M${box.left} ${chartY(box, target)}H${box.right}`}
                      stroke="var(--color-ink)"
                      strokeWidth={3}
                      strokeDasharray="8 6"
                      fill="none"
                    />
                    <text
                      x={box.right - 4}
                      y={chartY(box, target) - 6}
                      textAnchor="end"
                      className="evolution-target-label"
                    >
                      OBJETIVO {formatLevel(target)}
                    </text>
                  </>
                )}
                {scores.length > 0 ? (
                  <>
                    <path
                      d={stepPath(box, scores)}
                      stroke="var(--type-base)"
                      strokeWidth={6}
                      fill="none"
                    />
                    <path
                      d={markPath(box, scores)}
                      fill="var(--type-dark)"
                      stroke="var(--color-ink)"
                      strokeWidth={2}
                    />
                  </>
                ) : null}
              </svg>
            </div>
          </section>

          <section className="evolution-points" aria-labelledby="partidas-cuentan">
            <h2 id="partidas-cuentan" className="profile-heading">
              Partidas que cuentan
            </h2>
            {points.length === 0 ? (
              <p className="profile-empty">
                Aún no completas simulaciones que entrenen esta habilidad.{' '}
                <Link href="/simulations">Ir al catálogo</Link>
              </p>
            ) : (
              <ol className="evolution-list">
                {points.map((point, index) => (
                  <li key={`${point.simulation.id}-${index}`}>
                    <span className="evolution-point-text">
                      <span className="evolution-point-title">{point.simulation.title}</span>
                      <span className="evolution-point-meta">
                        {formatDate(point.finished_at)} · peso {point.weight}
                      </span>
                    </span>
                    <span className="evolution-point-score">{formatLevel(point.score)}</span>
                  </li>
                ))}
              </ol>
            )}
            <p className="account-note">
              Tu nivel combina la última partida completada de cada simulación que entrena esta
              habilidad.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
