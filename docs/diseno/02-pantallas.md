# 02 · Pantallas

Cada pantalla indica: ruta, acceso, prototipo, datos (endpoint → qué se muestra), interacción, estados y criterios de aceptación. El tratamiento común de errores y de sincronización está en [03](03-api-sesion-y-estados.md); aquí solo se nombran los casos propios de cada pantalla.

**Estado del contrato** (24 nov 2026, `VERSION_CONTRATO = 0.4.0`):

| Flujo | Endpoints | Tipos en `@qatok/shared` |
|---|---|---|
| Cuentas, habilidades, catálogo (F1) | Implementados | `f1.ts` |
| Administración (F1) | Implementados | `simulation-admin.ts` |
| Juego (F2) | Implementados | `f2.ts` |
| Perfil y evidencias (F3a), compartir (F3b) | **No implementados**; el contrato aún está en español y cambiará (D4) | No existen: usar tipos provisionales en `src/lib/api/provisional/` y datos simulados (D2) |

Formato de fechas en pantalla: `Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })` → «1 oct 2026». Dificultad: BASIC → «★ Básica», INTERMEDIATE → «★★ Intermedia», ADVANCED → «★★★ Avanzada».

---

## Estudiante (móvil)

Contenedor: ancho completo hasta 480 px, centrado en pantallas mayores, fondo blanco. Las pantallas con `BottomNav` reservan 72 px abajo.

### 1 · Entrar — `/entrar`

- **Acceso:** público. Con sesión activa → redirigir a `/simulaciones` (o a `/admin/simulaciones` si es ADMIN).
- **Prototipo:** `Login.dc.html`.
- **Datos:** `POST /api/auth/login` `{ email, password }` → `{ user, token }`. Validar antes con `LoginInput`.
- **Interacción:** al entrar, guardar la sesión (03) y volver a `?next=` si existe; si no, al destino por rol. Enlace a `/registro`.
- **Estados:** `401 INVALID_CREDENTIALS` → mensaje general bajo el formulario: «Correo o contraseña incorrectos» (nunca decir cuál). `403 ACCOUNT_INACTIVE` → «Tu cuenta está desactivada». Botón deshabilitado y con texto «Entrando…» mientras envía.
- **Criterios:** se entra con una cuenta registrada; las credenciales erróneas no revelan si el correo existe; Enter envía el formulario.

### 9 · Crear cuenta — `/registro`

- **Acceso:** público. **Prototipo:** `Registro.dc.html`.
- **Datos:** `POST /api/auth/register` `{ name, email, password }` → `{ user, token, synchronization }`. Validar con `RegisterInput` (contraseña: 8 caracteres o más y hasta 72 bytes UTF-8).
- **Estados:** `409 EMAIL_ALREADY_REGISTERED` → error bajo el campo Correo con enlace «Entrar» (así está en el prototipo). `400 VALIDATION_ERROR` → errores por campo desde `details.fields`.
- **Criterios:** al crearla, la sesión queda iniciada y se llega a `/simulaciones`; `synchronization.graph = PENDING` no muestra ningún aviso aquí.

### 2 · Catálogo — `/simulaciones`

- **Acceso:** usuario. **Prototipo:** `prototipo-v2/movil/CatalogoV2.dc.html` y `prototipo-v2/web/CatalogoWeb.dc.html`. Hecho en el issue 2.1.
- **Datos:**
  - `GET /api/me` (o la sesión) → «Hola, {nombre}».
  - `GET /api/simulations?search&difficulty&skill_id&limit&offset` → tarjetas.
  - `GET /api/skills` → chips de filtro por habilidad. El chip muestra el nombre corto del tipo («Voz», como el diseño) con el nombre de la habilidad en `aria-label` y `title`; si el tipo es `STONE` o lo comparten dos habilidades, muestra el nombre de la habilidad.
  - `GET /api/attempts?status=IN_PROGRESS&limit=1` → banner «Partida en curso». El título sale del catálogo cargado o de `GET /api/simulations/:id`.
- **Tarjeta:** franja de tipos por peso, dificultad, duración (`estimated_duration` nulo → no se muestra), título, descripción (2 líneas máximo) y un `TypeChip` por habilidad con su peso en %.
- **Interacción:** buscar con espera de 300 ms; un solo filtro de dificultad y uno de habilidad activos (se combinan); los filtros se reflejan en la URL. «Cargar más» con `offset` cuando `items.length < total`. Tocar una tarjeta → `/simulaciones/{id}`. Banner → `/jugar/{attemptId}`.
- **Estados:** cargando (bloques del tamaño de las tarjetas), sin resultados («Nada por aquí» + «Quitar filtros»), error 503.
- **Criterios:** solo aparecen simulaciones publicadas; los filtros combinados coinciden con la API; el contador muestra `total`.

### 3 · Antes de jugar — `/simulaciones/[simulationId]`

- **Acceso:** usuario. **Prototipo:** `prototipo-v2/movil/SimulacionV2.dc.html`, `PartidaEnCurso.dc.html` y sus versiones web. Hecho en el issue 2.2.
- **Partida en curso:** se comprueba al cargar con `GET /api/attempts?status=IN_PROGRESS&limit=100` (la API permite una por simulación, no una por usuario). Si hay una de esta simulación, el aviso J6 reemplaza a «Comenzar»; un 409 al comenzar recarga esa lista y muestra el mismo aviso. En escritorio el aviso va debajo de «Entrena», no arriba a la derecha como en `PartidaEnCursoWeb` (diferencia aceptada: un solo orden para los tres anchos).
- **Datos:** `GET /api/simulations/:id` → encabezado con escena, dificultad, duración, título, descripción y la sección «Entrena»: una `LevelBar` por habilidad con la marca en `expected_level`. «Tu nivel» sale del perfil (F3a); si no está disponible, la barra se muestra vacía con «Aún sin nivel».
- **Interacción:** «Comenzar» → `POST /api/attempts` `{ simulation_id }` → `/jugar/{attempt.id}`.
- **Estados:** `404 NOT_FOUND` (o un ID mal formado, `400`) → StateCard «Esta simulación ya no está disponible» con enlace al catálogo. `409 ACTIVE_ATTEMPT_EXISTS` → StateCard «Ya tienes esta partida en curso» con «Continuar» (`details.attempt_id`) y «Abandonar y empezar de nuevo» (abandon y luego un nuevo `POST`, con confirmación). `409 SIMULATION_NOT_PUBLISHED` → igual que 404.
- **Criterios:** nunca se crean dos intentos en curso; doble toque en «Comenzar» no envía dos peticiones.

### 4–7 · Jugar — `/jugar/[attemptId]`

Una sola ruta con cuatro vistas: **paso**, **resultado de la decisión**, **completada** y **abandonada**. Prototipos v2: `JugarCorreoV2`, `JugarConversacionV2`, `JugarReunion`, `JugarTarea`, `JugarIncidente`, `DecisionV2`, `ResultadoV2`, `JugarPausa`, `JugarAbandonada` y sus versiones web. La ruta vive en el grupo `(juego)`: con sesión de estudiante y sin menú principal. El paso se hizo en el issue 3.1.

- **Acceso:** dueño del intento (otro usuario → 404).
- **Carga:** `GET /api/attempts/:attemptId` → `{ attempt, current_step, responses }`; el título y las habilidades de la simulación con `GET /api/simulations/:simulation_id` (si responde 404 porque fue desactivada, se usa el título «Simulación» y el tipo `STONE`). Tipo de color = regla del mayor peso.
- **Vista paso** (`attempt.status = IN_PROGRESS` y `current_step` no nulo):
  - `StepHeader`: «Paso {current_step.order} · {tipo}» y el título de la simulación (LEEME de v2: «Paso N» es el `order`). No hay total de pasos: no inventarlo.
  - Título del paso en Chakra Petch y `StepContext` por tipo:
    - **EMAIL:** panel con De / Asunto sobre fondo `fill` y el cuerpo.
    - **CONVERSATION:** escena de 220 px con fondo `tint`, plataforma ovalada `base`, sprite del interlocutor, sprite del estudiante de espaldas y placa con `interlocutor`. Debajo, `DialogBox` con todas las `lines` (`speaker` + `text`).
    - **MEETING:** panel con «Participantes» (chips) y «Agenda» (lista numerada).
    - **TASK:** panel con «Entregables» (lista con casillas decorativas) y chip «Plazo: {deadline_hours} h».
    - **INCIDENT:** chip de severidad (LOW «Baja», MEDIUM «Media», HIGH «Alta»; alta con fondo `incorrect`) y cronología vertical `time` → `event`.
  - Pregunta: «¿Qué haces?» (o «¿Qué respondes?» en CONVERSATION) y `OptionList` con `options[].description`.
  - Escritorio (desde 1024 px): situación a la izquierda y decisión a la derecha. El paso lleva `data-state` (`ready` hasta el issue 7.1). Los contextos MEETING e INCIDENT se ven con datos de muestra en `/dev/componentes` (el dataset no trae INCIDENT).
  - «Decidir» deshabilitado hasta elegir. Envía `POST /api/attempts/:id/responses` `{ step_id, option_id }`.
- **Vista resultado de la decisión** (tras el 201): banner según `feedback.type` (CORRECT «¡Acierto!», PARTIAL «Parcial», INCORRECT «Error»), «Elegiste: {opción}», cada consecuencia con `ImpactBadge`, `feedback.comment` y «Consejo para el siguiente paso: {feedback.recommendation}». Botón:
  - `next_step` no nulo → «Siguiente paso» (vista paso con `next_step`, sin recargar).
  - `next_step` nulo → «Ver resultado» (vista completada).
  - `synchronization.graph = PENDING` no se muestra aquí: solo «✓ Decisión guardada».
  - Hecho en el issue 3.2. El banner lleva `data-state="shown"` y `data-result="correct|partial|incorrect"` (DEC-F06); el foco pasa al título del banner para que se anuncie. En la última decisión el consejo se titula «Para la próxima». Las decisiones de la sesión se guardan en el estado de la vista (para «Tus decisiones» en 3.3).
- **Vista completada** (`attempt.status = COMPLETED`): trofeo, «Simulación completada», título, `attempt.score` con un decimal como máximo («92.5 / 100»). «Tus decisiones»: las decisiones de esta sesión, guardadas en el estado del cliente (opción y retroalimentación). Si se recargó la página, esa lista no está: mostrar el enlace «Ver recorrido» (F3a). `SyncBanner` si la última respuesta trajo `PENDING`. Botones: «Guardar como evidencia» (F3a, `POST /api/evidencias` provisional), «Ver recorrido» y «Mi perfil».
- **Vista abandonada:** «Abandonaste esta partida» (JugarAbandonada) con «Volver al catálogo» y «Ver mis partidas». Completada y abandonada usan la estructura del estudiante (BottomNav o barra superior).
- **Hecho en el issue 3.3:** pausa, abandonar, completada y guardar evidencia. «Tus decisiones» solo se lista si la sesión tiene todas las respuestas del intento; si se recargó a mitad de partida, se muestra el aviso y «Ver recorrido». Guardar evidencia: `POST /api/evidence { attempt_id, title? }` → `/evidencias/{id}`; `409 EVIDENCE_ALREADY_EXISTS` → «Ya está guardada» con el título (`GET /api/evidence/:id`) y «Ver evidencia».
- **Pausa (II):** hoja con «Salir y continuar después» (ir al catálogo; el intento sigue en curso) y «Abandonar partida» (confirmación → `POST /api/attempts/:id/abandon`).
- **Errores propios:** `409 STEP_NOT_CURRENT` o `ATTEMPT_NOT_IN_PROGRESS` → recargar con `GET` y continuar desde el estado real, sin mensaje de error. `400 OPTION_NOT_IN_STEP` → recargar. `503 PUBLISHED_CONTENT_UNAVAILABLE` o `DATABASE_UNAVAILABLE` → StateCard de error con «Reintentar»; la decisión no se registró.
- **Criterios:** retomar tras cerrar la app lleva al paso correcto; una opción terminal muestra el resultado y luego la vista completada; el doble envío no registra dos respuestas; nunca se muestran valoraciones (`score` de una opción) al estudiante.

### 8 · Perfil — `/perfil`

- **Acceso:** estudiante. **Prototipo:** `prototipo-v2/movil/PerfilV2.dc.html` y `web/PerfilV2Web.dc.html`. Hecho en el issue 4.1.
- **Datos:** `GET /api/profile` (contrato 0.6.0): `user`, `summary` (`completed_attempts`, `evidence_count`), `skills` (`current_level`, `target` nulo o no, `classification`, `correct`, `partial`, `incorrect`), `recommendations` (hasta 5), `recent_evidence` (hasta 5, con `description`), `incomplete_data` (`graph`, `document`) y `pending_sync_count`.
- **Bloques:** tarjeta de habilidades (avatar, nombre, contadores, «Mi cuenta ▶»), «Habilidades» (chip del tipo, nombre, «nivel/objetivo», `LevelBar`, «▲ Fortaleza» / «▼ Área de mejora» —`NO_REFERENCE` sin etiqueta y, sin `target`, sin marca—, contadores ★ ◆ ✕ y «Evolución ▶»), «Recomendaciones» («Refuerza: …», «Ver ▶» lleva a Antes de jugar), «Evidencias recientes» y «Más de tu perfil» (Mis partidas, Recomendaciones, Evolución de la primera habilidad, Mi cuenta).
- **Escritorio:** tarjeta, sincronización y accesos en una columna lateral de 320 px; habilidades en tarjetas de 3 columnas; recomendaciones y evidencias lado a lado.
- **Estados:** `incomplete_data` con `graph` → aviso «Parte de tu perfil no cargó» en habilidades y bloque gris en recomendaciones. Con `document` y sin `description` → «El resumen no cargó; la evidencia sigue guardada». `pending_sync_count > 0` → `SyncBanner` y nueva consulta cada 3 s, máximo 5; después, «Tu progreso se actualizará en unos minutos» (no verificado contra la API: el dataset no deja eventos pendientes).
- **Criterios:** si falla una base secundaria, la página no se rompe completa; las barras usan el color de cada habilidad.

### 10 · Evidencias — `/evidencias`

- **Acceso:** usuario. **Prototipo:** `Evidencias.dc.html`. **Datos:** `GET /api/evidencias?id_habilidad` (F3a, provisional).
- **Tarjeta:** franja de tipos, trofeo, título, «{simulación} · {fecha}», chips de habilidades y pie «● Privada / Pública» + «{n} enlaces activos».
- **Estados:** vacío («Cada simulación completada puede guardarse como una evidencia»), cargando, error.

### 11 · Evidencia y enlaces — `/evidencias/[evidenceId]`

- **Acceso:** dueño. **Prototipo:** `EvidenciaDetalle.dc.html`.
- **Datos (provisionales):** `GET /api/evidencias/:id` (registro + instantánea), `GET /api/evidencias/:id/comparticiones`, `PATCH` para visibilidad, `DELETE` para eliminar y `DELETE /api/comparticiones/:id` para revocar.
- **Enlaces:** activos con destinatario (o «Sin destinatario»), vencimiento («sin vencimiento» si es nulo) y «Revocar» (con confirmación). Vencidos y revocados en gris al final, sin acciones.
- **Interacción:** el botón «● Privada» alterna la visibilidad. «✕» elimina la evidencia con confirmación (también elimina sus enlaces). «Crear enlace» abre la hoja 12.

### 12 · Crear enlace — hoja sobre la pantalla 11

- **Prototipo:** `Compartir.dc.html` (interactivo: elegir días y crear).
- **Datos (provisional):** `POST /api/evidencias/:id/comparticiones` `{ dias_vigencia, destinatario? }` → `{ token, url_publica, fecha_expiracion }`.
- **Interacción:** vigencia de 7, 30 (por defecto) o 90 días, con fecha calculada en vivo; destinatario opcional («solo es una nota; no se envía ningún correo»). Al crear: «Enlace listo · vence el …», la URL completa y «Copiar enlace» (`navigator.clipboard`, con confirmación «Copiado» durante 2 s).
- **Accesibilidad:** `role="dialog"`, `aria-modal`, foco atrapado, Esc cierra y el foco vuelve al botón que la abrió.

### 13 · Evidencia pública — `/e/[token]` (web)

- **Acceso:** público, sin sesión y sin `BottomNav`. **Prototipo:** `Publica.dc.html` (fluido, columna de 960 px).
- **Datos (provisional):** `GET /api/publico/evidencias/:token` → título, fecha, titular, contenido.
- **Contenido:** encabezado con logo, franja `tint` con trofeo, «{titular} · {fecha}», título y simulación; «Resumen», «Decisiones» (número, tipo de paso, título, retroalimentación, opción y consecuencias), «Puntuación» y «Habilidades practicadas».
- **Estados:** 404 → «Este enlace no está disponible» (no distinguir entre inexistente y revocado). 410 → «Este enlace ya venció». 503 → error genérico.
- **Criterios:** no se pide sesión; `noindex` en los metadatos; no hay enlaces que lleven al área privada.

### 14 · Estados y errores

Prototipo `Estados.dc.html`: catálogo de los 12 estados reutilizables (ver 03 para la tabla por `code`).

---

## Administración (web)

Todas bajo `/admin`, con `AdminShell`. Acceso: rol ADMIN (comprobar `user.role`; un estudiante ve el 403 de Estados). Prototipos `Admin*.dc.html`.

### A1 · Simulaciones — `/admin/simulaciones`

- **Datos:** `GET /api/admin/simulations?status&limit&offset` → tabla con título, estado (● Publicada, ○ Borrador, ■ Inactiva), dificultad, duración, habilidades con peso y acciones.
- **Pestañas:** Todas, Borrador, Publicada e Inactiva, con el `total` de cada una (una consulta por estado con `limit=1`). La pestaña activa va en la URL.
- **Acciones por estado:**
  - DRAFT: «Editar» (A2) y «Eliminar» (confirmación → `DELETE`, 204).
  - PUBLISHED: «Ver contenido» (A2 en solo lectura) y «Desactivar» (confirmación → `POST …/deactivate`).
  - INACTIVE: «Ver contenido».
- «+ Nueva simulación» → A2 en modo creación.
- **Errores:** `409 SIMULATION_NOT_EDITABLE` o `SIMULATION_NOT_PUBLISHED` → recargar la lista con un aviso.

### A2 · Editor de escenario — `/admin/simulaciones/nueva` y `/admin/simulaciones/[simulationId]`

- **Datos:**
  - Metadatos: de la lista hasta que exista el `GET` individual (D5). Crear con `POST /api/admin/simulations` `SimulationInput` (luego se reemplaza la URL por la del ID). Guardar con `PUT /api/admin/simulations/:id`.
  - Contenido: `GET …/content` → `{ version, steps }`; `404 MISSING_CONTENT` = escenario vacío con `version: null`. Guardar con `PUT …/content` `{ version, steps }` → nueva `version`.
  - Publicar: `POST …/publish` `{ version }` con la versión guardada.
- **Diseño:** barra con migas, título, estado, «Versión N guardada» (o «Cambios sin guardar»), «Guardar borrador» y «Publicar». Columna principal con los pasos; columna lateral con datos de la simulación, habilidades, mapa de rutas y la lista «Antes de publicar».
- **Paso:** cabecera con número (`order`), icono y selector de tipo (cambiar el tipo reinicia el contexto con confirmación), subir, bajar y eliminar. Campos: título, descripción, contexto por tipo (EMAIL: remitente, asunto, cuerpo; MEETING: participantes y agenda como listas editables; CONVERSATION: interlocutor y líneas `speaker`/`text`; TASK: entregables y plazo en horas; INCIDENT: cronología y severidad).
- **Opción:** texto, valoración (0–100, dos decimales como máximo), siguiente paso (selector con los pasos del escenario o «Termina la simulación»), retroalimentación (tipo, comentario y recomendación) y de 1 a 3 consecuencias (texto, impacto y tipo). Máximo 6 opciones por paso y 30 pasos.
- **IDs:** el cliente asigna `crypto.randomUUID()` a pasos y opciones nuevos. Reordenar recalcula `order` (1..n).
- **Validación en cliente** (`src/lib/scenario-validation.ts`, con pruebas): existe `order = 1`; cada paso tiene al menos una opción; cada opción tiene al menos una consecuencia; `next_step_id` apunta a un paso del escenario; no hay ciclos; todos los pasos se alcanzan desde el inicio; hay al menos una habilidad. Cada falla se muestra en «Antes de publicar» con enlace al campo. «Publicar» se deshabilita si hay fallas o cambios sin guardar. El servidor sigue siendo la autoridad.
- **Mapa de rutas:** árbol desde el paso 1 con las opciones como ramas («A ↓») hasta los pasos o «Fin». Un paso con error lleva borde `incorrect`.
- **Errores propios:** `409 STALE_CONTENT_VERSION` → aviso de Estados «Alguien guardó otra versión» con «Recargar versión», sin perder lo escrito hasta confirmar. `409 INCOMPLETE_CONTENT` o `INVALID_BRANCHES` → mostrar en «Antes de publicar». `404 SKILL_NOT_FOUND` → error en habilidades. `409 SIMULATION_NOT_EDITABLE` → pasar a solo lectura.
- **Solo lectura** (PUBLISHED o INACTIVE): los mismos bloques sin controles de edición y el aviso «El contenido publicado no se puede cambiar».
- **Al salir con cambios sin guardar:** confirmación (`beforeunload` y navegación interna).
- **Criterios:** crear, guardar, recargar y ver lo mismo; publicar deja la simulación en el catálogo del estudiante; una rama inválida no se publica.

### A3 · Habilidades — `/admin/habilidades`

- **Datos:** `GET /api/skills`; `POST /api/admin/skills`; `PUT /api/admin/skills/:id`; `DELETE /api/admin/skills/:id`.
- **Diseño:** tabla (tipo, nombre, categoría, objetivo, acciones) y formulario lateral para crear o editar (nombre, descripción, categoría, objetivo opcional de 0 a 100 y tipo visual).
- **Tipo visual:** el selector de 8 tipos depende de D1. Mientras no exista el campo en la API, se muestra deshabilitado con el tipo del mapa local.
- **Eliminar:** botón «Eliminar» con confirmación. `409 SKILL_IN_USE` → «Esta habilidad está asignada a una simulación». El prototipo muestra «En uso» porque la API no informa el uso de antemano: se descubre al intentar eliminar.
- **Errores:** `409 SKILL_ALREADY_EXISTS` → error bajo Nombre.

### Entrar como administración

Misma pantalla `/entrar`, en un contenedor centrado de 440 px en escritorio. Tras entrar con rol ADMIN → `/admin/simulaciones`.
