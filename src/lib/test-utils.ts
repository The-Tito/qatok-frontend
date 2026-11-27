// Solo para pruebas de Vitest (entorno node): localStorage en memoria y datos del dataset.

export function installMemoryStorage(): Storage {
  const data = new Map<string, string>();
  const storage: Storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
    clear: () => data.clear(),
    key: (index) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  return storage;
}

/** Ana López, del dataset del backend. */
export const ANA = {
  id: 'e0000000-0000-4000-8000-000000000101',
  name: 'Ana López',
  email: 'ana.lopez@ejemplo.com',
  role: 'STUDENT' as const,
  status: 'ACTIVE' as const,
  registered_at: '2026-01-10T10:00:00.000Z',
};
