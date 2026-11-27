import { describe, expect, it } from 'vitest';
import { afterLogin, homeFor, loginUrl, safeNext } from './routes';

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
    expect(loginUrl('/perfil')).toBe('/entrar?next=%2Fperfil');
    expect(loginUrl('https://malo.com')).toBe('/entrar');
  });
});

describe('afterLogin', () => {
  it('respeta la ruta de regreso del área del rol', () => {
    expect(afterLogin('STUDENT', '/perfil?tab=1')).toBe('/perfil?tab=1');
    expect(afterLogin('ADMIN', '/admin/habilidades')).toBe('/admin/habilidades');
  });

  it('ignora rutas de otra área, externas o de la propia entrada', () => {
    expect(afterLogin('STUDENT', '/admin/simulaciones')).toBe('/simulaciones');
    expect(afterLogin('ADMIN', '/perfil')).toBe('/admin/simulaciones');
    expect(afterLogin('STUDENT', '//malo.com')).toBe('/simulaciones');
    expect(afterLogin('STUDENT', '/entrar')).toBe('/simulaciones');
    expect(afterLogin('ADMIN', null)).toBe('/admin/simulaciones');
    expect(afterLogin('STUDENT', '/administracion')).toBe('/administracion');
  });
});
