import { Account, ErrorRespuesta, LoginInput, Salud, Session } from '@qatok/shared';
import type { z } from 'zod';

function apiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error('Configura NEXT_PUBLIC_API_URL para consultar la API.');
  return `${baseUrl.replace(/\/+$/, '')}${path}`;
}

export class AccountApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
    this.name = 'AccountApiError';
  }
}

async function requestAccount<Schema extends z.ZodType>(
  path: string,
  schema: Schema,
  options: RequestInit,
): Promise<z.output<Schema>> {
  const response = await fetch(apiUrl(path), { ...options, cache: 'no-store' });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const parsed = ErrorRespuesta.safeParse(data);
    throw new AccountApiError(response.status, parsed.success ? parsed.data.error.code : 'UNKNOWN');
  }
  return schema.parse(data);
}

export function login(input: z.output<typeof LoginInput>, signal: AbortSignal) {
  return requestAccount('/auth/login', Session, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  });
}

export function getCurrentAccount(token: string, signal: AbortSignal) {
  return requestAccount('/me', Account, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
}

export async function getHealth(signal: AbortSignal): Promise<Salud> {
  const response = await fetch(apiUrl('/health'), {
    cache: 'no-store',
    signal,
  });
  if (response.status !== 200 && response.status !== 503) {
    throw new Error('La API devolvió un estado de conexión inesperado.');
  }

  const health = Salud.parse(await response.json());
  if ((response.status === 200) !== (health.estado === 'OK')) {
    throw new Error('El estado HTTP no coincide con la respuesta de salud.');
  }

  return health;
}
