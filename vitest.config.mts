import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Pruebas de lógica (DEC-F08): cliente, errores, tipos de habilidad y utilidades.
export default defineConfig({
  resolve: {
    alias: { '@qatok/shared': fileURLToPath(new URL('./src/shared/index.ts', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
