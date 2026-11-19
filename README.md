# qatok-frontend — interfaz de QATO'K (Next.js)

Interfaz de **QATO'K**, el proyecto final de Bases de Datos en la Nube. La API, las tres bases (PostgreSQL, MongoDB y Neo4j), la documentación y el plan de trabajo están en **[The-Tito/qatok-backend](https://github.com/The-Tito/qatok-backend)**.

> **Estado:** el repo está listo (lint, tipos, CI y la copia de `shared/`), pero la app Next.js **todavía no existe**. Crearla es la primera tarea del frontend (issue «Esqueleto de la interfaz en Next.js» en este repo).

## Reglas que no se negocian (guía §7.6, convenciones §6.8)

- La interfaz **solo** consume la API del backend. ESLint bloquea importar `pg`, `mongodb` o `neo4j-driver`.
- **No** se usan Route Handlers (`app/api/*`) ni Server Actions como backend.
- **No** hay credenciales de bases en el entorno: la única variable es `NEXT_PUBLIC_API_URL`.
- Los tipos y esquemas se importan de `@qatok/shared`; no se redefinen.

## Preparar tu máquina

Necesitas Node.js 22 o superior (recomendado 24, ver `.nvmrc`) y Git. Clona los dos repos **en carpetas hermanas**:

```bash
git clone git@github.com:The-Tito/qatok-backend.git
git clone git@github.com:The-Tito/qatok-frontend.git
cd qatok-frontend
git checkout develop
npm install
cp .env.example .env.local
npm run verificar        # lint + formato + tipos
```

Para tener la API corriendo, sigue el inicio rápido del README de `qatok-backend` (`npm run setup:env`, `npm run db:up`, `npm run dev:api`). La API escucha en `http://localhost:4000/api` y ya permite CORS desde `http://localhost:3000`.

## Tipos compartidos: `src/shared/`

`src/shared/` es una **copia de solo lectura** de `shared/src/` de `qatok-backend`, que es la fuente única del contrato. Se importa con el alias `@qatok/shared` (ver `tsconfig.json`):

```ts
import { EstadoIntento } from '@qatok/shared';
```

| Comando | Qué hace |
|---|---|
| `npm run sync:shared` | Copia `../qatok-backend/shared/src` a `src/shared/` y anota el commit de origen en `src/shared/ORIGEN.md` |
| `npm run check:shared` | Falla si la copia no coincide con el backend (el CI lo corre contra `develop` del backend) |

- **Nunca** edites `src/shared/` a mano: cambia `shared/` en el backend (con su PR) y luego corre `npm run sync:shared` aquí, en un commit propio.
- Otra ruta del backend: `QATOK_BACKEND=/ruta/a/qatok-backend npm run sync:shared`.

## Crear la app Next.js (primera tarea)

1. Crear la app con App Router + TypeScript **en la raíz de este repo**, conservando el nombre `@qatok/frontend`, los scripts `lint`, `format`, `typecheck`, `sync:shared`, `check:shared` y `verificar`, y el bloque `no-restricted-imports` de `eslint.config.mjs`.
2. Al mezclar el `tsconfig.json` que genera Next, conservar `paths` (`@qatok/shared`) y `strict`.
3. `lib/api.ts`: cliente que llama a la API usando **solo** `NEXT_PUBLIC_API_URL` y entiende el formato de error del contrato (`{ error: { codigo, mensaje, detalles } }`), mostrando `mensaje` al usuario.
4. Una página inicial que muestre el estado de las 3 bases desde `GET /api/health` (verde/rojo por base).
5. Agregar `dev` (puerto 3000), `build` y `start`, y sumar `npm run build` al CI.

| Qué ya está listo en el backend | Dónde |
|---|---|
| Contrato de los endpoints, con ejemplos JSON para simularlos mientras no existan | `docs/api/contrato-v0.md` |
| Formato de error y códigos HTTP | `context/convenciones.md` §5 |
| Plan y forma de trabajo (gitflow, commits, PR) | `context/plan-trabajo.md`, `context/como-trabajar.md` |

## Forma de trabajo

Igual que en el backend: gitflow (`feature/<perfil>-<tarea>` desde `develop`), un commit por implementación con el formato `<ámbito>: <qué cambia>`, `npm run verificar` en verde antes de subir y PR a `develop` con `Closes #N`.
