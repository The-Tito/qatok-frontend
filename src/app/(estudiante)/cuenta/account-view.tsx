'use client';

import { UpdateAccountInput, type Account } from '@qatok/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useId, useRef, useState, type FormEvent } from 'react';
import { Field } from '../../../components/Field';
import { PageHeader } from '../../../components/PageHeader';
import { PixelButton } from '../../../components/PixelButton';
import { Sheet } from '../../../components/Sheet';
import { LoadingCard, StateCard } from '../../../components/StateCard';
import {
  deleteMe,
  getMe,
  isApiError,
  listAttempts,
  listEvidence,
  updateMe,
} from '../../../lib/api';
import { formatDate, plural } from '../../../lib/format';
import { LOGIN_PATH } from '../../../lib/routes';
import { clearSession, updateSessionUser } from '../../../lib/session';
import { useSession } from '../../../lib/use-session';
import { useSignOut } from '../../../lib/use-sign-out';

const NAME_ERROR = 'Escribe un nombre de 1 a 100 caracteres.';

export function AccountView() {
  const session = useSession();
  const userId = session?.user.id;
  const me = useQuery({
    queryKey: ['me', userId],
    queryFn: ({ signal }) => getMe(signal),
    enabled: Boolean(userId),
    staleTime: Infinity,
  });
  const signOut = useSignOut();
  const [deleting, setDeleting] = useState(false);

  if (me.isError) {
    return (
      <StateCard
        kind="error"
        title="No pudimos cargar tu cuenta"
        message="Lo que ya guardaste está a salvo. Intenta de nuevo en unos segundos."
        action={{ label: 'Reintentar', onClick: () => void me.refetch() }}
      />
    );
  }
  if (!me.data) return <LoadingCard />;
  const account = me.data;

  return (
    <div className="account">
      <PageHeader
        title="Mi cuenta"
        eyebrow="Tu cuenta"
        back={{ href: '/perfil', label: 'Perfil' }}
      />
      <div className="account-body">
        <div className="account-grid">
          <NameForm account={account} />
          <div className="account-facts">
            <dl className="account-data">
              <div>
                <dt>Correo</dt>
                <dd>{account.email}</dd>
              </div>
              <div>
                <dt>Cuenta creada</dt>
                <dd>
                  <time dateTime={account.registered_at}>{formatDate(account.registered_at)}</time>
                </dd>
              </div>
            </dl>
            <p className="account-note">El correo no se puede cambiar desde aquí.</p>
          </div>
        </div>
        <div className="account-actions">
          <PixelButton variant="secondary" onClick={signOut}>
            Salir
          </PixelButton>
          <PixelButton
            variant="danger"
            className="account-delete"
            onClick={() => setDeleting(true)}
          >
            Eliminar cuenta
          </PixelButton>
        </div>
      </div>
      <DeleteAccountSheet
        open={deleting}
        email={account.email}
        onClose={() => setDeleting(false)}
      />
    </div>
  );
}

function NameForm({ account }: { account: Account }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      queryClient.setQueryData(['me', updated.id], updated);
      updateSessionUser(updated);
      setStatus('Nombre guardado.');
    },
    onError: (failure) => {
      setError(
        isApiError(failure, 'VALIDATION_ERROR')
          ? NAME_ERROR
          : 'No pudimos guardar el nombre. Intenta de nuevo.',
      );
      inputRef.current?.focus();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const input = UpdateAccountInput.safeParse({
      name: String(new FormData(event.currentTarget).get('name') ?? ''),
    });
    if (!input.success || !input.data.name) {
      setError(NAME_ERROR);
      inputRef.current?.focus();
      return;
    }
    setError(null);
    if (input.data.name === account.name) {
      setStatus('El nombre no cambió.');
      return;
    }
    save.mutate(input.data);
  }

  return (
    <form className="account-form panel" onSubmit={handleSubmit} noValidate>
      <Field
        ref={inputRef}
        label="Nombre"
        name="name"
        type="text"
        autoComplete="name"
        defaultValue={account.name}
        maxLength={100}
        hint="De 1 a 100 caracteres. Así apareces en tus evidencias compartidas."
        error={error ?? undefined}
        required
      />
      {status ? (
        <p className="account-status" role="status">
          {status}
        </p>
      ) : null}
      <PixelButton type="submit" block disabled={save.isPending}>
        {save.isPending ? 'Guardando…' : 'Guardar nombre'}
      </PixelButton>
    </form>
  );
}

function DeleteAccountSheet({
  open,
  email,
  onClose,
}: {
  open: boolean;
  email: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const helpId = useId();
  const [typed, setTyped] = useState('');
  const [failed, setFailed] = useState(false);
  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  // Lo que se pierde: partidas, evidencias y enlaces activos (sumados de cada evidencia).
  const attempts = useQuery({
    queryKey: ['attempts', 'count'],
    queryFn: ({ signal }) => listAttempts({ limit: 1 }, signal),
    enabled: open,
  });
  const evidence = useQuery({
    queryKey: ['evidence', 'all'],
    queryFn: ({ signal }) => listEvidence({ limit: 100 }, signal),
    enabled: open,
  });
  const activeLinks = evidence.data?.items.reduce((sum, item) => sum + item.active_shares, 0);

  const remove = useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      clearSession({ signOut: true });
      queryClient.clear();
      router.replace(LOGIN_PATH);
    },
    onError: () => setFailed(true),
  });

  function close() {
    if (remove.isPending) return;
    setTyped('');
    setFailed(false);
    onClose();
  }

  return (
    <Sheet open={open} onClose={close} title="Eliminar tu cuenta" role="alertdialog">
      <div className="danger-box">
        <span className="danger-box-tag">✕ No se puede deshacer</span>
        <ul>
          <li>
            Se borran tu perfil
            {attempts.data && evidence.data
              ? `, ${plural(attempts.data.total, 'partida')} y ${plural(evidence.data.total, 'evidencia')}.`
              : ', tus partidas y tus evidencias.'}
          </li>
          <li>
            {activeLinks === undefined
              ? 'Los enlaces de tus evidencias dejan de funcionar.'
              : activeLinks === 0
                ? 'No tienes enlaces activos.'
                : `${activeLinks === 1 ? 'El enlace activo deja' : `Los ${activeLinks} enlaces activos dejan`} de funcionar.`}
          </li>
        </ul>
      </div>
      <Field
        label="Escribe tu correo para confirmar"
        type="email"
        autoComplete="off"
        placeholder={email}
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
      />
      {failed ? (
        <p className="form-alert" role="alert">
          No pudimos eliminar la cuenta. Intenta de nuevo.
        </p>
      ) : null}
      <PixelButton
        variant="danger"
        size="lg"
        block
        className="danger-confirm"
        disabled={!matches || remove.isPending}
        aria-describedby={helpId}
        onClick={() => remove.mutate()}
      >
        {remove.isPending ? 'Eliminando…' : 'Eliminar mi cuenta'}
      </PixelButton>
      <p id={helpId} className="account-note">
        Se activa cuando el correo coincide.
      </p>
      <PixelButton variant="secondary" block onClick={close}>
        Cancelar
      </PixelButton>
    </Sheet>
  );
}
