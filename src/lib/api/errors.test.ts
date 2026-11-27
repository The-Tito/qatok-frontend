import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import {
  ApiError,
  ContractError,
  GENERIC_ERROR,
  errorMessage,
  fieldErrors,
  isApiError,
} from './errors';

describe('errorMessage', () => {
  it('da el texto del code conocido', () => {
    expect(errorMessage(new ApiError(401, 'INVALID_CREDENTIALS', 'x'))).toBe(
      'Correo o contraseña incorrectos.',
    );
  });

  it('usa el genérico para code desconocido, red, 5xx y contrato', () => {
    const contract = new ContractError('/me', z.string().safeParse(1).error!);
    expect(errorMessage(new ApiError(418, 'TEAPOT', 'x'))).toBe(GENERIC_ERROR);
    expect(errorMessage(new ApiError(0, 'NETWORK', 'x'))).toBe(GENERIC_ERROR);
    expect(errorMessage(new ApiError(503, 'DATABASE_UNAVAILABLE', 'x'))).toBe(GENERIC_ERROR);
    expect(errorMessage(new Error('boom'))).toBe(GENERIC_ERROR);
    expect(errorMessage(contract)).toBe(GENERIC_ERROR);
  });
});

describe('isApiError', () => {
  it('filtra por code', () => {
    const error = new ApiError(409, 'SKILL_IN_USE', 'x');
    expect(isApiError(error)).toBe(true);
    expect(isApiError(error, 'SKILL_IN_USE', 'NOT_FOUND')).toBe(true);
    expect(isApiError(error, 'NOT_FOUND')).toBe(false);
    expect(isApiError(new Error('x'))).toBe(false);
  });
});

describe('fieldErrors', () => {
  it('lee details.fields como lista de { field, message } (forma real de la API)', () => {
    const error = new ApiError(400, 'VALIDATION_ERROR', 'Invalid request data', {
      fields: [
        { field: 'name', message: 'Too small' },
        { field: 'email', message: 'Invalid email address' },
        { field: 'email', message: 'Repetido' },
      ],
    });
    expect(fieldErrors(error)).toEqual({ name: 'Too small', email: 'Invalid email address' });
  });

  it('devuelve vacío para otros errores o detalles mal formados', () => {
    expect(fieldErrors(new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'x'))).toEqual({});
    expect(fieldErrors(new ApiError(400, 'VALIDATION_ERROR', 'x', { fields: 'nope' }))).toEqual({});
  });
});
