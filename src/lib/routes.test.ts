import { describe, expect, it } from 'vitest';
import { afterLogin, homeFor, loginUrl, safeNext } from './routes';

describe('routes', () => {
  it('lleva a cada rol a su inicio', () => {
    expect(homeFor('STUDENT')).toBe('/simulations');
    expect(homeFor('ADMIN')).toBe('/admin/simulations');
  });

  it('solo acepta rutas internas como regreso', () => {
    expect(safeNext('/profile?x=1')).toBe('/profile?x=1');
    expect(safeNext('//malo.com')).toBeNull();
    expect(safeNext('/\\malo.com')).toBeNull();
    expect(safeNext('https://malo.com')).toBeNull();
    expect(safeNext(null)).toBeNull();
  });

  it('arma la URL de entrar con la ruta de regreso', () => {
    expect(loginUrl('/profile')).toBe('/login?next=%2Fprofile');
    expect(loginUrl('https://malo.com')).toBe('/login');
  });
});

describe('afterLogin', () => {
  it('respeta la ruta de regreso del área del rol', () => {
    expect(afterLogin('STUDENT', '/profile?tab=1')).toBe('/profile?tab=1');
    expect(afterLogin('ADMIN', '/admin/skills')).toBe('/admin/skills');
  });

  it('ignora rutas de otra área, externas o de la propia entrada', () => {
    expect(afterLogin('STUDENT', '/admin/simulations')).toBe('/simulations');
    expect(afterLogin('ADMIN', '/profile')).toBe('/admin/simulations');
    expect(afterLogin('STUDENT', '//malo.com')).toBe('/simulations');
    expect(afterLogin('STUDENT', '/login')).toBe('/simulations');
    expect(afterLogin('ADMIN', null)).toBe('/admin/simulations');
    expect(afterLogin('STUDENT', '/administracion')).toBe('/administracion');
  });
});
