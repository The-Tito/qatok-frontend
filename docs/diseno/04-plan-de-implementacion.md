# 04 · Plan de implementación (v2)

Plan para construir la interfaz de QATO'K. Reemplaza al plan del 24 nov (contrato 0.4.0), que queda en el historial de git. Diseño de referencia (aprobado el 2026-11-27): [`prototipo-v2/`](prototipo-v2/LEEME.md), exportado del lienzo «Propuestas v2» (`movil/`) y «v2 · Web» (`web/`), con las notas de cada pantalla en su `LEEME.md`. `prototipo/` queda como versión anterior.

## Reglas de trabajo

- **Por módulos e issues pequeños.** Cada módulo se divide en issues de 1 a 3 días. Cada issue es una rama `feature/<tarea>` desde `develop`, un commit por implementación (`<ámbito>: <qué cambia>`) y un PR a `develop` con `Closes #N`, fusionado con merge commit.
- **Conectar mientras se construye.** La API está completa (contrato 0.6.0). Cada issue se termina contra la API local con el dataset (`cd ../qatok-backend && npm run db:up && npm run dev:api`). No hay datos simulados para desarrollar.
- **Responsive, móvil primero.** Un solo código por pantalla. Menos de 768 px: diseño móvil de «Propuestas v2». De 768 a 1023 px: el mismo diseño con más aire. Desde 1024 px: diseño de «v2 · Web». Admin es de escritorio desde 1024 px.
- **Hecho cuando:** funciona contra la API real; se probó a 390, 768 y 1280 px; `npm run verificar` y `npm run build` pasan; las pruebas de Vitest del issue pasan; los estados de error y carga del issue se ven.
- **Al cerrar un issue** se informa lo hecho y las comprobaciones, y se espera el visto bueno antes del siguiente. Sin commit, push ni PR sin autorización. Autoría: solo el usuario.
- **Documentos:** cada issue actualiza en 01, 02 y 03 lo que toque (contrato 0.6.0 y diseño v2).

## Decisiones vigentes

| Tema | Decisión | Estado |
|---|---|---|
| Diseño | Lienzo «Propuestas v2» y «v2 · Web» | Aprobado (2026-11-27) |
| Escritorio del estudiante | Responsive, tres anchos (arriba) | Aprobado (2026-11-27) |
| Token de sesión (DEC-F04) | `localStorage`, como el login ya fusionado; se borra con 401 y al salir | Aprobado (2026-11-27) |
| Pedir datos | TanStack Query (comprobar compatibilidad con React 19 y Next 16 en 0.2) | Aprobado (2026-11-27) |
| Pruebas | Vitest solo para la lógica (cliente, errores, tipos de habilidad, utilidades). Pantallas: prueba manual contra la API | Aprobado (2026-11-27) |
| Datos simulados (D2) | Descartados para desarrollar | Aprobado (2026-11-27) |
| Ruta pública (D3) | `/e/[token]`; el enlace mostrado es `{origen del frontend}/e/{token}` | Fijado por el contrato |
| Contrato F3a y F3b (D4) | En `@qatok/shared` | Resuelto |
| Tipo visual de habilidad (D1) | Pendiente en el backend. Mapa local por ID con respaldo `STONE` | Provisional |
| Abrir simulación en el editor (D5) | Pendiente en el backend. Buscarla en `GET /api/admin/simulations` | Provisional |
| Animaciones (DEC-F06) | Ver «Movimiento» | Aprobado (2026-11-27) |
| Fecha de entrega | Sin fecha; se avanza por issues | Aprobado (2026-11-27) |

## Rutas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Redirige: sin sesión → `/entrar`; estudiante → `/simulaciones`; admin → `/admin/simulaciones` | Todos |
| `/entrar`, `/registro` | Entrar y Crear cuenta | Público |
| `/simulaciones` | Catálogo | Estudiante |
| `/simulaciones/[simulationId]` | Antes de jugar (y aviso 409 de partida en curso) | Estudiante |
| `/jugar/[attemptId]` | Paso, resultado de la decisión, pausa, abandonada, completada y guardar evidencia | Dueño |
| `/perfil` | Perfil | Estudiante |
| `/perfil/habilidades/[skillId]` | Evolución de una habilidad (C-05) | Estudiante |
| `/perfil/recomendaciones` | Recomendaciones (C-01) | Estudiante |
| `/perfil/partidas` | Mis partidas | Estudiante |
| `/perfil/partidas/[attemptId]` | Recorrido de un intento (C-03) | Dueño |
| `/evidencias` | Evidencias | Estudiante |
| `/evidencias/[evidenceId]` | Evidencia y enlaces (crear enlace es un diálogo) | Dueño |
| `/e/[token]` | Evidencia pública | Público |
| `/cuenta` | Mi cuenta (eliminar es un diálogo) | Usuario |
| `/admin/simulaciones` | Simulaciones | Admin |
| `/admin/simulaciones/nueva`, `/admin/simulaciones/[simulationId]` | Editor (solo lectura si está publicada o inactiva) | Admin |
| `/admin/habilidades` | Habilidades | Admin |

Las hojas y confirmaciones (pausa, guardar evidencia, crear enlace, eliminar cuenta, confirmaciones de admin) son componentes, no rutas.

## Módulos e issues

| Issue | Módulo | Entrega | Depende de |
|---|---|---|---|
| 0.1 | Base | Repo y estilos: `.gitattributes` (`* text=auto eol=lf`), tokens de 01 en `globals.css`, fuentes con `next/font`, variables de movimiento y regla de movimiento reducido, logo y favicon, sprites en `public/sprites/` | — |
| 0.2 | Base | Cliente de la API y sesión: un solo `request()` con `Bearer`, errores por `code` y 401 que cierra la sesión; TanStack Query; guardas por rol; mapa de tipos de habilidad (D1 provisional); Vitest con sus pruebas | 0.1 |
| 0.3 | Base | Estructuras y componentes: estructura del estudiante (BottomNav en móvil, barra superior desde 1024 px), estructura de admin, botones, chips, FeedbackBadge, barra de nivel, StateCard, hoja/diálogo responsive, aviso de sincronización; página `/dev/componentes` | 0.1 |
| 1.1 | Cuenta | Entrar y Crear cuenta (409 de correo repetido), redirección por rol en `/`, Salir | 0.2, 0.3 |
| 1.2 | Cuenta | Mi cuenta: ver, cambiar el nombre y eliminar la cuenta con confirmación fuerte | 1.1 |
| 2.1 | Catálogo | Catálogo: búsqueda, filtros por dificultad y habilidad, paginación y aviso de partida en curso | 1.1 |
| 2.2 | Catálogo | Antes de jugar, «Comenzar» y el aviso 409 `ACTIVE_ATTEMPT_EXISTS` (continuar o abandonar y empezar de nuevo) | 2.1 |
| 3.1 | Juego | Pantalla del paso: estados `revealing`/`ready`, los 5 contextos (correo, reunión, conversación, tarea, incidente), opciones y «Decidir» | 2.2 |
| 3.2 | Juego | Resultado de la decisión, siguiente paso, retomar al recargar y errores 409 (`STEP_NOT_CURRENT`, `ATTEMPT_NOT_IN_PROGRESS`) | 3.1 |
| 3.3 | Juego | Pausa y abandonar, partida abandonada, simulación completada y guardar evidencia (409 `EVIDENCE_ALREADY_EXISTS`) | 3.2 |
| 4.1 | Perfil | Perfil: habilidades con contadores, recomendaciones y evidencias recientes, datos incompletos y sondeo si hay sincronización pendiente | 3.3 |
| 4.2 | Perfil | Evolución de una habilidad (gráfica de escalones) y Recomendaciones | 4.1 |
| 4.3 | Perfil | Mis partidas (filtro por estado) y Recorrido de un intento (`graph_pending` como aviso suave) | 4.1 |
| 5.1 | Evidencias | Lista (filtro por habilidad, «Cargar más») y detalle (privacidad, eliminar) | 3.3 |
| 5.2 | Evidencias | Crear, copiar y revocar enlaces; página pública `/e/[token]` con 404 y 410 | 5.1 |
| 6.1 | Admin | Simulaciones (lista por estado, crear y editar datos, desactivar, eliminar borrador) y Habilidades (crear, editar, eliminar con 409 `SKILL_IN_USE`) | 1.1 |
| 6.2 | Admin | Editor de contenido: pasos, opciones, consecuencias, contextos de los 5 tipos, guardar versión, validación y 409 `STALE_CONTENT_VERSION` | 6.1 |
| 6.3 | Admin | Publicar, solo lectura; crear y publicar una simulación con paso INCIDENT para probar 3.1 | 6.2 |
| 7.1 | Movimiento | Animaciones decorativas de la lista de «Movimiento» | 3.3, 4.1 |
| 8.1 | Cierre | Revisión final: teclado, foco, contraste, lectores de pantalla en el juego, los tres anchos, Lighthouse móvil ≥ 90 en accesibilidad; README | Todo |

El módulo 6 puede empezar después de 1.1, en paralelo con 2 a 5.

## Movimiento (animaciones) · DEC-F06

Ejemplo que funciona: [`prototipo/ejemplo-animacion-paso.html`](prototipo/ejemplo-animacion-paso.html).

- El JavaScript solo cambia estados en atributos (`data-state`, `data-result`, `data-sync`). Las animaciones son solo CSS (`@keyframes` con `steps()`). Sin librerías de animación.
- Variables en `globals.css` (issue 0.1): `--mov-letra: 28ms`, `--mov-rapido: 120ms`, `--mov-medio: 320ms`, `--mov-pasos-2: steps(2, jump-none)`, `--mov-pasos-4: steps(4, end)`.
- `prefers-reduced-motion: reduce` apaga todo con una regla global, y la escritura letra por letra muestra el texto completo.
- Estados del paso (issue 3.1): diálogo o contexto `revealing` → `ready` (tocar o Enter/Espacio salta a `ready`); opciones `hidden` → `shown`; «Decidir» deshabilitado hasta `ready`; retroalimentación `data-state="hidden|shown"` y `data-result="correct|partial|incorrect"`. Hasta el issue 7.1, el paso pasa directo a `ready`.
- Qué se anima en 7.1: escritura del diálogo, cursor ▶, entrada de opciones, botón que baja 4 px, hoja de retroalimentación (pop y estrellas en acierto, sacudida en error), sprite del interlocutor con 2 cuadros, barra de nivel por bloques y barra de sincronización.
- Ninguna animación retrasa datos ni bloquea acciones, salvo la escritura, que se puede saltar. Nada de transiciones suaves, desenfoques ni degradados.

## Pendientes que no bloquean

| # | Pendiente | Mientras tanto |
|---|---|---|
| P3 | Documentos 01 a 03 al contrato 0.6.0 y al diseño v2 | Cada issue actualiza lo suyo |
| P4 | D1 · `visual_type` en el backend | Mapa local por ID con respaldo `STONE` |
| P5 | D5 · `GET /api/admin/simulations/:id` | Buscar en la lista |
| P12 | No hay paso INCIDENT en el dataset | Se crea en 6.3 (o el backend lo agrega al dataset) |

## Comprobación visual

En cada pantalla, comparar con `prototipo-v2/movil/` y `prototipo-v2/web/`: colores, tamaños, bordes, sombras, textos y orden. Las diferencias aceptadas se anotan en el PR.

## Qué no hacer

- No editar `src/shared/` ni redefinir tipos que ya están en `@qatok/shared`.
- No escribir datos fijos en las pantallas: todo sale de la API.
- No mostrar al estudiante valoraciones (`score`) de opciones ni la retroalimentación antes de decidir.
- No crear endpoints en Next (Route Handlers ni Server Actions) ni poner credenciales de bases.
- No usar azules ni fuentes distintas de Chakra Petch, Silkscreen e IBM Plex Mono.
