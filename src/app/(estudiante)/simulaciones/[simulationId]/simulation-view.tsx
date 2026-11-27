'use client';

import type { Attempt, SimulationSummary } from '@qatok/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LevelBar } from '../../../../components/LevelBar';
import { PixelButton } from '../../../../components/PixelButton';
import { Sheet } from '../../../../components/Sheet';
import { Sparkle } from '../../../../components/Sprites';
import { LoadingCard, StateCard } from '../../../../components/StateCard';
import {
  abandonAttempt,
  getProfile,
  getSimulation,
  isApiError,
  listAttempts,
  startAttempt,
} from '../../../../lib/api';
import { formatDate } from '../../../../lib/format';
import { difficultyText, durationText, typedSkills } from '../../../../lib/simulation';
import { SKILL_TYPES } from '../../../../lib/skill-types';

const formatLevel = (n: number) => String(Math.round(n * 10) / 10);

export function SimulationView({ simulationId }: { simulationId: string }) {
  const simulation = useQuery({
    queryKey: ['simulation', simulationId],
    queryFn: ({ signal }) => getSimulation(simulationId, signal),
  });

  if (simulation.isError) {
    return isApiError(simulation.error, 'NOT_FOUND', 'VALIDATION_ERROR') ? (
      <StateCard
        kind="not-found"
        title="Esta simulación ya no está disponible"
        message="Puede que la hayan retirado del catálogo."
        action={{ label: 'Ir al catálogo', href: '/simulaciones' }}
      />
    ) : (
      <StateCard
        kind="error"
        title="No pudimos cargar esta pantalla"
        message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
        action={{ label: 'Reintentar', onClick: () => void simulation.refetch() }}
      />
    );
  }
  if (!simulation.data) return <LoadingCard />;
  return <SimulationDetail simulation={simulation.data} />;
}

function SimulationDetail({ simulation }: { simulation: SimulationSummary }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const skills = typedSkills(simulation.skills);
  const main = skills[0];
  const type = main?.type ?? 'STONE';
  const duration = durationText(simulation.estimated_duration);
  const [unavailable, setUnavailable] = useState(false);
  const [startFailed, setStartFailed] = useState(false);

  // «Tu nivel» sale del perfil; si no carga, las barras quedan vacías con «Aún sin nivel».
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => getProfile(signal),
    retry: false,
  });
  const levels = new Map(profile.data?.skills.map((skill) => [skill.id, skill.current_level]));

  // Partida en curso de esta simulación (la API permite una por simulación).
  const active = useQuery({
    queryKey: ['attempts', { status: 'IN_PROGRESS', limit: 100 }],
    queryFn: ({ signal }) => listAttempts({ status: 'IN_PROGRESS', limit: 100 }, signal),
  });
  const activeAttempt = active.data?.items.find((item) => item.simulation_id === simulation.id);

  const start = useMutation({
    mutationFn: () => startAttempt(simulation.id),
    onSuccess: (started) => {
      void queryClient.invalidateQueries({ queryKey: ['attempts'] });
      queryClient.setQueryData(['attempt', started.attempt.id], {
        attempt: started.attempt,
        current_step: started.current_step,
        responses: [],
      });
      router.push(`/jugar/${started.attempt.id}`);
    },
    onError: (error) => {
      if (isApiError(error, 'ACTIVE_ATTEMPT_EXISTS')) {
        void queryClient.invalidateQueries({ queryKey: ['attempts'] });
      } else if (isApiError(error, 'NOT_FOUND', 'SIMULATION_NOT_PUBLISHED')) {
        setUnavailable(true);
      } else {
        setStartFailed(true);
      }
    },
  });

  if (unavailable) {
    return (
      <StateCard
        kind="not-found"
        title="Esta simulación ya no está disponible"
        message="Puede que la hayan retirado del catálogo."
        action={{ label: 'Ir al catálogo', href: '/simulaciones' }}
      />
    );
  }

  return (
    <div className="sim-detail" data-type={type}>
      <Link href="/simulaciones" className="sim-detail-back-web">
        ◀ Catálogo
      </Link>
      <div className="sim-detail-layout">
        <div className="sim-scene" data-active={activeAttempt ? '' : undefined}>
          <Link href="/simulaciones" className="sim-scene-back" aria-label="Volver al catálogo">
            ◀
          </Link>
          <span className="sim-scene-tag">Tipo {SKILL_TYPES[type].label}</span>
          <Sparkle color="var(--type-base)" size={21} className="sim-scene-sparkle-1" />
          <Sparkle color="var(--type-dark)" size={28} className="sim-scene-sparkle-2" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sprites/interlocutor.svg" alt="" className="sim-scene-sprite" />
          <div className="sim-scene-floor" />
        </div>

        <section className="sim-detail-info">
          <p className="sim-detail-meta">
            <span>{difficultyText(simulation.difficulty)}</span>
            <span className="sim-detail-meta-muted">
              {duration ? `· ${duration} · ` : '· '}Puedes pausar
            </span>
          </p>
          <h1 className="sim-detail-title">{simulation.title}</h1>
          <p className="sim-detail-description">{simulation.description}</p>

          <section className="sim-train panel" aria-labelledby="entrena">
            <h2 id="entrena" className="sim-train-title">
              Entrena
            </h2>
            {skills.map((skill) => {
              const expected = simulation.skills.find((s) => s.id === skill.id)?.expected_level;
              const level = levels.get(skill.id);
              return (
                <div key={skill.id} className="sim-train-skill" data-type={skill.type}>
                  <div className="sim-train-head">
                    <span className="sim-train-name">{skill.name}</span>
                    <span className="sim-train-type">
                      {skill.typeLabel} · {skill.percent}%
                    </span>
                  </div>
                  <LevelBar
                    label={skill.name}
                    value={level ?? 0}
                    target={expected}
                    type={skill.type}
                    compact
                  />
                  <span className="sim-train-levels">
                    {level === undefined ? 'Aún sin nivel' : `Tu nivel ${formatLevel(level)}`}
                    {expected === undefined ? '' : ` · esperado ${formatLevel(expected)}`}
                  </span>
                </div>
              );
            })}
          </section>

          {activeAttempt ? (
            <ActiveAttemptNotice attempt={activeAttempt} simulationId={simulation.id} />
          ) : (
            <div className="sim-detail-actions">
              {startFailed ? (
                <p className="form-alert" role="alert">
                  No pudimos empezar la partida. Intenta de nuevo.
                </p>
              ) : null}
              <PixelButton
                variant="type"
                size="lg"
                block
                disabled={start.isPending || active.isPending}
                onClick={() => {
                  setStartFailed(false);
                  start.mutate();
                }}
              >
                {start.isPending ? 'Preparando…' : 'Comenzar ▶'}
              </PixelButton>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/** J6 · 409: ya hay una partida en curso de esta simulación. */
function ActiveAttemptNotice({
  attempt,
  simulationId,
}: {
  attempt: Attempt;
  simulationId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);

  const restart = useMutation({
    mutationFn: async () => {
      try {
        await abandonAttempt(attempt.id);
      } catch (error) {
        // Si ya había terminado, se puede empezar igual.
        if (!isApiError(error, 'ATTEMPT_NOT_IN_PROGRESS')) throw error;
      }
      return startAttempt(simulationId);
    },
    onSuccess: (started) => {
      void queryClient.invalidateQueries({ queryKey: ['attempts'] });
      queryClient.setQueryData(['attempt', started.attempt.id], {
        attempt: started.attempt,
        current_step: started.current_step,
        responses: [],
      });
      router.push(`/jugar/${started.attempt.id}`);
    },
    onError: () => setFailed(true),
  });

  return (
    <section className="sim-active panel" role="alert">
      <span className="sim-active-title">Ya tienes esta partida en curso</span>
      <span className="sim-active-text">
        Iniciada el {formatDate(attempt.started_at)}. Sigue donde te quedaste o empieza de cero.
      </span>
      <PixelButton href={`/jugar/${attempt.id}`} variant="type" block>
        Continuar ▶
      </PixelButton>
      <PixelButton variant="secondary" block onClick={() => setConfirming(true)}>
        Abandonar y empezar de nuevo
      </PixelButton>
      <Sheet
        open={confirming}
        onClose={() => !restart.isPending && setConfirming(false)}
        title="¿Abandonar la partida?"
        role="alertdialog"
      >
        <p className="account-note">
          La partida en curso queda como abandonada y empiezas una nueva desde el primer paso.
        </p>
        {failed ? (
          <p className="form-alert" role="alert">
            No pudimos reiniciar la partida. Intenta de nuevo.
          </p>
        ) : null}
        <PixelButton
          variant="danger"
          className="danger-confirm"
          size="lg"
          block
          disabled={restart.isPending}
          onClick={() => {
            setFailed(false);
            restart.mutate();
          }}
        >
          {restart.isPending ? 'Reiniciando…' : 'Abandonar y empezar'}
        </PixelButton>
        <PixelButton
          variant="secondary"
          block
          disabled={restart.isPending}
          onClick={() => setConfirming(false)}
        >
          Cancelar
        </PixelButton>
      </Sheet>
    </section>
  );
}
