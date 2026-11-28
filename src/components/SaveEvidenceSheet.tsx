'use client';

import type { Attempt } from '@qatok/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createEvidence, getEvidence, isApiError } from '../lib/api';
import { formatDate } from '../lib/format';
import type { SkillTypeKey } from '../lib/skill-types';
import { Field } from './Field';
import { PixelButton } from './PixelButton';
import { Sheet } from './Sheet';
import './save-evidence.css';

const formatScore = (score: number) => String(Math.round(score * 10) / 10);

/**
 * J7 · Guardar como evidencia (POST /api/evidence; 409 EVIDENCE_ALREADY_EXISTS). Se abre al
 * terminar la partida y desde su recorrido en el perfil, si aún no es evidencia.
 */
export function SaveEvidenceSheet({
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
  const [title, setTitle] = useState('');
  const [existingId, setExistingId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const existing = useQuery({
    queryKey: ['evidence', existingId],
    queryFn: ({ signal }) => getEvidence(existingId!, signal),
    enabled: Boolean(existingId),
    retry: false,
  });

  const save = useMutation({
    mutationFn: () => createEvidence({ attempt_id: attempt.id, title: title.trim() || undefined }),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.push(`/evidence/${created.evidence.id}`);
    },
    onError: (error) => {
      const id = isApiError(error, 'EVIDENCE_ALREADY_EXISTS') ? error.details?.evidence_id : null;
      if (typeof id === 'string') setExistingId(id);
      else setFailed(true);
    },
  });

  const finishedAt = attempt.finished_at ?? attempt.started_at;

  return (
    <Sheet
      open={open}
      onClose={() => !save.isPending && onClose()}
      title="Guardar como evidencia"
      type={type}
    >
      <div className="save-evidence-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sprites/trophy.svg" alt="" width={32} height={32} />
        <span className="save-evidence-card-text">
          <span className="save-evidence-card-title">{simulationTitle}</span>
          <span className="save-evidence-card-label">
            {attempt.score !== null ? `Puntuación ${formatScore(attempt.score)} · ` : ''}
            {formatDate(finishedAt)}
          </span>
        </span>
      </div>
      {existingId ? (
        <>
          <div className="save-evidence-exists" role="alert">
            <span className="danger-box-tag">◆ Ya está guardada</span>
            <span>
              {existing.data
                ? `Esta partida ya es tu evidencia «${existing.data.evidence.title}».`
                : 'Esta partida ya es una de tus evidencias.'}
            </span>
          </div>
          <PixelButton href={`/evidence/${existingId}`} variant="type" size="lg" block>
            Ver evidencia ▶
          </PixelButton>
          <PixelButton variant="secondary" block onClick={onClose}>
            Cerrar
          </PixelButton>
        </>
      ) : (
        <>
          <Field
            label="Título (opcional)"
            type="text"
            maxLength={150}
            placeholder={simulationTitle}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            hint={
              <span className="save-evidence-hint">
                <span>Si lo dejas vacío, usamos el título de la simulación.</span>
                <span className="save-evidence-counter">{title.length}/150</span>
              </span>
            }
          />
          <p className="account-note">
            Guardamos una copia de tus decisiones tal como quedaron. Nace privada: tú decides si la
            compartes.
          </p>
          {failed ? (
            <p className="form-alert" role="alert">
              No pudimos guardar la evidencia. Intenta de nuevo.
            </p>
          ) : null}
          <PixelButton
            variant="type"
            size="lg"
            block
            disabled={save.isPending}
            onClick={() => {
              setFailed(false);
              save.mutate();
            }}
          >
            {save.isPending ? 'Guardando…' : 'Guardar evidencia ▶'}
          </PixelButton>
        </>
      )}
    </Sheet>
  );
}
