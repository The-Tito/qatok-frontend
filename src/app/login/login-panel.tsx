'use client';

import { LoginInput, type Account } from '@qatok/shared';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, getMe, login } from '../../lib/api';
import { clearSession, readSession, saveSession } from '../../lib/session';

type Field = keyof typeof LoginInput.shape;
type FieldErrors = Partial<Record<Field, string>>;

const accountErrors: Record<string, string> = {
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  ACCOUNT_INACTIVE: 'Tu cuenta está desactivada.',
  VALIDATION_ERROR: 'Revisa el correo y la contraseña.',
};
const connectionError = 'No pudimos conectar con la API. Intenta de nuevo.';

export function LoginPanel() {
  const [account, setAccount] = useState<Account | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const saved = readSession();
    if (!saved) {
      setCheckingSession(false);
      return;
    }

    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(7000)]);
    void getMe(signal)
      .then((user) => {
        if (!controller.signal.aborted) setAccount(user);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          setMessage('Tu sesión terminó. Vuelve a entrar.');
        } else {
          setMessage('No pudimos verificar tu sesión. Intenta iniciar sesión de nuevo.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCheckingSession(false);
      });

    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const fields = new FormData(form);
    const credentials = LoginInput.safeParse({
      email: fields.get('email'),
      password: fields.get('password'),
    });
    setMessage(null);
    if (!credentials.success) {
      const errors: FieldErrors = {};
      for (const issue of credentials.error.issues) {
        if (issue.path[0] === 'email') errors.email = 'Escribe un correo electrónico válido.';
        if (issue.path[0] === 'password') {
          errors.password = 'Usa al menos 8 caracteres y hasta 72 bytes.';
        }
      }
      setFieldErrors(errors);
      const firstError = form.elements.namedItem(errors.email ? 'email' : 'password');
      if (firstError instanceof HTMLElement) firstError.focus();
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const session = await login(credentials.data, AbortSignal.timeout(7000));
      try {
        saveSession(session);
      } catch {
        setMessage(
          'El navegador no pudo guardar la sesión. Revisa los permisos de almacenamiento.',
        );
        return;
      }
      form.reset();
      setAccount(session.user);
    } catch (error) {
      setMessage(
        error instanceof ApiError
          ? (accountErrors[error.code] ?? connectionError)
          : connectionError,
      );
    } finally {
      setSubmitting(false);
    }
  }

  function signOut() {
    clearSession();
    setAccount(null);
    setMessage(null);
  }

  return (
    <section className="login-panel" aria-labelledby="login-heading">
      <h1 id="login-heading">Iniciar sesión</h1>
      {checkingSession ? (
        <p role="status">Comprobando sesión…</p>
      ) : account ? (
        <div className="login-confirmed">
          <p role="status">
            Sesión iniciada. Hola, <strong>{account.name}</strong>.
          </p>
          <button className="login-button" type="button" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleSubmit} aria-busy={submitting} noValidate>
          <div className="login-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="tu@correo.com"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              required
            />
            {fieldErrors.email && (
              <p id="email-error" className="login-error">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              required
            />
            {fieldErrors.password && (
              <p id="password-error" className="login-error">
                {fieldErrors.password}
              </p>
            )}
          </div>
          {message && (
            <p className="login-alert" role="alert">
              {message}
            </p>
          )}
          <button className="login-button" type="submit" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      )}
      <Link href="/" className="login-health-link">
        Estado de la API
      </Link>
    </section>
  );
}
