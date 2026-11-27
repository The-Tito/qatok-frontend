'use client';

import type { PlayerStep } from '@qatok/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ImpactBadge } from '../../../../components/Badges';
import { PixelButton } from '../../../../components/PixelButton';
import { OptionList } from '../../../../components/play/OptionList';
import { STEP_TYPES, StepContext } from '../../../../components/play/StepContext';
import { Sparkle } from '../../../../components/Sprites';
import { LoadingCard, StateCard } from '../../../../components/StateCard';
import { getAttempt, getSimulation, isApiError, respondStep } from '../../../../lib/api';
import { typedSkills } from '../../../../lib/simulation';
import { AbandonedView, CompletedView, PauseSheet } from './end-views';
import type { SkillTypeKey } from '../../../../lib/skill-types';

type AttemptDetail = Awaited<ReturnType<typeof getAttempt>>;
type Recorded = Awaited<ReturnType<typeof respondStep>>;

/** Una decisión de esta sesión: lo que devolvió la API y lo que se eligió. */
export interface SessionDecision {
  stepOrder: number;
  stepTitle: string;
  option: string;
  recorded: Recorded;
}

export function PlayView({ attemptId }: { attemptId: string }) {
  const attempt = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: ({ signal }) => getAttempt(attemptId, signal),
    // El estado vive en la API: al volver a la pestaña se recarga por si cambió en otra.
    refetchOnWindowFocus: true,
  });
  const simulationId = attempt.data?.attempt.simulation_id;
  // La simulación puede estar desactivada y el intento seguir (DEC-26): sin ella, tipo STONE.
  const simulation = useQuery({
    queryKey: ['simulation', simulationId],
    queryFn: ({ signal }) => getSimulation(simulationId!, signal),
    enabled: Boolean(simulationId),
    retry: false,
  });
  // Decisiones de esta sesión (para «Tus decisiones») y la que se está mostrando.
  const [decisions, setDecisions] = useState<SessionDecision[]>([]);
  const [showing, setShowing] = useState<SessionDecision | null>(null);
  const [pausing, setPausing] = useState(false);

  if (attempt.isError) {
    return isApiError(attempt.error, 'NOT_FOUND', 'VALIDATION_ERROR') ? (
      <StateCard
        kind="not-found"
        title="No encontramos esta partida"
        message="Puede que el enlace esté mal o que la partida sea de otra cuenta."
        action={{ label: 'Ir al catálogo', href: '/simulaciones' }}
      />
    ) : (
      <StateCard
        kind="error"
        title="No pudimos cargar esta pantalla"
        message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
        action={{ label: 'Reintentar', onClick: () => void attempt.refetch() }}
      />
    );
  }
  if (!attempt.data || (simulationId && simulation.isPending)) return <LoadingCard />;

  const detail = attempt.data;
  const type: SkillTypeKey = simulation.data
    ? (typedSkills(simulation.data.skills)[0]?.type ?? 'STONE')
    : 'STONE';
  const title = simulation.data?.title ?? 'Simulación';

  const pause = (
    <PauseSheet
      open={pausing}
      onClose={() => setPausing(false)}
      attempt={detail.attempt}
      simulationTitle={title}
      type={type}
    />
  );

  if (showing) {
    return (
      <>
        <DecisionScreen
          decision={showing}
          type={type}
          simulationTitle={title}
          onContinue={() => setShowing(null)}
          onPause={showing.recorded.next_step ? () => setPausing(true) : undefined}
        />
        {pause}
      </>
    );
  }

  if (detail.attempt.status === 'ABANDONED') return <AbandonedView simulationTitle={title} />;
  if (detail.attempt.status === 'COMPLETED' || !detail.current_step) {
    return (
      <CompletedView
        attempt={detail.attempt}
        simulationTitle={title}
        type={type}
        decisions={decisions}
        responseCount={detail.responses.length}
      />
    );
  }

  return (
    <>
      {pause}
      <StepScreen
        key={detail.current_step.id}
        detail={detail}
        step={detail.current_step}
        type={type}
        simulationTitle={title}
        onPause={() => setPausing(true)}
        onDecided={(decision) => {
          setDecisions((previous) => [...previous, decision]);
          setShowing(decision);
        }}
      />
    </>
  );
}

function StepHeader({
  label,
  simulationTitle,
  icon,
  onPause,
}: {
  label: string;
  simulationTitle: string;
  icon?: { src: string; width: number; height: number };
  /** Sin pausa (última decisión ya enviada) el botón no se muestra. */
  onPause?: () => void;
}) {
  return (
    <header className="step-header">
      <div className="step-header-inner">
        {onPause ? (
          <button type="button" className="step-pause" aria-label="Pausar" onClick={onPause}>
            <span aria-hidden="true">II</span>
            <span className="step-pause-text" aria-hidden="true">
              Pausar
            </span>
          </button>
        ) : null}
        <div className="step-header-text">
          <span className="step-header-step">{label}</span>
          <span className="step-header-title">{simulationTitle}</span>
        </div>
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={icon.src}
            alt=""
            width={icon.width}
            height={icon.height}
            className="step-header-icon"
          />
        ) : null}
      </div>
    </header>
  );
}

function StepScreen({
  detail,
  step,
  type,
  simulationTitle,
  onPause,
  onDecided,
}: {
  detail: AttemptDetail;
  step: PlayerStep;
  type: SkillTypeKey;
  simulationTitle: string;
  onPause: () => void;
  onDecided: (decision: SessionDecision) => void;
}) {
  const queryClient = useQueryClient();
  const attemptId = detail.attempt.id;
  const [selected, setSelected] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const meta = STEP_TYPES[step.type];

  const decide = useMutation({
    mutationFn: (optionId: string) =>
      respondStep(attemptId, { step_id: step.id, option_id: optionId }),
    onSuccess: (recorded, optionId) => {
      onDecided({
        stepOrder: step.order,
        stepTitle: step.title,
        option: step.options.find((option) => option.id === optionId)?.description ?? '',
        recorded,
      });
      queryClient.setQueryData<AttemptDetail>(['attempt', attemptId], {
        attempt: recorded.attempt,
        current_step: recorded.next_step,
        responses: [...detail.responses, recorded.response],
      });
      void queryClient.invalidateQueries({ queryKey: ['attempts'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      // El paso ya no es el actual o la partida terminó (otra pestaña): se recarga el intento.
      if (isApiError(error, 'STEP_NOT_CURRENT', 'ATTEMPT_NOT_IN_PROGRESS', 'OPTION_NOT_IN_STEP')) {
        void queryClient.invalidateQueries({ queryKey: ['attempt', attemptId] });
      } else {
        setFailed(true);
      }
    },
  });

  return (
    <div className="play" data-type={type}>
      <StepHeader
        label={`Paso ${step.order} · ${meta.label}`}
        simulationTitle={simulationTitle}
        icon={{ src: `/sprites/${meta.sprite}.svg`, width: meta.width, height: meta.height }}
        onPause={onPause}
      />

      <main className="step" data-state="ready">
        <section className="step-situation" aria-label="Situación">
          <div className="step-intro">
            <h1 className="step-title">{step.title}</h1>
            <p className="step-description">{step.description}</p>
          </div>
          <StepContext step={step} />
        </section>

        <section className="step-decision" aria-label="Decisión">
          <div className="step-question">
            <span>{meta.question}</span>
            <span className="step-question-rule" aria-hidden="true" />
          </div>
          <OptionList
            label="Opciones"
            options={step.options}
            selected={selected}
            onSelect={(optionId) => {
              setFailed(false);
              setSelected(optionId);
            }}
            disabled={decide.isPending}
          />
          {failed ? (
            <p className="form-alert" role="alert">
              No pudimos guardar tu decisión. Intenta de nuevo.
            </p>
          ) : null}
          <div className="step-actions">
            <PixelButton
              variant="type"
              size="lg"
              block
              disabled={!selected || decide.isPending}
              onClick={() => selected && decide.mutate(selected)}
            >
              {decide.isPending ? 'Decidiendo…' : 'Decidir ▶'}
            </PixelButton>
          </div>
        </section>
      </main>
    </div>
  );
}

const FEEDBACK = {
  CORRECT: { title: '¡Acierto!', result: 'correct' },
  PARTIAL: { title: 'Parcial', result: 'partial' },
  INCORRECT: { title: 'Error', result: 'incorrect' },
} as const;

/** Icono grande de la retroalimentación: destello (acierto), rombo (parcial) o cruz (error). */
function FeedbackIcon({ type }: { type: keyof typeof FEEDBACK }) {
  const shapes: Record<keyof typeof FEEDBACK, ReactNode> = {
    CORRECT: (
      <>
        <path
          fill="var(--fb-fg)"
          d="M5 0h1v3h-1z M4 3h3v1h-3z M3 4h5v1h-5z M0 5h11v1h-11z M3 6h5v1h-5z M4 7h3v1h-3z M5 8h1v3h-1z"
        />
        <path
          fill="var(--fb-accent)"
          d="M5 2h1v2h-1z M4 4h3v3h-3z M2 5h2v1h-2z M7 5h2v1h-2z M5 7h1v2h-1z"
        />
        <path fill="#FFFFFF" d="M5 5h1v1h-1z" />
      </>
    ),
    PARTIAL: (
      <>
        <path
          fill="var(--fb-fg)"
          d="M5 1h1v1h-1z M4 2h3v1h-3z M3 3h5v1h-5z M2 4h7v3h-7z M3 7h5v1h-5z M4 8h3v1h-3z M5 9h1v1h-1z"
        />
        <path fill="var(--fb-accent)" d="M5 3h1v1h-1z M4 4h3v3h-3z M5 7h1v1h-1z" />
      </>
    ),
    INCORRECT: (
      <path
        fill="var(--fb-fg)"
        d="M1 1h2v1h-2z M8 1h2v1h-2z M2 2h2v1h-2z M7 2h2v1h-2z M3 3h2v1h-2z M6 3h2v1h-2z M4 4h3v3h-3z M3 7h2v1h-2z M6 7h2v1h-2z M2 8h2v1h-2z M7 8h2v1h-2z M1 9h2v1h-2z M8 9h2v1h-2z"
      />
    ),
  };
  return (
    <svg className="pixel-icon feedback-icon" viewBox="0 0 11 11" aria-hidden="true">
      {shapes[type]}
    </svg>
  );
}

/** Resultado de la decisión (DecisionV2 y DecisionWeb). */
function DecisionScreen({
  decision,
  type,
  simulationTitle,
  onContinue,
  onPause,
}: {
  decision: SessionDecision;
  type: SkillTypeKey;
  simulationTitle: string;
  onContinue: () => void;
  onPause?: () => void;
}) {
  const { recorded } = decision;
  const feedback = FEEDBACK[recorded.feedback.type];
  const last = recorded.next_step === null;
  const headingRef = useRef<HTMLHeadingElement>(null);

  // El foco va al resultado para que el lector de pantalla lo anuncie.
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <div className="play" data-type={type}>
      <StepHeader
        label={`Paso ${decision.stepOrder} · Resultado`}
        simulationTitle={simulationTitle}
        onPause={onPause}
      />
      <main className="step decision">
        <section className="step-situation" aria-label="Resultado">
          <div className="feedback-banner panel" data-state="shown" data-result={feedback.result}>
            <FeedbackIcon type={recorded.feedback.type} />
            <div className="feedback-banner-text">
              <span className="feedback-banner-label">Retroalimentación</span>
              <h1 ref={headingRef} tabIndex={-1} className="feedback-banner-title">
                {feedback.title}
              </h1>
            </div>
            {recorded.feedback.type === 'CORRECT' ? (
              <>
                <Sparkle color="var(--fb-accent)" size={14} className="feedback-sparkle-1" />
                <Sparkle color="var(--fb-accent)" size={21} className="feedback-sparkle-2" />
              </>
            ) : null}
          </div>
          <div className="decision-choice">
            <span className="decision-label">Elegiste</span>
            <p className="decision-option">{decision.option}</p>
          </div>
          {recorded.consequences.length > 0 ? (
            <section className="decision-consequences" aria-labelledby="consecuencias">
              <h2 id="consecuencias" className="decision-label decision-label-ink">
                {recorded.consequences.length === 1 ? 'Consecuencia' : 'Consecuencias'}
              </h2>
              <ul>
                {recorded.consequences.map((consequence, index) => (
                  <li key={consequence.id ?? index} className="decision-consequence">
                    <ImpactBadge impact={consequence.impact} />
                    <span>{consequence.description}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </section>

        <section className="step-decision" aria-label="Qué sigue">
          <section className="decision-feedback panel">
            <div className="decision-comment">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sprites/bubble.svg" alt="" width={24} height={22} />
              <p>{recorded.feedback.comment}</p>
            </div>
            <div className="decision-advice">
              <span className="decision-label decision-label-type">
                {last ? 'Para la próxima' : 'Consejo para el siguiente paso'}
              </span>
              <p>{recorded.feedback.recommendation}</p>
            </div>
          </section>
          <div className="step-actions decision-actions">
            <span className="decision-saved">✓ Decisión guardada</span>
            <PixelButton variant="type" size="lg" block onClick={onContinue}>
              {last ? 'Ver resultado ▶' : 'Siguiente paso ▶'}
            </PixelButton>
          </div>
        </section>
      </main>
    </div>
  );
}
