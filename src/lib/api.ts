import { Salud } from '@qatok/shared';

export async function getHealth(signal: AbortSignal): Promise<Salud> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error('Configura NEXT_PUBLIC_API_URL para consultar la API.');

  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/health`, {
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
