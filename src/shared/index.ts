/**
 * @qatok/shared: fuente única del contrato (docs/api/contrato-v0.md) para backend y frontend.
 * Regla: nadie redefine estos tipos; se importan desde aquí.
 */
export const VERSION_CONTRATO = '0.5.0';

export * from './catalogos.js';
export * from './comunes.js';
export * from './f1.js';
export * from './f2.js';
export * from './f3a.js';
export * from './simulation-admin.js';
