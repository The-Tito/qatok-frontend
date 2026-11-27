# 04 · Plan de implementación

Orden de trabajo para el agente que programe la interfaz. Cada paso es **una rama y un commit**. Al terminar un paso, el agente informa lo hecho y las comprobaciones, y **espera el visto bueno** antes de seguir. No se hace commit, push ni PR sin autorización explícita.

## Antes de empezar

1. Leer `AGENTS.md`, `docs/diseno/README.md` y el documento del paso.
2. Comprobar las decisiones abiertas (README, tabla D1–D5) que bloquean el paso. Si una está sin resolver, preguntar; no suponer.
3. Rama `feature/a-<tarea>` desde `develop` actualizado.
4. Comprobación base de cada paso: `npm run verificar` y `npm run build` en verde. Si el paso toca la API, probarlo también contra el backend local (`cd ../qatok-backend && npm run db:up && npm run dev:api`).
5. Mensaje de commit: `<ámbito>: <qué cambia>` (por ejemplo, `app: create Next.js skeleton`). Sin coautores ni pies automáticos.

## Pasos

| # | Entrega | Issue | Hecho cuando |
|---|---|---|---|
| 1 | **Esqueleto.** App Router + TypeScript en la raíz, con los scripts actuales (`verificar`, `sync:shared`, `check:shared`) más `dev` (puerto 3000), `build` y `start`. Tailwind v4, `globals.css` con los tokens de 01 y las tres fuentes con `next/font/google`. Conservar `no-restricted-imports` y `paths`/`strict` del `tsconfig`. Agregar `npm run build` al CI. Página `/` provisional con el estado de `GET /api/health` | #4 | `npm run dev` muestra las 3 bases; CI verde con build |
| 2 | **Base técnica.** `src/lib/api/` (cliente, errores y funciones de F1, admin y F2), sesión, guardas por rol, TanStack Query, `src/lib/skill-types.ts`. Vitest con pruebas de `skill-types`, del mapeo de errores y del cliente (fetch simulado). MSW según D2 | #4 | Pruebas verdes; un 401 cierra la sesión |
| 3 | **Componentes.** Todos los de 01 y la página `/dev/componentes` con cada variante. Sprites copiados a `public/sprites/` | #4 | La página de muestra coincide con `prototipo/Main.dc.html` y `Estados.dc.html` |
| 4 | **Cuenta.** `/entrar`, `/registro`, redirección por rol en `/` y «Salir» | #3 | Entrar, registrarse y salir contra la API real; errores por campo |
| 5 | **Catálogo y antes de jugar.** `/simulaciones` con filtros, búsqueda, paginación y banner de partida en curso; `/simulaciones/[id]` con «Comenzar» y el 409 | #3, #5 | Filtros combinados coinciden con la API; no se duplican intentos |
| 6 | **Juego.** `/jugar/[attemptId]`: los 5 renderizadores de contexto, opciones, resultado de la decisión, completada, abandonar y recuperación ante 409 | #5 | Partida completa de «Cliente molesto por un retraso» y de «Tres entregas para mañana» contra la API real; retomar tras recargar |
| 7 | **Administración.** `/admin/simulaciones`, editor (crear, guardar, versiones, validación, mapa, publicar, solo lectura) y `/admin/habilidades` | — | Crear un escenario de 2 pasos, publicarlo y jugarlo como estudiante |
| 8 | **Perfil.** `/perfil` con tipos provisionales y MSW (D4), `datos_incompletos` y sondeo de pendientes | #2 | Con MSW se ven los niveles 75, 92.5 y 40; el modo incompleto no rompe la página |
| 9 | **Evidencias y compartir.** `/evidencias`, `/evidencias/[id]`, hoja de enlace y `/e/[token]` (D3, D4) | #2, #3 | Crear, copiar y revocar un enlace con MSW; la página pública maneja 404 y 410 |
| 10 | **Conexión de F3.** Cuando el backend publique F3a y F3b en `@qatok/shared`: `npm run sync:shared` (commit propio), borrar `provisional/` y sus mocks, y conectar a la API real. Selector de tipo visual si D1 se aprobó | #2, #3 | Ningún import de `provisional/`; flujo completo sin MSW |
| 11 | **Revisión final.** Accesibilidad (teclado, foco, contraste, lectores de pantalla en el juego), 360 px y 1024 px, `prefers-reduced-motion`, rendimiento (Lighthouse móvil ≥ 90 en accesibilidad) | — | Lista de comprobación de 01 cumplida y anotada en el PR |

Los pasos 7 y 8–9 pueden intercambiarse si el backend de F3 llega antes.

## Comprobación visual

En cada pantalla, comparar con su `prototipo/*.dc.html`: colores, tamaños, bordes, sombras, textos y orden. Las diferencias aceptadas se anotan en el PR. No añadir elementos que no estén en el prototipo ni en 02 (por ejemplo, totales de pasos, contadores inventados o animaciones extra).

## Qué no hacer

- No editar `src/shared/` ni redefinir tipos que ya están en `@qatok/shared`.
- No escribir datos de ejemplo en las pantallas: todo sale de la API o de los fixtures del dataset.
- No mostrar al estudiante valoraciones de opciones, destinos ni retroalimentación antes de decidir.
- No crear endpoints en Next ni guardar el token en cookies del servidor.
- No usar azules ni fuentes distintas de las tres definidas.
