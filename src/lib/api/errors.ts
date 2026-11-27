// Errores de la API: se decide siempre por `code`, nunca por el texto (03 · Errores por code).
import type { z } from 'zod';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** La API respondió 2xx pero con una forma distinta al contrato: es un error del sistema. */
export class ContractError extends Error {
  constructor(
    readonly path: string,
    readonly issues: z.ZodError,
  ) {
    super(`La respuesta de ${path} no coincide con el contrato.`);
    this.name = 'ContractError';
  }
}

export const GENERIC_ERROR =
  'No pudimos cargar esta pantalla. Lo que ya guardaste está a salvo. Intenta de nuevo.';

const messages: Record<string, string> = {
  VALIDATION_ERROR: 'Revisa los campos marcados.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  UNAUTHENTICATED: 'Tu sesión terminó. Vuelve a entrar.',
  ACCOUNT_INACTIVE: 'Tu cuenta está desactivada.',
  FORBIDDEN: 'Esta zona es para administración.',
  NOT_FOUND: 'Esto ya no está disponible.',
  EMAIL_ALREADY_REGISTERED: 'Ese correo ya tiene una cuenta.',
  ACTIVE_ATTEMPT_EXISTS: 'Ya tienes esta partida en curso.',
  SIMULATION_NOT_PUBLISHED: 'Esta simulación ya no está disponible.',
  STALE_CONTENT_VERSION: 'Alguien guardó otra versión del borrador.',
  SIMULATION_NOT_EDITABLE: 'La simulación cambió de estado.',
  SKILL_ALREADY_EXISTS: 'Ya existe una habilidad con ese nombre.',
  SKILL_IN_USE: 'La habilidad está asignada a una simulación.',
  SKILL_NOT_FOUND: 'Esa habilidad ya no existe. Recarga la lista.',
  PAYLOAD_TOO_LARGE: 'El escenario es demasiado grande.',
};

/** Texto para el usuario. Los errores de red, 5xx, de contrato o desconocidos dan el genérico. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return messages[error.code] ?? GENERIC_ERROR;
  return GENERIC_ERROR;
}

export function isApiError(error: unknown, ...codes: string[]): error is ApiError {
  return error instanceof ApiError && (codes.length === 0 || codes.includes(error.code));
}

/**
 * Campos con error de un VALIDATION_ERROR: details.fields = [{ field, message }].
 * Devuelve { campo: mensaje de la API } (en inglés): la pantalla muestra su propio texto por campo.
 */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!isApiError(error, 'VALIDATION_ERROR')) return {};
  const fields = error.details?.fields;
  if (!Array.isArray(fields)) return {};
  const result: Record<string, string> = {};
  for (const item of fields as unknown[]) {
    if (!item || typeof item !== 'object') continue;
    const { field, message } = item as { field?: unknown; message?: unknown };
    if (typeof field === 'string' && !(field in result)) {
      result[field] = typeof message === 'string' ? message : '';
    }
  }
  return result;
}
