// Cuenta y sesión (contrato: F1 · /api/auth y /api/me).
import { Account, LoginInput, RegisterInput, Registration, Session } from '@qatok/shared';
import type { z } from 'zod';
import { request } from './client';

export function login(input: z.output<typeof LoginInput>, signal?: AbortSignal) {
  return request('/auth/login', {
    method: 'POST',
    body: input,
    schema: Session,
    auth: false,
    signal,
  });
}

export function register(input: z.output<typeof RegisterInput>, signal?: AbortSignal) {
  return request('/auth/register', {
    method: 'POST',
    body: input,
    schema: Registration,
    auth: false,
    signal,
  });
}

export function getMe(signal?: AbortSignal) {
  return request('/me', { schema: Account, signal });
}
