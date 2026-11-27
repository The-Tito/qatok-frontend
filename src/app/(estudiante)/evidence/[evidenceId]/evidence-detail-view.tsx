'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FeedbackBadge } from '../../../../components/Badges';
import { PixelButton } from '../../../../components/PixelButton';
import { STEP_TYPES } from '../../../../components/play/StepContext';
import { Sheet } from '../../../../components/Sheet';
import { LoadingCard, StateCard } from '../../../../components/StateCard';
import { deleteEvidence, getEvidence, isApiError, updateEvidence } from '../../../../lib/api';
import { formatDate } from '../../../../lib/format';
import { skillType } from '../../../../lib/skill-types';
import { SharesSection } from './shares-section';

const formatScore = (n: number) => String(Math.round(n * 10) / 10);
const two = (n: number) => String(n).padStart(2, '0');

/** EvidenciaDetalleV2 · Evidencia: contenido de la instantánea, privacidad y eliminar. */
export function EvidenceDetailView({ evidenceId }: { evidenceId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ['evidence', evidenceId],
    queryFn: ({ signal }) => getEvidence(evidenceId, signal),
  });

  const visibility = useMutation({
    mutationFn: (next: 'PRIVATE' | 'PUBLIC') => updateEvidence(evidenceId, { visibility: next }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['evidence', evidenceId], {
        ...detail.data!,
        evidence: updated.evidence,
      });
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
    },
    onError: () => setFailed('No pudimos cambiar la privacidad. Intenta de nuevo.'),
  });

  const remove = useMutation({
    mutationFn: () => deleteEvidence(evidenceId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['evidence', evidenceId] });
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.replace('/evidence');
    },
    onError: () => setFailed('No pudimos eliminar la evidencia. Intenta de nuevo.'),
  });

  if (detail.isError) {
    return isApiError(detail.error, 'NOT_FOUND', 'VALIDATION_ERROR') ? (
      <StateCard
        kind="not-found"
        title="Esta evidencia ya no está disponible"
        message="Puede que la hayas eliminado o que sea de otra cuenta."
        action={{ label: 'Ver mis evidencias', href: '/evidence' }}
      />
    ) : (
      <StateCard
        kind="error"
        title="No pudimos cargar esta pantalla"
        message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
        action={{ label: 'Reintentar', onClick: () => void detail.refetch() }}
      />
    );
  }
  if (!detail.data) return <LoadingCard />;

  const { evidence, content } = detail.data;
  const type = content.skills[0] ? skillType(content.skills[0].id) : 'STONE';
  const isPublic = evidence.visibility === 'PUBLIC';

  return (
    <div className="evidence-detail" data-type={type}>
      <header className="evidence-detail-bar">
        <Link href="/evidence" className="page-header-back" aria-label="Volver a evidencias">
          <span aria-hidden="true">◀</span>
        </Link>
        <span className="evidence-detail-label">Evidencia</span>
        <button
          type="button"
          className="evidence-visibility"
          aria-pressed={isPublic}
          aria-label={`Visibilidad: ${isPublic ? 'pública' : 'privada'}. Cambiar a ${isPublic ? 'privada' : 'pública'}`}
          disabled={visibility.isPending}
          onClick={() => {
            setFailed(null);
            visibility.mutate(isPublic ? 'PRIVATE' : 'PUBLIC');
          }}
        >
          {isPublic ? '◎ Pública' : '● Privada'}
        </button>
      </header>

      <div className="evidence-detail-layout">
        <div className="evidence-detail-main">
          <div className="evidence-detail-head">
            <h1 className="evidence-detail-title">{evidence.title}</h1>
            <span className="evidence-card-sub">
              {content.simulation.title} · {formatDate(evidence.generated_at)}
            </span>
          </div>

          {failed ? (
            <p className="form-alert" role="alert">
              {failed}
            </p>
          ) : null}

          <section className="evidence-summary panel" aria-label="Resumen">
            <div className="evidence-summary-score">
              <span className="path-summary-label">Puntuación</span>
              <span>
                <span className="evidence-score">{formatScore(content.score)}</span>
                <span className="path-summary-label"> / 100</span>
              </span>
            </div>
            <p className="evidence-description">{content.description}</p>
            <div className="evidence-summary-skills">
              {content.skills.map((skill) => (
                <span key={skill.id} className="chip skill-row-chip" data-type={skillType(skill)}>
                  {skill.name}
                </span>
              ))}
            </div>
          </section>

          <section className="evidence-decisions" aria-labelledby="decisiones">
            <div className="profile-heading-row">
              <h2 id="decisiones" className="profile-heading">
                Decisiones
              </h2>
              <Link href={`/profile/attempts/${evidence.attempt_id}`} className="profile-more-link">
                Ver recorrido ▶
              </Link>
            </div>
            <ol className="evidence-decision-list">
              {content.decisions.map((decision) => (
                <li key={decision.sequence} className="evidence-decision">
                  <div className="evidence-decision-head">
                    <span className="evidence-decision-step">
                      <span className="evidence-decision-num">{two(decision.sequence)}</span>
                      <span className="path-item-type">
                        {STEP_TYPES[decision.step.type].label} · {decision.step.title}
                      </span>
                    </span>
                    <FeedbackBadge result={decision.feedback_type} />
                  </div>
                  <p className="decision-option">{decision.option}</p>
                  {decision.consequences.map((consequence, index) => (
                    <p key={index} className="evidence-consequence">
                      → {consequence}
                    </p>
                  ))}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="evidence-detail-side">
          <SharesSection evidenceId={evidenceId} type={type} />
          <div className="evidence-detail-actions">
            <button
              type="button"
              className="evidence-delete"
              aria-label="Eliminar evidencia"
              onClick={() => setDeleting(true)}
            >
              <span aria-hidden="true">✕</span>
              <span className="evidence-delete-text">Eliminar evidencia</span>
            </button>
          </div>
        </aside>
      </div>

      <Sheet
        open={deleting}
        onClose={() => !remove.isPending && setDeleting(false)}
        title="¿Eliminar esta evidencia?"
        role="alertdialog"
        type={type}
      >
        <div className="danger-box">
          <span className="danger-box-tag">✕ No se puede deshacer</span>
          <p className="pause-text-danger">
            Se borra la copia de tus decisiones y sus enlaces dejan de funcionar. La partida sigue
            en tu historial.
          </p>
        </div>
        <PixelButton
          variant="danger"
          className="danger-confirm"
          size="lg"
          block
          disabled={remove.isPending}
          onClick={() => {
            setFailed(null);
            remove.mutate();
          }}
        >
          {remove.isPending ? 'Eliminando…' : 'Sí, eliminar'}
        </PixelButton>
        <PixelButton
          variant="secondary"
          block
          disabled={remove.isPending}
          onClick={() => setDeleting(false)}
        >
          Cancelar
        </PixelButton>
      </Sheet>
    </div>
  );
}
