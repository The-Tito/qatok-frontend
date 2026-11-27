// Cliente único de la API (03 · Cliente). Todas las llamadas pasan por request().
import { ErrorRespuesta } from '@qatok/shared';
import type { z } from 'zod';
import { clearSession, readSession } from '../session';
import { ApiError, ContractError } from './errors';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestOptions<Schema extends z.ZodType | undefined> {
  method?: Method;
  body?: unknown;
  /** Esquema de @qatok/shared para validar la respuesta 2xx. Sin esquema se espera 204. */
  schema?: Schema;
  /** true (por defecto): envía el token guardado y trata un 401 como sesión vencida. */
  auth?: boolean;
  /** Parámetros de consulta; los valores undefined se omiten. */
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

type Result<Schema extends z.ZodType | undefined> = Schema extends z.ZodType
  ? z.output<Schema>
  : undefined;

let unauthorizedHandler: (() => void) | null = null;

/** Lo registra el proveedor de la app: limpia la caché y lleva a la pantalla de entrar. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function apiUrl(path: string, query?: RequestOptions<undefined>['query']) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error('Configura NEXT_PUBLIC_API_URL para consultar la API.');
  const url = `${baseUrl.replace(/\/+$/, '')}${path}`;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

export async function request<Schema extends z.ZodType | undefined = undefined>(
  path: string,
  options: RequestOptions<Schema> = {},
): Promise<Result<Schema>> {
  const { method = 'GET', body, schema, auth = true, query, signal } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = auth ? readSession()?.token : undefined;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(apiUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
      signal,
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    throw new ApiError(0, 'NETWORK', 'No pudimos conectar con la API.');
  }

  const data: unknown =
    response.status === 204 ? undefined : await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = ErrorRespuesta.safeParse(data);
    const error = parsed.success
      ? new ApiError(
          response.status,
          parsed.data.error.code,
          parsed.data.error.message,
          parsed.data.error.details,
        )
      : new ApiError(response.status, 'UNKNOWN', `La API respondió ${response.status}.`);
    if (response.status === 401 && token) {
      clearSession();
      unauthorizedHandler?.();
    }
    throw error;
  }

  if (!schema) return undefined as Result<Schema>;
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.error(`Respuesta de ${method} ${path} fuera del contrato`, parsed.error.issues);
    throw new ContractError(path, parsed.error);
  }
  return parsed.data as Result<Schema>;
}
