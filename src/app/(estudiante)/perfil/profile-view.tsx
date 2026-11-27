'use client';

import type { ProfileSkill } from '@qatok/shared';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ClassificationBadge } from '../../../components/Badges';
import { LevelBar } from '../../../components/LevelBar';
import { TypeStripe } from '../../../components/SimulationCard';
import { StudentSprite } from '../../../components/Sprites';
import { LoadingCard, StateCard } from '../../../components/StateCard';
import { SyncBanner } from '../../../components/SyncBanner';
import { getProfile } from '../../../lib/api';
import { formatDate, plural } from '../../../lib/format';
import { typedSkills } from '../../../lib/simulation';
import { SKILL_TYPES, skillType } from '../../../lib/skill-types';

/** Con sincronización pendiente: reconsultar cada 3 s, máximo 5 veces (03 · Sincronización). */
const POLL_MS = 3000;
const POLL_MAX = 5;

const formatLevel = (n: number) => String(Math.round(n * 10) / 10);

export function ProfileView() {
  const [polls, setPolls] = useState(0);
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => getProfile(signal),
    refetchInterval: (query) =>
      (query.state.data?.pending_sync_count ?? 0) > 0 && polls < POLL_MAX ? POLL_MS : false,
  });

  const pending = (profile.data?.pending_sync_count ?? 0) > 0;
  const updatedAt = profile.dataUpdatedAt;
  // Cuenta las consultas hechas mientras había pendientes, para dejar de sondear.
  useEffect(() => {
    if (pending && updatedAt) setPolls((count) => count + 1);
    if (!pending) setPolls(0);
  }, [pending, updatedAt]);

  if (profile.isError) {
    return (
      <StateCard
        kind="error"
        title="No pudimos cargar esta pantalla"
        message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
        action={{ label: 'Reintentar', onClick: () => void profile.refetch() }}
      />
    );
  }
  if (!profile.data) return <LoadingCard blocks={3} />;

  const data = profile.data;
  const graphGap = data.incomplete_data.includes('graph');
  const documentGap = data.incomplete_data.includes('document');
  const mainType = data.skills[0] ? skillType(data.skills[0].id) : 'CLOCK';

  return (
    <div className="profile">
      <aside className="profile-side">
        <section className="profile-card panel" aria-labelledby="perfil-nombre">
          <div className="profile-card-bar">
            <span>Tarjeta de habilidades</span>
            <Link href="/cuenta">Mi cuenta ▶</Link>
          </div>
          <div className="profile-card-body">
            <span className="profile-avatar" data-type={mainType}>
              <StudentSprite size={56} />
            </span>
            <div className="profile-card-info">
              <h1 id="perfil-nombre" className="profile-name">
                {data.user.name}
              </h1>
              <dl className="profile-stats">
                <div>
                  <dd>{data.summary.completed_attempts}</dd>
                  <dt>Completadas</dt>
                </div>
                <div>
                  <dd>{data.summary.evidence_count}</dd>
                  <dt>Evidencias</dt>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {pending ? (
          <SyncBanner
            slow={polls >= POLL_MAX}
            message={`${plural(data.pending_sync_count, 'cambio pendiente', 'cambios pendientes')}: lo guardado está a salvo.`}
          />
        ) : null}

        <section className="profile-section profile-more" aria-labelledby="mas-perfil">
          <h2 id="mas-perfil" className="profile-heading">
            Más de tu perfil
          </h2>
          <div className="profile-links">
            <Link href="/perfil/partidas">Mis partidas</Link>
            <Link href="/perfil/recomendaciones">Recomendaciones</Link>
            <Link
              href={
                data.skills[0] ? `/perfil/habilidades/${data.skills[0].id}` : '/perfil/partidas'
              }
            >
              Evolución
            </Link>
            <Link href="/cuenta">Mi cuenta</Link>
          </div>
        </section>
      </aside>

      <div className="profile-main">
        <section className="profile-section" aria-labelledby="habilidades">
          <h2 id="habilidades" className="profile-heading">
            Habilidades
          </h2>
          {graphGap ? (
            <DataGap text="Tus habilidades y recomendaciones aparecerán en cuanto vuelvan a estar disponibles." />
          ) : data.skills.length === 0 ? (
            <p className="profile-empty">
              Completa una simulación para ver tus habilidades.{' '}
              <Link href="/simulaciones">Ir al catálogo</Link>
            </p>
          ) : (
            <ul className="profile-skills">
              {data.skills.map((skill) => (
                <li key={skill.id}>
                  <SkillRow skill={skill} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="profile-pair">
          <section className="profile-section" aria-labelledby="recomendaciones">
            <div className="profile-heading-row">
              <h2 id="recomendaciones" className="profile-heading">
                Recomendaciones
              </h2>
              <Link href="/perfil/recomendaciones" className="profile-more-link">
                Ver todas ▶
              </Link>
            </div>
            {graphGap ? (
              <div className="profile-placeholder" />
            ) : data.recommendations.length === 0 ? (
              <p className="profile-empty">Sin recomendaciones por ahora.</p>
            ) : (
              <ul className="profile-list">
                {data.recommendations.slice(0, 5).map((item) => {
                  const skills = typedSkills(item.simulation.skills);
                  return (
                    <li key={item.simulation.id}>
                      <Link
                        href={`/simulaciones/${item.simulation.id}`}
                        className="reco-card panel"
                        data-type={skills[0]?.type ?? 'STONE'}
                      >
                        <TypeStripe skills={skills} />
                        <span className="reco-card-body">
                          <span className="reco-card-text">
                            <span className="reco-card-title">{item.simulation.title}</span>
                            {item.skills_to_improve.length > 0 ? (
                              <span className="reco-card-skills">
                                Refuerza: {item.skills_to_improve.join(', ')}
                              </span>
                            ) : null}
                          </span>
                          <span className="reco-card-action">Ver ▶</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="profile-section" aria-labelledby="evidencias-recientes">
            <div className="profile-heading-row">
              <h2 id="evidencias-recientes" className="profile-heading">
                Evidencias recientes
              </h2>
              <Link href="/evidencias" className="profile-more-link">
                Ver todas ▶
              </Link>
            </div>
            {data.recent_evidence.length === 0 ? (
              <p className="profile-empty">
                Aún no guardas evidencias. Al completar una simulación puedes guardarla.
              </p>
            ) : (
              <ul className="profile-list">
                {data.recent_evidence.slice(0, 5).map((evidence) => (
                  <li key={evidence.id}>
                    <Link href={`/evidencias/${evidence.id}`} className="evidence-row">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/sprites/trophy.svg" alt="" width={24} height={24} />
                      <span className="evidence-row-text">
                        <span className="evidence-row-title">{evidence.title}</span>
                        <span className="evidence-row-description">
                          {documentGap && !evidence.description
                            ? '◆ El resumen no cargó; la evidencia sigue guardada.'
                            : evidence.description}
                        </span>
                        <span className="evidence-row-meta">
                          {formatDate(evidence.generated_at)} ·{' '}
                          {evidence.visibility === 'PUBLIC' ? '◎ Pública' : '● Privada'}
                        </span>
                      </span>
                      <span className="evidence-row-arrow" aria-hidden="true">
                        ▶
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function DataGap({ text }: { text: string }) {
  return (
    <div className="data-gap" role="status">
      <span className="data-gap-title">◆ Parte de tu perfil no cargó</span>
      <span className="data-gap-text">{text}</span>
    </div>
  );
}

function SkillRow({ skill }: { skill: ProfileSkill }) {
  const type = skillType(skill);
  const value = formatLevel(skill.current_level);
  return (
    <Link href={`/perfil/habilidades/${skill.id}`} className="skill-row" data-type={type}>
      <span className="skill-row-head">
        <span className="skill-row-name">
          <span className="chip skill-row-chip" data-type={type}>
            {SKILL_TYPES[type].label}
          </span>
          {skill.name}
        </span>
        <span className="skill-row-value">
          {skill.target === null ? value : `${value}/${formatLevel(skill.target)}`}
        </span>
      </span>
      <LevelBar
        label={skill.name}
        value={skill.current_level}
        target={skill.target}
        type={type}
        compact
      />
      <span className="skill-row-foot">
        {skill.classification === 'NO_REFERENCE' ? (
          <span />
        ) : (
          <ClassificationBadge classification={skill.classification} />
        )}
        <span className="skill-row-more">Evolución ▶</span>
      </span>
      <span className="skill-row-counts">
        <span className="badge" data-result="CORRECT">
          ★ {plural(skill.correct, 'acierto')}
        </span>
        <span className="badge" data-result="PARTIAL">
          ◆ {plural(skill.partial, 'parcial', 'parciales')}
        </span>
        <span className="badge" data-result="INCORRECT">
          ✕ {plural(skill.incorrect, 'error', 'errores')}
        </span>
      </span>
    </Link>
  );
}
