// Cuenta y sesión (contrato: F1 · /api/auth y /api/me).
import {
  Account,
  Deletion,
  LoginInput,
  RegisterInput,
  Registration,
  Session,
  UpdateAccountInput,
} from '@qatok/shared';
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

export function updateMe(input: z.output<typeof UpdateAccountInput>) {
  return request('/me', { method: 'PATCH', body: input, schema: Account });
}

export function deleteMe() {
  return request('/me', { method: 'DELETE', schema: Deletion });
}
