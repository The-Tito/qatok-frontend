import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SESSION_KEY, clearSession, readSession, saveSession, updateSessionUser } from './session';
import { ANA, installMemoryStorage } from './test-utils';

const session = { token: 'jwt', user: ANA };

let storage: Storage;
beforeEach(() => {
  storage = installMemoryStorage();
});

describe('session', () => {
  it('guarda, lee y borra', () => {
    expect(readSession()).toBeNull();
    saveSession(session);
    expect(readSession()).toEqual(session);
    clearSession();
    expect(readSession()).toBeNull();
  });

  it('devuelve el mismo objeto mientras no cambia (para useSyncExternalStore)', () => {
    saveSession(session);
    expect(readSession()).toBe(readSession());
  });

  it('descarta una sesión dañada', () => {
    storage.setItem(SESSION_KEY, '{no es json');
    expect(readSession()).toBeNull();
    expect(storage.getItem(SESSION_KEY)).toBeNull();
    storage.setItem(SESSION_KEY, JSON.stringify({ token: '' }));
    expect(readSession()).toBeNull();
  });

  it('actualiza solo el usuario', () => {
    saveSession(session);
    updateSessionUser({ ...ANA, name: 'Ana L.' });
    expect(readSession()).toEqual({ token: 'jwt', user: { ...ANA, name: 'Ana L.' } });
  });

  it('no falla si el almacenamiento está bloqueado', () => {
    vi.spyOn(storage, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(readSession()).toBeNull();
  });
});
