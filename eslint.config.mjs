// Lint de la interfaz de QATO'K.
// Regla central (guía §7.6, convenciones §6.8): la interfaz solo consume la API del backend,
// nunca importa un driver de base de datos.
import js from '@eslint/js';
import next from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'next-env.d.ts',
      'out/**',
      '**/coverage/**',
      '.ci-backend/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { '@next/next': next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
    },
  },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-imports': [
        'error',
        {
          paths: ['pg', 'mongodb', 'neo4j-driver'].map((name) => ({
            name,
            message:
              'La interfaz no accede a las bases: usa la API del backend (convenciones §6.8).',
          })),
        },
      ],
    },
  },
  prettier,
);
