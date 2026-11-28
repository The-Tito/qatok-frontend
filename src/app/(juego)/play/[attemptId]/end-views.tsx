'use client';

import type { Attempt } from '@qatok/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FeedbackBadge } from '../../../../components/Badges';
import { PixelButton } from '../../../../components/PixelButton';
import { SaveEvidenceSheet } from '../../../../components/SaveEvidenceSheet';
import { Sheet } from '../../../../components/Sheet';
import { Sparkle } from '../../../../components/Sprites';
import { StudentShell } from '../../../../components/Shells';
import { SyncBanner } from '../../../../components/SyncBanner';
import { abandonAttempt, isApiError } from '../../../../lib/api';
import { formatDate } from '../../../../lib/format';
import type { SkillTypeKey } from '../../../../lib/skill-types';
import type { SessionDecision } from './play-view';

const formatScore = (score: number) => String(Math.round(score * 10) / 10);

/** J4 · Pausa: seguir, salir y continuar después, o abandonar con confirmación. */
export function PauseSheet({
  open,
  onClose,
  attempt,
  simulationTitle,
  type,
}: {
  open: boolean;
  onClose: () => void;
  attempt: Attempt;
  simulationTitle: string;
  type: SkillTypeKey;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);

  const abandon = useMutation({
    mutationFn: () => abandonAttempt(attempt.id),
    onSuccess: (result) => {
      queryClient.setQueryData(['attempt', attempt.id], {
        attempt: result.attempt,
        current_step: null,
        responses: [],
      });
      void queryClient.invalidateQueries({ queryKey: ['attempts'] });
      void queryClient.invalidateQueries({ queryKey: ['attempt', attempt.id] });
      close();
    },
    onError: (error) => {
      // Ya había terminado (otra pestaña): se recarga el estado real.
      if (isApiError(error, 'ATTEMPT_NOT_IN_PROGRESS')) {
        void queryClient.invalidateQueries({ queryKey: ['attempt', attempt.id] });
        close();
      } else {
        setFailed(true);
      }
    },
  });

  function close() {
    setConfirming(false);
    setFailed(false);
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={() => !abandon.isPending && close()}
      title={confirming ? '¿Abandonar la partida?' : 'Pausa'}
      closeLabel="Seguir jugando"
      role={confirming ? 'alertdialog' : 'dialog'}
      type={type}
    >
      {confirming ? (
        <>
          <div className="danger-box">
            <span className="danger-box-tag">✕ No se puede deshacer</span>
            <p className="pause-text-danger">
              La partida queda como abandonada y no cuenta para tu progreso. Podrás empezar esta
              simulación de nuevo.
            </p>
          </div>
          {failed ? (
            <p className="form-alert" role="alert">
              No pudimos abandonar la partida. Intenta de nuevo.
            </p>
          ) : null}
          <PixelButton
            variant="danger"
            className="danger-confirm"
            size="lg"
            block
            disabled={abandon.isPending}
            onClick={() => {
              setFailed(false);
              abandon.mutate();
            }}
          >
            {abandon.isPending ? 'Abandonando…' : 'Sí, abandonar'}
          </PixelButton>
          <PixelButton
            variant="secondary"
            block
            disabled={abandon.isPending}
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </PixelButton>
        </>
      ) : (
        <>
          <div className="pause-card">
            <span className="pause-card-label">
              Partida en curso · iniciada el {formatDate(attempt.started_at)}
            </span>
            <span className="pause-card-title">{simulationTitle}</span>
          </div>
          <p className="account-note">
            Tus decisiones ya están guardadas. Puedes volver cuando quieras desde el catálogo.
          </p>
          <PixelButton variant="type" size="lg" block onClick={close}>
            Seguir jugando ▶
          </PixelButton>
          <PixelButton variant="secondary" block onClick={() => router.push('/simulations')}>
            Salir y continuar después
          </PixelButton>
          <PixelButton
            variant="danger"
            block
            className="pause-abandon"
            onClick={() => setConfirming(true)}
          >
            Abandonar partida
          </PixelButton>
        </>
      )}
    </Sheet>
  );
}

/** J5 · Partida abandonada. */
export function AbandonedView({ simulationTitle }: { simulationTitle: string }) {
  return (
    <StudentShell>
      <div className="end-view">
        <div className="end-head">
          <span className="end-eyebrow">Partida terminada</span>
          <span className="end-subtitle">{simulationTitle}</span>
        </div>
        <section className="abandoned panel" aria-labelledby="abandonada">
          <Sparkle color="var(--color-stone)" size={48} />
          <h1 id="abandonada" className="abandoned-title">
            Abandonaste esta partida
          </h1>
          <p className="abandoned-text">
            No cuenta para tu progreso. Tus otras partidas y evidencias siguen igual.
          </p>
          <span className="chip" data-neutral="">
            ✕ Abandonada
          </span>
        </section>
        <div className="end-actions">
          <PixelButton href="/simulations" size="lg" block>
            Volver al catálogo ▶
          </PixelButton>
          <PixelButton href="/profile/attempts" variant="secondary" block>
            Ver mis partidas
          </PixelButton>
        </div>
      </div>
    </StudentShell>
  );
}

/** ResultadoV2 · Simulación completada. */
export function CompletedView({
  attempt,
  simulationTitle,
  type,
  decisions,
  responseCount,
}: {
  attempt: Attempt;
  simulationTitle: string;
  type: SkillTypeKey;
  decisions: SessionDecision[];
  /** Respuestas del intento según la API: si la sesión no las tiene todas, no se lista. */
  responseCount: number;
}) {
  const [saving, setSaving] = useState(false);
  const pending = decisions.at(-1)?.recorded.synchronization.graph === 'PENDING';

  return (
    <StudentShell>
      <div className="completed" data-type={type}>
        <div className="completed-hero">
          <Sparkle color="var(--type-base)" size={21} className="completed-sparkle-1" />
          <Sparkle color="var(--type-dark)" size={28} className="completed-sparkle-2" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sprites/trophy.svg" alt="" className="completed-trophy" />
          <span className="completed-eyebrow">Simulación completada</span>
          <h1 className="completed-title">{simulationTitle}</h1>
          {attempt.score !== null ? (
            <p className="completed-score panel">
              <span className="completed-score-label">Puntuación</span>
              <span className="completed-score-value">{formatScore(attempt.score)}</span>
              <span className="completed-score-label">/ 100</span>
            </p>
          ) : null}
        </div>

        <div className="completed-body">
          <div className="completed-main">
            {decisions.length > 0 && decisions.length >= responseCount ? (
              <section className="completed-decisions" aria-labelledby="tus-decisiones">
                <h2 id="tus-decisiones" className="decision-label decision-label-ink">
                  Tus decisiones
                </h2>
                <ol>
                  {decisions.map((decision, index) => (
                    <li key={decision.recorded.response.id} className="completed-decision">
                      <span className="completed-decision-num">{index + 1}</span>
                      <span className="completed-decision-text">{decision.option}</span>
                      <FeedbackBadge result={decision.recorded.feedback.type} />
                    </li>
                  ))}
                </ol>
              </section>
            ) : (
              <p className="account-note">
                Tus decisiones y su retroalimentación están en el recorrido de esta partida.
              </p>
            )}
            {pending ? (
              <SyncBanner message="Tu intento ya está guardado. Tus niveles aparecerán en el perfil en unos segundos." />
            ) : null}
          </div>

          <div className="completed-actions">
            <PixelButton variant="type" size="lg" block onClick={() => setSaving(true)}>
              Guardar como evidencia
            </PixelButton>
            <div className="completed-actions-row">
              <PixelButton href={`/profile/attempts/${attempt.id}`} variant="secondary" block>
                Ver recorrido
              </PixelButton>
              <PixelButton href="/profile" variant="secondary" block>
                Mi perfil ▶
              </PixelButton>
            </div>
          </div>
        </div>
      </div>
      <SaveEvidenceSheet
        open={saving}
        onClose={() => setSaving(false)}
        attempt={attempt}
        simulationTitle={simulationTitle}
        type={type}
      />
    </StudentShell>
  );
}
