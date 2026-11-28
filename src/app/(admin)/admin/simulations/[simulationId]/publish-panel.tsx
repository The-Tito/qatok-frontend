'use client';

import type { AdminSimulation, SimulationStep } from '@qatok/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PixelButton } from '../../../../../components/PixelButton';
import { Sheet } from '../../../../../components/Sheet';
import { isApiError, publishSimulation } from '../../../../../lib/api';
import { OPTION_LETTERS, publishChecklist } from '../../../../../lib/content';

const PUBLISH_ERRORS: Record<string, string> = {
  MISSING_CONTENT: 'Guarda el contenido antes de publicar.',
  INCOMPLETE_CONTENT:
    'Falta contenido: cada paso necesita opciones, cada opción una consecuencia y la simulación una habilidad.',
  INVALID_BRANCHES:
    'Las rutas no son válidas: revisa el paso inicial, los ciclos y los pasos inalcanzables.',
  STALE_CONTENT_VERSION: 'Alguien guardó otra versión del borrador. Recarga y vuelve a intentar.',
  SIMULATION_NOT_EDITABLE: 'La simulación ya no es un borrador.',
  CONTENT_ID_CONFLICT: 'Un paso u opción usa un identificador de otra versión publicada.',
};

const PUBLISH_REASONS: ReadonlyMap<unknown, string> = new Map([
  ['NO_SKILLS', 'Asigna al menos una habilidad a la simulación.'],
  ['NO_STEPS', 'Agrega al menos un paso.'],
  ['STEP_WITHOUT_OPTIONS', 'Agrega al menos una opción al paso.'],
  ['OPTION_WITHOUT_CONSEQUENCES', 'Agrega al menos una consecuencia a la opción.'],
  ['MISSING_START_STEP', 'Falta el paso inicial.'],
  ['CYCLE', 'La opción cierra un ciclo.'],
  ['TARGET_OUTSIDE_SIMULATION', 'La opción apunta a un paso que no pertenece a esta simulación.'],
  ['UNREACHABLE_STEP', 'No se llega a este paso desde el inicio.'],
]);

function publishErrorMessage(failure: unknown, steps: SimulationStep[]) {
  const fallback = 'No pudimos publicar. Intenta de nuevo.';
  if (!isApiError(failure)) return fallback;

  if (isApiError(failure, 'INCOMPLETE_CONTENT', 'INVALID_BRANCHES')) {
    const message = PUBLISH_REASONS.get(failure.details?.reason);
    if (message) {
      const stepIndex = steps.findIndex((step) => step.id === failure.details?.step_id);
      const step = steps[stepIndex];
      if (!step) return message;

      const optionIndex = step.options.findIndex(
        (option) => option.id === failure.details?.option_id,
      );
      const option =
        optionIndex < 0 ? '' : ` · opción ${OPTION_LETTERS[optionIndex] ?? optionIndex + 1}`;
      return `Paso ${stepIndex + 1}${option}. ${message}`;
    }
  }

  return Object.hasOwn(PUBLISH_ERRORS, failure.code)
    ? (PUBLISH_ERRORS[failure.code] ?? fallback)
    : fallback;
}

/** «Antes de publicar» y «Publicar ▶» (AdminEditorV2, issue 6.3). */
export function PublishPanel({
  simulation,
  version,
  steps,
  dirty,
}: {
  simulation: AdminSimulation;
  version: number | null;
  steps: SimulationStep[];
  dirty: boolean;
}) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checks = publishChecklist(steps, {
    hasSkills: simulation.skills.length > 0,
    saved: !dirty && version !== null,
  });
  const ready = checks.every((check) => check.ok);

  const publish = useMutation({
    mutationFn: () => publishSimulation(simulation.id, version!),
    onSuccess: () => {
      setConfirming(false);
      void queryClient.invalidateQueries({ queryKey: ['admin-simulation', simulation.id] });
      void queryClient.invalidateQueries({ queryKey: ['admin-simulations'] });
      void queryClient.invalidateQueries({ queryKey: ['simulations'] });
    },
    onError: (failure) => {
      setConfirming(false);
      setError(publishErrorMessage(failure, steps));
    },
  });

  return (
    <section className="admin-form panel" aria-labelledby="antes-de-publicar">
      <h2 id="antes-de-publicar" className="profile-heading">
        Antes de publicar
      </h2>
      <ul className="publish-checks">
        {checks.map((check) => (
          <li key={check.label} data-ok={check.ok || undefined}>
            <span aria-hidden="true">{check.ok ? '✓' : '✕'}</span>
            <span>
              {check.label}
              <span className="sr-only">{check.ok ? ' (listo)' : ' (falta)'}</span>
            </span>
          </li>
        ))}
      </ul>
      {error ? (
        <p className="form-alert" role="alert">
          {error}
        </p>
      ) : null}
      <PixelButton
        size="lg"
        block
        disabled={!ready || publish.isPending}
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
      >
        Publicar ▶
      </PixelButton>
      <Sheet
        open={confirming}
        onClose={() => !publish.isPending && setConfirming(false)}
        title="¿Publicar la simulación?"
        role="alertdialog"
      >
        <p className="account-note">
          «{simulation.title}» aparecerá en el catálogo de estudiantes con la versión {version}.
          Después ya no se puede editar: solo desactivar.
        </p>
        <PixelButton size="lg" block disabled={publish.isPending} onClick={() => publish.mutate()}>
          {publish.isPending ? 'Publicando…' : 'Sí, publicar'}
        </PixelButton>
        <PixelButton
          variant="secondary"
          block
          disabled={publish.isPending}
          onClick={() => setConfirming(false)}
        >
          Cancelar
        </PixelButton>
      </Sheet>
    </section>
  );
}
