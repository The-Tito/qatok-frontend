'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FeedbackBadge, ImpactBadge } from '../../../../../components/Badges';
import { PageHeader } from '../../../../../components/PageHeader';
import { PixelButton } from '../../../../../components/PixelButton';
import { SaveEvidenceSheet } from '../../../../../components/SaveEvidenceSheet';
import { STEP_TYPES } from '../../../../../components/play/StepContext';
import { LoadingCard, StateCard } from '../../../../../components/StateCard';
import { getAttemptPath, getSimulation, isApiError, listEvidence } from '../../../../../lib/api';
import { ATTEMPT_STATUS, durationMinutes } from '../../../../../lib/attempts';
import { formatDate, plural } from '../../../../../lib/format';
import { typedSkills } from '../../../../../lib/simulation';

const formatScore = (n: number) => String(Math.round(n * 10) / 10);
const two = (n: number) => String(n).padStart(2, '0');

/** P2 · Recorrido de un intento (C-03). graph_pending es un aviso suave, no un error. */
export function PathView({ attemptId }: { attemptId: string }) {
  const [saving, setSaving] = useState(false);
  const path = useQuery({
    queryKey: ['path', attemptId],
    queryFn: ({ signal }) => getAttemptPath(attemptId, signal),
  });
  const simulationId = path.data?.attempt.simulation_id;
  const simulation = useQuery({
    queryKey: ['simulation', simulationId],
    queryFn: ({ signal }) => getSimulation(simulationId!, signal),
    enabled: Boolean(simulationId),
    retry: false,
  });
  // ¿Esta partida ya es una evidencia? Para «Ver su evidencia».
  const evidence = useQuery({
    queryKey: ['evidence', 'all'],
    queryFn: ({ signal }) => listEvidence({ limit: 100 }, signal),
  });

  const title = simulation.data?.title ?? 'Simulación';
  const header = (
    <PageHeader
      title={simulation.data ? title : 'Recorrido'}
      eyebrow="Recorrido de tu partida"
      back={{ href: '/profile/attempts', label: 'Mis partidas' }}
    />
  );

  if (path.isError) {
    return (
      <div className="recos">
        {header}
        {isApiError(path.error, 'NOT_FOUND', 'VALIDATION_ERROR') ? (
          <StateCard
            kind="not-found"
            title="No encontramos esta partida"
            message="Puede que el enlace esté mal o que la partida sea de otra cuenta."
            action={{ label: 'Ver mis partidas', href: '/profile/attempts' }}
          />
        ) : (
          <StateCard
            kind="error"
            title="No pudimos cargar esta pantalla"
            message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
            action={{ label: 'Reintentar', onClick: () => void path.refetch() }}
          />
        )}
      </div>
    );
  }
  if (!path.data) {
    return (
      <div className="recos">
        {header}
        <LoadingCard />
      </div>
    );
  }

  const { attempt, decisions, graph_pending } = path.data;
  const type = simulation.data
    ? (typedSkills(simulation.data.skills)[0]?.type ?? 'STONE')
    : 'STONE';
  const minutes = durationMinutes(attempt);
  const evidenceId = evidence.data?.items.find((item) => item.attempt_id === attempt.id)?.id;
  // Una partida terminada que aún no es evidencia se puede guardar desde aquí (si ya lo es y
  // no salió en la lista, la API responde 409 y la hoja muestra «Ya está guardada»).
  const canSave = attempt.status === 'COMPLETED' && Boolean(evidence.data) && !evidenceId;

  return (
    <div className="recos" data-type={type}>
      {header}
      <div className="recos-body path">
        <div className="path-top">
          <section className="path-summary panel" aria-label="Resumen">
            <div>
              <span className="path-summary-label">Puntuación</span>
              <span className="path-summary-score">
                {attempt.score === null ? '—' : formatScore(attempt.score)}
              </span>
            </div>
            <div>
              <span className="path-summary-label">Fecha</span>
              <span className="path-summary-value">
                {formatDate(attempt.finished_at ?? attempt.started_at)}
              </span>
            </div>
            <div>
              <span className="path-summary-label">
                {attempt.status === 'COMPLETED' ? 'Duración' : 'Estado'}
              </span>
              <span className="path-summary-value">
                {attempt.status === 'COMPLETED'
                  ? minutes
                    ? `${minutes} min`
                    : '—'
                  : ATTEMPT_STATUS[attempt.status].label}
              </span>
            </div>
          </section>
          {graph_pending ? (
            <div className="path-pending" role="status">
              <span aria-hidden="true">◆</span>
              <span>Tu progreso todavía se está actualizando. El recorrido ya está completo.</span>
            </div>
          ) : null}
        </div>

        <h2 className="profile-heading">{plural(decisions.length, 'decisión', 'decisiones')}</h2>
        {decisions.length === 0 ? (
          <p className="profile-empty">Esta partida no tiene decisiones registradas.</p>
        ) : (
          <ol className="path-list">
            {decisions.map((decision) => {
              const meta = STEP_TYPES[decision.step.type];
              return (
                <li key={decision.sequence} className="path-item panel">
                  <div className="path-item-head">
                    <span className="path-item-num">{two(decision.sequence)}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/sprites/${meta.sprite}.svg`}
                      alt=""
                      width={Math.round(meta.width * 0.6)}
                      height={Math.round(meta.height * 0.6)}
                    />
                    <span className="path-item-step">
                      <span className="path-item-type">{meta.label}</span>
                      <span className="path-item-title">{decision.step.title}</span>
                    </span>
                    <FeedbackBadge result={decision.feedback.type} />
                  </div>
                  <div className="path-item-body">
                    <div className="decision-choice">
                      <span className="decision-label">Elegiste</span>
                      <span className="decision-option">{decision.option.description}</span>
                    </div>
                    {decision.consequences.map((consequence, index) => (
                      <div key={consequence.id ?? index} className="path-consequence">
                        <ImpactBadge impact={consequence.impact} />
                        <span>{consequence.description}</span>
                      </div>
                    ))}
                    <div className="path-feedback">
                      <p>{decision.feedback.comment}</p>
                      <p>
                        <span className="path-advice">Consejo · </span>
                        {decision.feedback.recommendation}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {evidenceId ? (
          <PixelButton href={`/evidence/${evidenceId}`} variant="secondary" block>
            Ver su evidencia ▶
          </PixelButton>
        ) : canSave ? (
          <PixelButton variant="type" block onClick={() => setSaving(true)}>
            Guardar como evidencia ▶
          </PixelButton>
        ) : null}
      </div>
      {canSave ? (
        <SaveEvidenceSheet
          open={saving}
          onClose={() => setSaving(false)}
          attempt={attempt}
          simulationTitle={title}
          type={type}
        />
      ) : null}
    </div>
  );
}
