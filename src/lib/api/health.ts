// Salud de la API (GET /api/health): 200 si todo está bien, 503 si alguna base falla.
import { Salud } from '@qatok/shared';
import { apiUrl } from './client';

export async function getHealth(signal: AbortSignal): Promise<Salud> {
  const response = await fetch(apiUrl('/health'), { cache: 'no-store', signal });
  if (response.status !== 200 && response.status !== 503) {
    throw new Error('La API devolvió un estado de conexión inesperado.');
  }

  const health = Salud.parse(await response.json());
  if ((response.status === 200) !== (health.estado === 'OK')) {
    throw new Error('El estado HTTP no coincide con la respuesta de salud.');
  }

  return health;
}
