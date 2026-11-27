'use client';

import { LoginInput } from '@qatok/shared';
import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { Field } from '../../../components/Field';
import { PixelButton } from '../../../components/PixelButton';
import { errorMessage, fieldErrors, isApiError, login } from '../../../lib/api';
import { REGISTER_PATH } from '../../../lib/routes';
import { saveSession } from '../../../lib/session';
import { useAuthRedirect } from '../use-auth-redirect';

type FieldName = 'email' | 'password';
type FieldErrors = Partial<Record<FieldName, string>>;

const fieldTexts: Record<FieldName, string> = {
  email: 'Escribe un correo electrónico válido.',
  password: 'Usa al menos 8 caracteres y hasta 72 bytes.',
};

export function LoginForm() {
  const { session, next, goHome } = useAuthRedirect();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function showFieldErrors(found: FieldErrors) {
    setErrors(found);
    (found.email ? emailRef : passwordRef).current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const fields = new FormData(event.currentTarget);
    const credentials = LoginInput.safeParse({
      email: fields.get('email'),
      password: fields.get('password'),
    });
    setMessage(null);
    if (!credentials.success) {
      const found: FieldErrors = {};
      for (const issue of credentials.error.issues) {
        const name = issue.path[0];
        if (name === 'email' || name === 'password') found[name] = fieldTexts[name];
      }
      showFieldErrors(found);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const saved = await login(credentials.data, AbortSignal.timeout(10_000));
      saveSession(saved);
      goHome(saved);
    } catch (error) {
      const apiFields = fieldErrors(error);
      if (Object.keys(apiFields).length > 0) {
        const found: FieldErrors = {};
        for (const name of ['email', 'password'] as const) {
          if (name in apiFields) found[name] = fieldTexts[name];
        }
        showFieldErrors(found);
      } else if (isApiError(error, 'INVALID_CREDENTIALS', 'ACCOUNT_INACTIVE')) {
        setMessage(errorMessage(error));
        passwordRef.current?.select();
      } else {
        setMessage('No pudimos conectar con la API. Intenta de nuevo.');
      }
      setSubmitting(false);
    }
  }

  const sessionExpired = next !== null && !session;

  return (
    <form className="auth-form" onSubmit={handleSubmit} aria-busy={submitting} noValidate>
      <div className="auth-form-head">
        <h2 className="auth-form-title">Entrar</h2>
        <span className="auth-form-tag" aria-hidden="true">
          Player 1
        </span>
      </div>
      {sessionExpired ? (
        <p className="auth-notice" role="status">
          Entra para seguir donde te quedaste.
        </p>
      ) : null}
      <Field
        ref={emailRef}
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="tu@correo.com"
        error={errors.email}
        required
      />
      <Field
        ref={passwordRef}
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        error={errors.password}
        required
      />
      {message ? (
        <p className="form-alert" role="alert">
          {message}
        </p>
      ) : null}
      <PixelButton type="submit" block disabled={submitting}>
        {submitting ? 'Entrando…' : 'Entrar ▶'}
      </PixelButton>
      <p className="auth-switch">
        ¿Primera vez? <Link href={REGISTER_PATH}>Crear cuenta</Link>
      </p>
    </form>
  );
}
