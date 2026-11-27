'use client';

import type { EvidenceShare } from '@qatok/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Field } from '../../../../components/Field';
import { PixelButton } from '../../../../components/PixelButton';
import { Sheet } from '../../../../components/Sheet';
import { createShare, expiryDate, listShares, revokeShare, shareLink } from '../../../../lib/api';
import { formatDate } from '../../../../lib/format';
import type { SkillTypeKey } from '../../../../lib/skill-types';

const PRESETS = [7, 30, 90];

function shareState(share: EvidenceShare) {
  if (share.status === 'REVOKED') return { label: '✕ Revocado', tone: 'revoked' };
  if (!share.is_valid) {
    return {
      label: share.expires_at ? `○ Vencido el ${formatDate(share.expires_at)}` : '○ No válido',
      tone: 'expired',
    };
  }
  return {
    label: share.expires_at
      ? `● Activo · vence el ${formatDate(share.expires_at)}`
      : '● Activo · sin vencimiento',
    tone: 'active',
  };
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Enlaces de una evidencia (issue 5.2): lista, copiar, revocar y crear. */
export function SharesSection({ evidenceId, type }: { evidenceId: string; type: SkillTypeKey }) {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const shares = useQuery({
    queryKey: ['shares', evidenceId],
    queryFn: ({ signal }) => listShares(evidenceId, signal),
  });

  const revoke = useMutation({
    mutationFn: (shareId: string) => revokeShare(shareId),
    onSuccess: () => {
      setNotice('Enlace revocado: ya no funciona.');
      void queryClient.invalidateQueries({ queryKey: ['shares', evidenceId] });
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
    },
    onError: () => setNotice('No pudimos revocar el enlace. Intenta de nuevo.'),
  });

  const items = shares.data?.items ?? [];

  return (
    <section className="shares" aria-labelledby="enlaces">
      <h2 id="enlaces" className="profile-heading">
        Enlaces para compartir{shares.data ? ` · ${shares.data.total}` : ''}
      </h2>
      {shares.isError ? (
        <p className="form-alert" role="alert">
          No pudimos cargar los enlaces.{' '}
          <button type="button" className="link-button" onClick={() => void shares.refetch()}>
            Reintentar
          </button>
        </p>
      ) : shares.isPending ? (
        <div className="profile-placeholder" />
      ) : items.length === 0 ? (
        <p className="profile-empty">Aún no compartes esta evidencia.</p>
      ) : (
        <ul className="share-list">
          {items.map((share) => {
            const state = shareState(share);
            const usable = share.status === 'ACTIVE' && share.is_valid;
            return (
              <li key={share.id} className="share-item">
                <span className="share-text">
                  <span className="share-recipient">{share.recipient ?? 'Sin destinatario'}</span>
                  <span className="share-state" data-tone={state.tone}>
                    {state.label}
                  </span>
                </span>
                {usable ? (
                  <>
                    <button
                      type="button"
                      className="share-button"
                      onClick={async () => {
                        const ok = await copy(shareLink(share.token, window.location.origin));
                        setNotice(ok ? 'Enlace copiado.' : 'No pudimos copiar; cópialo a mano.');
                      }}
                    >
                      Copiar
                    </button>
                    <button
                      type="button"
                      className="share-button"
                      data-danger=""
                      disabled={revoke.isPending}
                      onClick={() => {
                        setNotice(null);
                        revoke.mutate(share.id);
                      }}
                    >
                      Revocar
                    </button>
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <p className="sr-status" role="status">
        {notice}
      </p>
      <PixelButton variant="type" size="lg" block onClick={() => setCreating(true)}>
        Crear enlace ▶
      </PixelButton>
      <CreateShareSheet
        open={creating}
        onClose={() => setCreating(false)}
        evidenceId={evidenceId}
        type={type}
      />
    </section>
  );
}

/** CompartirV2 · Crear enlace: vigencia de 1 a 90 días (atajos 7, 30, 90) y «Para quién». */
function CreateShareSheet({
  open,
  onClose,
  evidenceId,
  type,
}: {
  open: boolean;
  onClose: () => void;
  evidenceId: string;
  type: SkillTypeKey;
}) {
  const queryClient = useQueryClient();
  const [days, setDays] = useState(30);
  const [recipient, setRecipient] = useState('');
  const [created, setCreated] = useState<EvidenceShare | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const valid = Number.isInteger(days) && days >= 1 && days <= 90;

  const create = useMutation({
    mutationFn: () =>
      createShare(evidenceId, {
        expires_in_days: days,
        recipient: recipient.trim() || undefined,
      }),
    onSuccess: (share) => {
      setCreated(share);
      void queryClient.invalidateQueries({ queryKey: ['shares', evidenceId] });
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
    },
    onError: () => setError('No pudimos crear el enlace. Intenta de nuevo.'),
  });

  function close() {
    if (create.isPending) return;
    setCreated(null);
    setCopied(null);
    setError(null);
    setRecipient('');
    setDays(30);
    onClose();
  }

  const link = created ? shareLink(created.token, window.location.origin) : '';

  return (
    <Sheet open={open} onClose={close} title="Crear enlace" type={type}>
      {created ? (
        <>
          <div className="share-ready" role="status">
            <span className="danger-box-tag">
              ★ Enlace listo
              {created.expires_at ? ` · vence el ${formatDate(created.expires_at)}` : ''}
            </span>
            <input
              className="field-input share-link"
              readOnly
              value={link}
              aria-label="Enlace para compartir"
              onFocus={(event) => event.currentTarget.select()}
            />
          </div>
          <PixelButton
            variant="type"
            size="lg"
            block
            onClick={async () =>
              setCopied((await copy(link)) ? 'Enlace copiado.' : 'Selecciona el enlace y cópialo.')
            }
          >
            Copiar enlace
          </PixelButton>
          <p className="sr-status" role="status">
            {copied}
          </p>
          <PixelButton variant="secondary" block onClick={close}>
            Listo
          </PixelButton>
        </>
      ) : (
        <>
          <p className="account-note">
            Quien tenga el enlace podrá ver esta evidencia sin iniciar sesión. Puedes revocarlo
            cuando quieras.
          </p>
          <fieldset className="share-days">
            <legend className="field-label">Vigencia</legend>
            <div className="share-days-row">
              <label className="share-days-input">
                <span className="profile-heading">Días</span>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={Number.isNaN(days) ? '' : days}
                  aria-label="Días de vigencia, de 1 a 90"
                  aria-invalid={!valid || undefined}
                  onChange={(event) => setDays(event.target.valueAsNumber)}
                />
              </label>
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="filter-chip share-preset"
                  aria-pressed={days === preset}
                  onClick={() => setDays(preset)}
                >
                  {preset} días
                </button>
              ))}
            </div>
            <p className="field-message" data-error={valid ? undefined : ''}>
              {valid
                ? `De 1 a 90 días. Vence el ${formatDate(expiryDate(days).toISOString())}.`
                : 'Escribe un número de días entre 1 y 90.'}
            </p>
          </fieldset>
          <Field
            label="Para quién (opcional)"
            type="text"
            maxLength={150}
            placeholder="Ej.: reclutamiento de la empresa"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            hint="Solo es una nota para ti; no se envía nada."
          />
          {error ? (
            <p className="form-alert" role="alert">
              {error}
            </p>
          ) : null}
          <PixelButton
            variant="type"
            size="lg"
            block
            disabled={!valid || create.isPending}
            onClick={() => {
              setError(null);
              create.mutate();
            }}
          >
            {create.isPending ? 'Creando…' : 'Crear enlace ▶'}
          </PixelButton>
        </>
      )}
    </Sheet>
  );
}
