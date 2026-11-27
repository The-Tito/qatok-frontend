import { describe, expect, it } from 'vitest';
import { homeFor, loginUrl, safeNext } from './routes';

describe('routes', () => {
  it('lleva a cada rol a su inicio', () => {
    expect(homeFor('STUDENT')).toBe('/simulaciones');
    expect(homeFor('ADMIN')).toBe('/admin/simulaciones');
  });

  it('solo acepta rutas internas como regreso', () => {
    expect(safeNext('/perfil?x=1')).toBe('/perfil?x=1');
    expect(safeNext('//malo.com')).toBeNull();
    expect(safeNext('/\\malo.com')).toBeNull();
    expect(safeNext('https://malo.com')).toBeNull();
    expect(safeNext(null)).toBeNull();
  });

  it('arma la URL de entrar con la ruta de regreso', () => {
    expect(loginUrl('/perfil')).toBe('/login?next=%2Fperfil');
    expect(loginUrl('https://malo.com')).toBe('/login');
  });
});
