import { Account } from '@qatok/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readSession, saveSession } from '../session';
import { ANA, installMemoryStorage } from '../test-utils';
import { apiUrl, request, setUnauthorizedHandler } from './client';
import { ApiError, ContractError } from './errors';

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function headersOf(call: number) {
  return fetchMock.mock.calls[call]![1]!.headers as Record<string, string>;
}

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  installMemoryStorage();
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test/api/');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  setUnauthorizedHandler(null);
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('apiUrl', () => {
  it('une la base sin barras dobles y omite parámetros vacíos', () => {
    expect(apiUrl('/simulations', { search: 'correo', skill_id: undefined, limit: 20 })).toBe(
      'http://api.test/api/simulations?search=correo&limit=20',
    );
  });
});

describe('request', () => {
  it('valida la respuesta con el esquema y manda el token de la sesión', async () => {
    saveSession({ user: ANA, token: 'jwt-ana' });
    fetchMock.mockResolvedValueOnce(json(200, ANA));

    const result = await request('/me', { schema: Account });

    expect(result.email).toBe('ana.lopez@ejemplo.com');
    expect(fetchMock.mock.calls[0]![0]).toBe('http://api.test/api/me');
    expect(headersOf(0).Authorization).toBe('Bearer jwt-ana');
  });

  it('no manda token cuando auth es false y serializa el cuerpo', async () => {
    saveSession({ user: ANA, token: 'jwt-ana' });
    fetchMock.mockResolvedValueOnce(json(200, ANA));
    await request('/auth/login', { method: 'POST', body: { a: 1 }, schema: Account, auth: false });
    expect(headersOf(0).Authorization).toBeUndefined();
    expect(headersOf(0)['Content-Type']).toBe('application/json');
    expect(fetchMock.mock.calls[0]![1]!.body).toBe('{"a":1}');
  });

  it('convierte el cuerpo de error en ApiError con code, message y details', async () => {
    fetchMock.mockResolvedValueOnce(
      json(409, {
        error: {
          code: 'ACTIVE_ATTEMPT_EXISTS',
          message: 'Attempt in progress',
          details: { attempt_id: 'x' },
        },
      }),
    );
    const error: unknown = await request('/attempts', { method: 'POST', body: {} }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      code: 'ACTIVE_ATTEMPT_EXISTS',
      message: 'Attempt in progress',
      details: { attempt_id: 'x' },
    });
  });

  it('usa UNKNOWN si el cuerpo de error no tiene la forma del contrato', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>', { status: 502 }));
    await expect(request('/me')).rejects.toMatchObject({ status: 502, code: 'UNKNOWN' });
  });

  it('un fallo de red es ApiError NETWORK con status 0', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(request('/me')).rejects.toMatchObject({ status: 0, code: 'NETWORK' });
  });

  it('una cancelación se propaga tal cual, no como error de red', async () => {
    const controller = new AbortController();
    controller.abort();
    const abort = new DOMException('Aborted', 'AbortError');
    fetchMock.mockRejectedValueOnce(abort);
    await expect(request('/me', { signal: controller.signal })).rejects.toBe(abort);
  });

  it('una respuesta fuera del contrato lanza ContractError', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockResolvedValueOnce(json(200, { id: 'no-es-uuid' }));
    await expect(request('/me', { schema: Account })).rejects.toBeInstanceOf(ContractError);
  });

  it('un 204 devuelve undefined', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(request('/algo', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('un 401 con sesión borra la sesión y avisa al manejador', async () => {
    saveSession({ user: ANA, token: 'vencido' });
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValueOnce(
      json(401, { error: { code: 'UNAUTHENTICATED', message: 'Expired' } }),
    );

    await expect(request('/me')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(readSession()).toBeNull();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('un 401 sin sesión (credenciales malas) no cierra nada', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValueOnce(
      json(401, { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid' } }),
    );
    await expect(
      request('/auth/login', { method: 'POST', body: {}, auth: false }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(handler).not.toHaveBeenCalled();
  });
});
