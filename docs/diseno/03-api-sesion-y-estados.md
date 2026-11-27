# 03 · API, sesión y estados

## Reglas que no se rompen

- La interfaz solo llama a la API en `NEXT_PUBLIC_API_URL`. Sin drivers, sin Route Handlers (`app/api/*`) y sin Server Actions como backend.
- Tipos y esquemas desde `@qatok/shared`. Nunca editar `src/shared/`.
- Si un tipo aún no existe en `@qatok/shared` (F3a y F3b), definirlo **solo** en `src/lib/api/provisional/`, con un comentario `// PROVISIONAL (D4): reemplazar por @qatok/shared` en cada archivo. Ningún componente importa directamente de ahí: pasa por las funciones de `src/lib/api/`.

## Cliente (`src/lib/api/`)

```text
src/lib/api/
  client.ts        request(): fetch + token + parseo del error + validación Zod
  errors.ts        ApiError, mensajes por code
  auth.ts          login, register, me
  catalog.ts       simulations, simulation, skills
  attempts.ts      start, list, get, respond, abandon
  admin.ts         simulations, content, publish, deactivate, remove, skills
  profile.ts       (provisional) perfil, evidencias, comparticiones, público
  provisional/     tipos de F3a y F3b mientras no estén en shared
```

`request<T>(path, { method, body, schema, auth })`:

1. URL = `${NEXT_PUBLIC_API_URL}${path}` (la variable ya incluye `/api`).
2. Cabeceras `Content-Type: application/json` y, si hay sesión, `Authorization: Bearer <token>`.
3. Respuesta 2xx: validar con `schema.safeParse`. Si no coincide, lanzar `ContractError` y registrarlo con `console.error` (es un desacuerdo con el backend, no un error del usuario). 204 → `undefined`.
4. Respuesta no 2xx: parsear con `ErrorRespuesta`. Lanzar `ApiError { status, code, message, details }`. Si el cuerpo no es válido, usar `code = 'UNKNOWN'`.
5. Fallo de red: `ApiError { status: 0, code: 'NETWORK' }`.
6. 401 en una ruta con sesión: borrar la sesión y redirigir a `/entrar?next=<ruta actual>`.

Las pantallas usan TanStack Query (`@tanstack/react-query`) para caché, reintentos y estados de carga. Sin reintentos automáticos en mutaciones; en consultas, uno solo y nunca ante 4xx.

## Sesión

- Guardar `{ token, user }` en `localStorage` con la clave `qatok.session`. Leer con `try/catch`: si falla o está corrupto, no hay sesión.
- El JWT dura 8 horas. No decodificarlo para autorizar: el rol se toma de `user.role` y la API vuelve a comprobarlo.
- Al cargar la app con sesión guardada: `GET /api/me` para refrescar `user`; un 401 cierra la sesión.
- «Salir»: borrar la sesión, limpiar la caché de consultas e ir a `/entrar`.
- Guardas en el cliente: `(estudiante)` exige sesión; `(admin)` exige `role = 'ADMIN'` y muestra el 403 si no. Son de experiencia de usuario, no de seguridad: la seguridad la aplica la API.

Estructura sugerida del App Router:

```text
src/app/
  layout.tsx                      fuentes, globals.css, QueryClientProvider
  page.tsx                        redirige por sesión y rol
  (publico)/entrar/page.tsx
  (publico)/registro/page.tsx
  (publico)/e/[token]/page.tsx
  (estudiante)/layout.tsx         guarda de sesión, columna móvil
  (estudiante)/simulaciones/page.tsx
  (estudiante)/simulaciones/[simulationId]/page.tsx
  (estudiante)/jugar/[attemptId]/page.tsx
  (estudiante)/perfil/page.tsx
  (estudiante)/evidencias/page.tsx
  (estudiante)/evidencias/[evidenceId]/page.tsx
  (admin)/admin/layout.tsx        guarda de rol, AdminShell
  (admin)/admin/simulaciones/page.tsx
  (admin)/admin/simulaciones/nueva/page.tsx
  (admin)/admin/simulaciones/[simulationId]/page.tsx
  (admin)/admin/habilidades/page.tsx
  dev/componentes/page.tsx        solo en desarrollo (notFound() en producción)
```

Las páginas con datos son componentes de cliente (`'use client'`), porque el token vive en el navegador.

## Errores por `code`

Decidir siempre por `code`, nunca por el texto de `message`. El estado visual de cada caso está en `prototipo/Estados.dc.html`.

| code (HTTP) | Dónde | Qué ve el usuario | Acción |
|---|---|---|---|
| `VALIDATION_ERROR` (400) | Formularios | Error bajo cada campo de `details.fields` | Foco en el primer campo con error |
| `INVALID_CREDENTIALS` (401) | Entrar | «Correo o contraseña incorrectos» | — |
| `UNAUTHENTICATED` (401) | Cualquier ruta con sesión | «Tu sesión terminó» | Cerrar sesión y volver a `/entrar?next=` |
| `ACCOUNT_INACTIVE` (403) | Entrar | «Tu cuenta está desactivada» | — |
| `FORBIDDEN` (403) | Admin | «Esta zona es para administración» | Ir al catálogo |
| `NOT_FOUND` (404) | Detalles | «Esto ya no está disponible» | Volver a la lista |
| `EMAIL_ALREADY_REGISTERED` (409) | Registro | Bajo Correo, con enlace a Entrar | — |
| `ACTIVE_ATTEMPT_EXISTS` (409) | Antes de jugar | «Ya tienes esta partida en curso» | Continuar con `details.attempt_id` |
| `STEP_NOT_CURRENT`, `ATTEMPT_NOT_IN_PROGRESS` (409), `OPTION_NOT_IN_STEP` (400) | Jugar | Nada: se recarga el intento | `GET` del intento |
| `SIMULATION_NOT_PUBLISHED` (409) | Antes de jugar | «Esta simulación ya no está disponible» | Catálogo |
| `STALE_CONTENT_VERSION` (409) | Editor | «Alguien guardó otra versión del borrador» | Recargar versión |
| `INCOMPLETE_CONTENT`, `INVALID_BRANCHES`, `MISSING_CONTENT` (409) | Editor al publicar | Lista «Antes de publicar» | — |
| `SIMULATION_NOT_EDITABLE`, `SIMULATION_NOT_PUBLISHED` (409) | Admin | «La simulación cambió de estado» | Recargar |
| `SKILL_ALREADY_EXISTS` (409) | Habilidades | Bajo Nombre | — |
| `SKILL_IN_USE` (409) | Habilidades | «Asignada a una simulación» | — |
| `SKILL_NOT_FOUND` (404) | Editor | En el bloque de habilidades | Recargar habilidades |
| `DATABASE_UNAVAILABLE`, `PUBLISHED_CONTENT_UNAVAILABLE` (503) | Cualquiera | «No pudimos cargar esta pantalla. Lo que ya guardaste está a salvo» | Reintentar |
| `PAYLOAD_TOO_LARGE` (413) | Editor | «El escenario es demasiado grande» | — |
| `NETWORK` (0), `INTERNAL_ERROR` (500), `UNKNOWN` | Cualquiera | Igual que 503 | Reintentar |

Los mensajes viven en `src/lib/api/errors.ts` como un mapa `code → texto`, con un texto genérico de respaldo.

## Sincronización con el grafo

- Las mutaciones que generan eventos devuelven `synchronization: { graph: 'APPLIED' | 'PENDING', event_ids }`.
- `PENDING` **no es un error**: PostgreSQL ya guardó el cambio. Nunca mostrarlo como fallo.
- Se muestra `SyncBanner` en: la vista completada del juego (si la última respuesta trajo PENDING) y el perfil (`sincronizacion_pendiente > 0`).
- En el perfil, con pendientes: volver a consultar cada 3 s, máximo 5 veces. Si siguen pendientes, el aviso cambia a «Tu progreso se actualizará en unos minutos».
- Tras una mutación, invalidar las consultas afectadas (catálogo, intentos, perfil, evidencias, listas de admin).

## Datos simulados (D2)

Descartados (plan v2, 2026-11-27): la API está completa (contrato 0.6.0) y cada pantalla se termina contra la API local con el dataset. No hay MSW ni fixtures.

## Implementación (issue 0.2)

- `src/lib/api/client.ts`: `request(path, { method, body, schema, auth, query, signal })` y `apiUrl()`. Un 401 **con token enviado** borra la sesión y llama al manejador que registra `src/app/providers.tsx` (limpia la caché de TanStack Query y va a `/login?next=`; desde el issue 1.1, `/entrar`). Un 401 de `/auth/login` (sin token) no cierra nada.
- `src/lib/api/errors.ts`: `ApiError`, `ContractError`, `errorMessage()`, `isApiError(error, ...codes)` y `fieldErrors()`. La API manda `details.fields` como **lista** `[{ field, message }]` con mensajes en inglés: la pantalla muestra su propio texto por campo.
- `src/lib/session.ts` y `src/lib/use-session.ts`: sesión en `localStorage` con aviso a los componentes (`useSyncExternalStore`) y entre pestañas.
- `src/lib/routes.ts`: rutas de inicio por rol y `next` seguro (solo rutas internas).
- `src/components/RequireSession.tsx`: guarda de los grupos `(estudiante)` y `(admin)`; refresca `GET /api/me` una vez por carga y muestra el 403 si el rol no coincide.
- Pruebas (Vitest, `npm run test`, incluido en `npm run verificar`): cliente con `fetch` simulado, errores, sesión, rutas y tipos de habilidad.
