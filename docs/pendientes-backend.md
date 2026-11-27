# Pendientes para el backend (hallazgos del frontend)

Lista de lo que la interfaz necesita o encontró del lado de **The-Tito/qatok-backend** al implementar el plan v2 (contrato 0.6.0). Para cada punto: qué falta, por qué importa y qué hace el frontend mientras tanto. Ordenado por prioridad.

| # | Tema | Prioridad | Bloquea algo |
|---|---|---|---|
| 1 | `visual_type` en la habilidad (D1) | Alta (acordado) | No: hay respaldo fijo |
| 2 | `GET /api/admin/simulations/:id` (D5) | Media | No |
| 3 | Dataset: paso INCIDENT, evento de sincronización pendiente | Media | No |
| 4 | Detalles en los 409 al publicar | Baja | No |
| 5 | Referencias de simulación y objetivo en respuestas del perfil | Baja | No |
| 6 | Saltos de línea en `shared/` | Baja | No |

## 1. Tipo visual de la habilidad (D1)

**Qué falta.** Un campo que guarde el «tipo» visual (color) de cada habilidad. Hoy no existe en la base, en `shared/` ni en el contrato.

**Por qué.** Toda la interfaz se colorea por el tipo de la habilidad (tarjetas del catálogo, pantalla de juego, barras del perfil, chips). Sin el campo, el frontend usa una tabla fija por ID del dataset (Comunicación = Voz, Conflictos = Fuego, Tiempo = Reloj) y cualquier habilidad nueva queda en gris (Piedra). Se acordó que la administradora elija el tipo en Admin › Habilidades.

**Propuesta.**

- Nombre: `visual_type`. Valores: `VOICE`, `FIRE`, `CLOCK`, `LEAF`, `SPARK`, `HEART`, `MIND`, `STONE` (`STONE` por defecto o nulo = sin tipo). Son las claves de `docs/diseno/01-sistema-visual.md` § Tipos de habilidad.
- En `shared/src/f1.ts`:
  - `SkillInput`: `visual_type: z.enum([...]).nullable().optional()`.
  - `Skill`: `visual_type: z.enum([...]).nullable()`.
- En las respuestas que traen habilidades anidadas, agregar `visual_type` para no depender de otra consulta: `SimulationSummary.skills[]` (catálogo, antes de jugar, recomendaciones), `AdminSimulation.skills[]`, `ProfileSkill`, las `skills` de evidencias (`EvidenceSummary`, `EvidenceDetail.content`) y, si se quiere color en la página pública, `SharedEvidence.content.skills[]`.
- `POST` y `PUT /api/admin/skills` lo aceptan; las demás rutas lo devuelven.
- Dataset: `VOICE`, `FIRE` y `CLOCK` para las tres habilidades actuales (así no cambia nada de lo que ya se ve).

**Qué hace el frontend.** Ya está listo:

- El selector de 8 tipos en Admin › Habilidades se **activa solo** cuando `SkillInput` de `shared/` incluye `visual_type` (después de `npm run sync:shared`). Mientras tanto se ve deshabilitado con el tipo actual.
- `skillType()` (`src/lib/skill-types.ts`) usa el `visual_type` que mande la API en cualquier respuesta; si no viene, la tabla fija; si no, `STONE`.

## 2. Una simulación de admin por ID (D5)

**Qué falta.** `GET /api/admin/simulations/:simulationId` → `200 AdminSimulation` (cualquier estado), `404 NOT_FOUND`. Hoy las rutas de `backend/src/routes/simulation-admin.routes.ts` permiten listar, crear, actualizar, eliminar, leer y guardar contenido, publicar y desactivar, pero no leer una sola; `/content` solo trae los pasos.

**Por qué.** El editor (`/admin/simulaciones/[id]`) necesita título, estado, dificultad y habilidades. Abierto desde la lista, el frontend reutiliza los datos ya cargados; con un enlace directo o al recargar, tiene que recorrer la lista completa para encontrarla.

**Qué hace el frontend.** Funciona sin la ruta. Cuando exista, basta con poner `HAS_ADMIN_SIMULATION_GET = true` en `src/lib/api/admin.ts`.

## 3. Datos de prueba que faltan en el dataset

- **Paso INCIDENT.** Ninguna simulación del dataset tiene un paso de tipo `INCIDENT`, así que la pantalla de juego de ese tipo no se podía probar con datos reales. Para el plan v2 se creó y publicó en la base local «Servidor caído en hora pico» desde el editor. Conviene agregar un paso INCIDENT a una simulación del dataset (o una simulación nueva) para que cualquiera pueda probarlo después de recargar.
- **Sincronización pendiente.** Con el dataset, todas las respuestas traen `synchronization.graph = "APPLIED"` y el perfil `pending_sync_count = 0`. No hay forma de ver en la interfaz el aviso «Actualizando tu progreso…» sin apagar Neo4j. Sugerencia: un evento `PENDIENTE` en el dataset (o un script de desarrollo que deje uno) para probar ese estado.
- El enlace vencido sí existe (`tok-ejemplo-expirado` → `410 SHARE_LINK_EXPIRED`) y la interfaz lo muestra bien.

## 4. Detalle de los errores al publicar

`POST /api/admin/simulations/:id/publish` responde `409 INCOMPLETE_CONTENT` o `409 INVALID_BRANCHES` sin `details`. El repositorio sí sabe la causa (`contenido.repository.ts`: falta el paso inicial, hay un ciclo, la ruta apunta fuera, hay pasos inalcanzables, una opción sin consecuencias). Sugerencia: `details: { reason, step_id?, option_id? }` para que el editor marque el paso exacto. Mientras tanto, el frontend revisa las mismas reglas antes de publicar («Antes de publicar»).

Relacionado: los mensajes de `VALIDATION_ERROR` en `details.fields[].message` están en inglés. La interfaz no los muestra (usa sus propios textos por campo), así que no es un problema; solo se anota.

## 5. Respuestas del perfil y de partidas

- `GET /api/attempts`: cada `Attempt` trae solo `simulation_id`. Para «Mis partidas» el frontend pide el catálogo para sacar título y color, y si la simulación ya no está publicada muestra «Simulación no disponible». Sugerencia: incluir `simulation: { id, title }` en cada intento.
- `GET /api/profile/skills/:skillId/evolution`: trae `current_level` y `points`, pero no el objetivo (`target`) ni el nombre de la habilidad; el frontend pide también `GET /api/profile`. Sugerencia: agregar `skill: { id, name, target }`.

## 6. Saltos de línea de `shared/`

En Windows, `shared/src/*.ts` sale con CRLF al clonar y el frontend lo guarda con LF, así que `npm run check:shared` fallaba aunque el contenido fuera igual. El frontend ya compara ignorando CRLF. Sugerencia: un `.gitattributes` con `* text=auto eol=lf` en el backend, como el del frontend.
