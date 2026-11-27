'use client';

import { RegisterInput } from '@qatok/shared';
import Link from 'next/link';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Field } from '../../../components/Field';
import { PixelButton } from '../../../components/PixelButton';
import { fieldErrors, isApiError, register } from '../../../lib/api';
import { LOGIN_PATH } from '../../../lib/routes';
import { saveSession } from '../../../lib/session';
import { useAuthRedirect } from '../use-auth-redirect';

const FIELDS = ['name', 'email', 'password'] as const;
type FieldName = (typeof FIELDS)[number];
type FieldErrors = Partial<Record<FieldName, ReactNode>>;

const fieldTexts: Record<FieldName, string> = {
  name: 'Escribe tu nombre (hasta 100 caracteres).',
  email: 'Escribe un correo electrónico válido.',
  password: 'Usa al menos 8 caracteres y hasta 72 bytes.',
};

export function RegisterForm() {
  const { goHome } = useAuthRedirect();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };

  function showFieldErrors(found: FieldErrors) {
    setErrors(found);
    const first = FIELDS.find((name) => found[name]);
    if (first) refs[first].current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const fields = new FormData(event.currentTarget);
    const input = RegisterInput.safeParse({
      name: String(fields.get('name') ?? '').trim(),
      email: fields.get('email'),
      password: fields.get('password'),
    });
    setMessage(null);
    if (!input.success) {
      const found: FieldErrors = {};
      for (const issue of input.error.issues) {
        const name = issue.path[0];
        if (name === 'name' || name === 'email' || name === 'password') {
          found[name] = fieldTexts[name];
        }
      }
      showFieldErrors(found);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const { user, token } = await register(input.data, AbortSignal.timeout(10_000));
      saveSession({ user, token });
      goHome({ user, token });
    } catch (error) {
      const apiFields = fieldErrors(error);
      if (isApiError(error, 'EMAIL_ALREADY_REGISTERED')) {
        showFieldErrors({
          email: (
            <>
              Este correo ya tiene una cuenta. <Link href={LOGIN_PATH}>Entrar</Link>
            </>
          ),
        });
      } else if (Object.keys(apiFields).length > 0) {
        const found: FieldErrors = {};
        for (const name of FIELDS) if (name in apiFields) found[name] = fieldTexts[name];
        showFieldErrors(found);
      } else {
        setMessage('No pudimos crear la cuenta. Intenta de nuevo en unos segundos.');
      }
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} aria-busy={submitting} noValidate>
      <Field
        ref={refs.name}
        label="Nombre"
        name="name"
        type="text"
        autoComplete="name"
        maxLength={100}
        error={errors.name}
        required
      />
      <Field
        ref={refs.email}
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        error={errors.email}
        required
      />
      <Field
        ref={refs.password}
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="Mínimo 8 caracteres."
        error={errors.password}
        required
      />
      {message ? (
        <p className="form-alert" role="alert">
          {message}
        </p>
      ) : null}
      <PixelButton type="submit" block disabled={submitting}>
        {submitting ? 'Creando…' : 'Crear cuenta ▶'}
      </PixelButton>
    </form>
  );
}
