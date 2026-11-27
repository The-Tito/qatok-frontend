'use client';

import type { PlayerStep } from '@qatok/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { PixelButton } from '../../../../components/PixelButton';
import { OptionList } from '../../../../components/play/OptionList';
import { STEP_TYPES, StepContext } from '../../../../components/play/StepContext';
import { LoadingCard, StateCard } from '../../../../components/StateCard';
import { getAttempt, getSimulation, isApiError, respondStep } from '../../../../lib/api';
import { typedSkills } from '../../../../lib/simulation';
import type { SkillTypeKey } from '../../../../lib/skill-types';

type AttemptDetail = Awaited<ReturnType<typeof getAttempt>>;

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

  if (detail.attempt.status !== 'IN_PROGRESS' || !detail.current_step) {
    // Partida completada o abandonada: sus vistas llegan en el issue 3.3.
    return (
      <StateCard
        kind="empty"
        title={
          detail.attempt.status === 'ABANDONED' ? 'Partida abandonada' : 'Simulación completada'
        }
        message="Puedes ver tus partidas en el perfil o elegir otra simulación."
        action={{ label: 'Ir al catálogo', href: '/simulaciones' }}
      />
    );
  }

  return (
    <StepScreen
      key={detail.current_step.id}
      detail={detail}
      step={detail.current_step}
      type={type}
      simulationTitle={title}
    />
  );
}

function StepScreen({
  detail,
  step,
  type,
  simulationTitle,
}: {
  detail: AttemptDetail;
  step: PlayerStep;
  type: SkillTypeKey;
  simulationTitle: string;
}) {
  const queryClient = useQueryClient();
  const attemptId = detail.attempt.id;
  const [selected, setSelected] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const meta = STEP_TYPES[step.type];

  const decide = useMutation({
    mutationFn: (optionId: string) =>
      respondStep(attemptId, { step_id: step.id, option_id: optionId }),
    onSuccess: (recorded) => {
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
      <header className="step-header">
        <div className="step-header-inner">
          <Link href="/simulaciones" className="step-pause" aria-label="Pausar y salir">
            <span aria-hidden="true">II</span>
            <span className="step-pause-text" aria-hidden="true">
              Pausar
            </span>
          </Link>
          <div className="step-header-text">
            <span className="step-header-step">
              Paso {step.order} · {meta.label}
            </span>
            <span className="step-header-title">{simulationTitle}</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/sprites/${meta.sprite}.svg`}
            alt=""
            width={meta.width}
            height={meta.height}
            className="step-header-icon"
          />
        </div>
      </header>

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
