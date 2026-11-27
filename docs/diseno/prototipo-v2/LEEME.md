# Prototipo v2 (diseño aprobado el 2026-11-27)

Exportado del lienzo «QATO'K — Diseño de interfaz (Copy)»: https://claude.ai/artifact/Q1todA3So5HZzW4Jzyc885

Se leen igual que `../prototipo/` (ver `../README.md`, «Cómo leer el prototipo»). Los textos de los stickies del lienzo están abajo: traen los endpoints de cada pantalla y qué cambió respecto a v1.

- `movil/`: página «Propuestas v2» (estudiante en móvil y admin en escritorio), en el orden del lienzo.
- `web/`: página «v2 · Web» (estudiante desde 1024 px).
- Logo: la propuesta elegida (4, cuadro de diálogo) está en la hoja de marca `movil/Logo.dc.html`; la app usa `public/logo.svg`.
- Ejemplo de animación: `../prototipo/ejemplo-animacion-paso.html`.

## Propuestas v2 → movil/

| Archivo | Pantalla |
|---|---|
| `LoginV2.dc.html` | LoginV2 · Entrar |
| `RegistroV2.dc.html` | RegistroV2 · Crear cuenta |
| `CatalogoV2.dc.html` | CatalogoV2 · Catálogo |
| `Logo.dc.html` | Marca · Logo (propuesta 4) |
| `SimulacionV2.dc.html` | SimulacionV2 · Antes de jugar |
| `PartidaEnCurso.dc.html` | J6 · Antes de jugar · 409 en curso |
| `JugarCorreoV2.dc.html` | JugarCorreoV2 · Paso: correo |
| `DecisionV2.dc.html` | DecisionV2 · Resultado de la decisión |
| `JugarConversacionV2.dc.html` | JugarConversacionV2 · Paso: conversación |
| `JugarReunion.dc.html` | J1 · Paso: reunión (MEETING) |
| `JugarTarea.dc.html` | J2 · Paso: tarea (TASK) |
| `JugarIncidente.dc.html` | J3 · Paso: incidente (INCIDENT) |
| `JugarPausa.dc.html` | J4 · Pausa |
| `JugarAbandonada.dc.html` | J5 · Partida abandonada |
| `ResultadoV2.dc.html` | ResultadoV2 · Simulación completada |
| `GuardarEvidencia.dc.html` | J7 · Guardar como evidencia |
| `PerfilV2.dc.html` | PerfilV2 · Perfil |
| `Recorrido.dc.html` | P2 · Recorrido de un intento (C-03) |
| `Evolucion.dc.html` | P3 · Evolución de una habilidad (C-05) |
| `Recomendaciones.dc.html` | P4 · Recomendaciones (C-01) |
| `MisPartidas.dc.html` | P5 · Mis partidas |
| `EvidenciasV2.dc.html` | EvidenciasV2 · Evidencias |
| `EvidenciaDetalleV2.dc.html` | EvidenciaDetalleV2 · Evidencia y enlaces |
| `CompartirV2.dc.html` | CompartirV2 · Crear enlace |
| `PublicaV2.dc.html` | PublicaV2 · Evidencia pública (web) |
| `MiCuenta.dc.html` | C1 · Mi cuenta |
| `MiCuentaEliminar.dc.html` | C2 · Eliminar cuenta |
| `AdminEntrar.dc.html` | A0 · Entrar (escritorio) |
| `AdminSimulacionesV2.dc.html` | AdminSimulacionesV2 · Admin: simulaciones |
| `AdminConfirmaciones.dc.html` | A1/A3 · Confirmaciones |
| `AdminEditorV2.dc.html` | AdminEditorV2 · Admin: editor de escenario |
| `AdminEditorLectura.dc.html` | A2 · Editor: solo lectura |
| `AdminEditorConflicto.dc.html` | A2 · Editor: 409 versión |
| `AdminHabilidadesV2.dc.html` | AdminHabilidadesV2 · Admin: habilidades |

## v2 · Web → web/

| Archivo | Pantalla |
|---|---|
| `LoginWeb.dc.html` | 1 Web · Entrar |
| `RegistroWeb.dc.html` | 9 Web · Crear cuenta |
| `CatalogoWeb.dc.html` | 2 Web · Catálogo |
| `SimulacionWeb.dc.html` | 3 Web · Antes de jugar |
| `PartidaEnCursoWeb.dc.html` | J6 Web · Antes de jugar · 409 en curso |
| `JugarCorreoWeb.dc.html` | 4 Web · Paso: correo |
| `DecisionWeb.dc.html` | 5 Web · Resultado de la decisión |
| `JugarConversacionWeb.dc.html` | 6 Web · Paso: conversación |
| `JugarReunionWeb.dc.html` | J1 Web · Paso: reunión (MEETING) |
| `JugarTareaWeb.dc.html` | J2 Web · Paso: tarea (TASK) |
| `JugarIncidenteWeb.dc.html` | J3 Web · Paso: incidente (INCIDENT) |
| `JugarPausaWeb.dc.html` | J4 Web · Pausa |
| `JugarAbandonadaWeb.dc.html` | J5 Web · Partida abandonada |
| `ResultadoV2Web.dc.html` | ResultadoV2 Web · Simulación completada |
| `GuardarEvidenciaWeb.dc.html` | J7 Web · Guardar como evidencia |
| `PerfilV2Web.dc.html` | PerfilV2 Web · Perfil |
| `RecorridoWeb.dc.html` | P2 Web · Recorrido de un intento (C-03) |
| `EvolucionWeb.dc.html` | P3 Web · Evolución de una habilidad (C-05) |
| `RecomendacionesWeb.dc.html` | P4 Web · Recomendaciones (C-01) |
| `MisPartidasWeb.dc.html` | P5 Web · Mis partidas |
| `EvidenciasV2Web.dc.html` | EvidenciasV2 Web · Evidencias |
| `EvidenciaDetalleV2Web.dc.html` | EvidenciaDetalleV2 Web · Evidencia y enlaces |
| `CompartirV2Web.dc.html` | CompartirV2 Web · Crear enlace |
| `MiCuentaWeb.dc.html` | C1 Web · Mi cuenta |
| `MiCuentaEliminarWeb.dc.html` | C2 Web · Eliminar cuenta |

## Notas del lienzo

### Propuestas v2

```text
ENDPOINTS · JUGAR
• Antes de jugar: GET /api/simulations/:id. «Comenzar» → POST /api/attempts {simulation_id}.
• Correo y Conversación: igual que J1–J3. Decisión: respuesta de POST /api/attempts/:id/responses (consequences, feedback, next_step).
• J1–J3 Reunión, Tarea, Incidente: current_step de POST /api/attempts o GET /api/attempts/:id. «Decidir» → POST /api/attempts/:id/responses {step_id, option_id}. Las opciones llegan sin score.
• J4 Pausa: «Salir y continuar después» solo navega. «Abandonar partida» → confirmación → POST /api/attempts/:id/abandon.
• J5 Abandonada: respuesta de abandon (status ABANDONED).
• J6 409: POST /api/attempts → 409 ACTIVE_ATTEMPT_EXISTS con details.attempt_id. «Continuar» → GET /api/attempts/:id. «Abandonar y empezar de nuevo» → abandon + POST /api/attempts.
• J7 Guardar: POST /api/evidence {attempt_id, title?} (máx. 150; vacío = título de la simulación). 409 EVIDENCE_ALREADY_EXISTS → «Ver evidencia» con details.evidence_id. Propiedad «estado» para ver los dos.
SUPUESTOS: el dataset no tiene pasos INCIDENT, así que J3 usa [corchetes] y el tipo Piedra (propiedad «severidad»). «Paso N» es el order del paso. J7 sobre el intento 0701, que ya tiene la evidencia 1101.
```

```text
RESULTADOV2 · QUÉ CAMBIÓ
• «Guardar como evidencia» abre la hoja J7 (antes no llevaba a ningún lado).
• «Ver recorrido» lleva a P2 Recorrido (C-03).
• La decisión 1 muestra el texto completo de la opción del dataset; la v1 lo abreviaba.
```

```text
ENDPOINTS · PERFIL Y EVIDENCIAS
• PerfilV2: GET /api/profile.
• P2 Recorrido: GET /api/profile/attempts/:id/path. graph_pending = aviso suave, no error (propiedad graphPending).
• P3 Evolución: GET /api/profile/skills/:skillId/evolution → current_level y points.
• P4 Recomendaciones: GET /api/profile/recommendations → items[simulation, skills_to_improve, priority].
• P5 Mis partidas: GET /api/attempts?status. items solo trae simulation_id: el título y el color se toman del catálogo (GET /api/simulations).
• EvidenciasV2: GET /api/evidence?skill_id&limit&offset (C-04 con filtro).
• EvidenciaDetalleV2: GET /api/evidence/:id + GET /api/evidence/:id/shares.
• CompartirV2: POST /api/evidence/:id/shares {expires_in_days, recipient?}.
• PublicaV2: GET /api/public/evidence/:token.
DATOS: Ana López (0101). Contadores, objetivos (Tiempo usa el respaldo 60), prioridad y puntos de evolución salen de database/graph/tests/esperados.mjs. La prioridad (14) no se muestra como número: solo ordena (#1).
```

```text
PERFILV2 · QUÉ CAMBIÓ
• Campos reales de GET /api/profile: user.name y summary (3 completadas, 1 evidencia).
• Cada habilidad muestra correct, partial e incorrect. NO_REFERENCE va sin etiqueta y, si target es nulo, sin marca de objetivo.
• Hasta 5 recomendaciones y 5 evidencias recientes con description.
• incomplete_data («graph» o «document») y pending_sync_count: propiedades «datos» y «pendientes».
• Accesos a Mis partidas, Recomendaciones, Evolución y Mi cuenta.
• Más alta (1400 px) porque la pantalla se desplaza.
```

```text
EVIDENCIASV2 · QUÉ CAMBIÓ
• Chips por habilidad (skill_id) con su nombre, no con el tipo.
• «Tiempo» muestra el vacío: la evidencia 1101 no demuestra Gestión del tiempo (C-04).
• «Cargar más» con limit/offset: propiedad masPaginas (el dataset solo tiene 1).
```

```text
EVIDENCIADETALLEV2 · QUÉ CAMBIÓ
• Las decisiones de la instantánea muestran option, consequences y FeedbackBadge (feedback_type). Sin comentario ni recomendación: no llegan.
• Enlaces con status ACTIVE/REVOKED e is_valid; recipient nulo → «Sin destinatario»; expires_at nulo → «sin vencimiento».
• Acceso a «Ver recorrido».
```

```text
COMPARTIRV2 · QUÉ CAMBIÓ
• Vigencia de 1 a 90 días: campo numérico y atajos 7, 30 (por defecto) y 90. Fechas contadas desde el 26 nov 2026.
• El enlace es {origen del frontend}/e/{token}; public_url es relativa a la API.
• «Para quién» es texto libre (recipient, máx. 150), no un correo.
```

```text
PUBLICAV2 · QUÉ CAMBIÓ
• SharedEvidence trae skills solo con name, sin tipo: chips neutros y cabecera en relleno #F5F3EF en vez del tinte Voz.
• Cabecera «{owner.name} · {generated_at}».
• Decisiones con FeedbackBadge, sin comentario ni recomendación.
```

```text
ENDPOINTS · CUENTA
• C1: GET /api/me (name, email, registered_at). «Guardar nombre» → PATCH /api/me {name} (1–100). Correo y fecha de registro, solo lectura.
• «Salir» borra el token de la sesión; no hay endpoint.
• C2: DELETE /api/me tras escribir el correo (confirmación fuerte). El botón se activa cuando coincide.
DATOS: 4 partidas y 3 enlaces son los de Ana en el dataset.
```

```text
ENDPOINTS · ADMIN
• A0: POST /api/auth/login. El mismo formulario del móvil en un contenedor centrado de 440 px.
• Eliminar borrador: DELETE /api/admin/simulations/:id (204; 409 SIMULATION_NOT_EDITABLE).
• Desactivar: POST /api/admin/simulations/:id/deactivate (DEC-26: quien ya juega puede terminar).
• Eliminar habilidad: DELETE /api/admin/skills/:id → 409 SKILL_IN_USE. Las 3 habilidades del dataset están en uso.
• Solo lectura: GET /api/admin/simulations/:id/content para los pasos. Los metadatos salen de GET /api/admin/simulations mientras D5 (GET /api/admin/simulations/:id) siga pendiente.
• Conflicto: PUT /api/admin/simulations/:id/content {version, steps} → 409 STALE_CONTENT_VERSION. «Recargar versión» = GET …/content. Las versiones van como [N] porque el dataset no las trae.
SUPUESTO: los tipos visuales siguen fijos por habilidad hasta que se resuelva D1 (visual_type).
Copias v1 (sin cambios de diseño): AdminSimulacionesV2 → GET /api/admin/simulations?status; AdminEditorV2 → GET/PUT /api/admin/simulations/:id/content y POST …/publish; AdminHabilidadesV2 → GET /api/skills, POST/PUT/DELETE /api/admin/skills.
```

```text
COPIAS DE «DISEÑO ACTUAL» · SIN CAMBIOS DE DISEÑO
• Entrar, Crear cuenta, Catálogo, Antes de jugar, Correo, Decisión y Conversación (y en Admin: Simulaciones, Editor y Habilidades) se copiaron tal cual desde la página v1, con sufijo V2.
• Solo cambian los enlaces, para que v2 se navegue completa: «Crear cuenta» abre RegistroV2; «Partida en curso» → J2 Tarea; la tarjeta de Tres entregas → J6 (Ana ya la tiene en curso); Evidencias del BottomNav → EvidenciasV2; «II» en los pasos → J4 Pausa; «Ver contenido» → editor de solo lectura; «Salir» de admin → A0.
ENDPOINTS: POST /api/auth/login · POST /api/auth/register (409 EMAIL_ALREADY_REGISTERED) · GET /api/simulations?search&difficulty&skill_id.
```

### v2 · Web

```text
JUGAR WEB · QUÉ CAMBIA RESPECTO AL MÓVIL
• Barra de juego a todo el ancho con «II Pausar», el paso y la simulación; sin menú principal mientras se juega.
• Dos columnas: situación (contexto del paso) a la izquierda; opciones y «Decidir» a la derecha. Se apilan en pantallas angostas.
• Pausa, Guardar evidencia, Crear enlace y Eliminar cuenta pasan de hoja inferior a diálogo centrado de 520 px.
• Mismos endpoints que la fila móvil de «Propuestas v2».
```

```text
• Abandonada, 409 en curso y Resultado usan el encabezado web del estudiante (Jugar, Perfil, Evidencias, nombre y Salir) en vez del BottomNav.
• 409: la ficha de la simulación a la izquierda y el aviso con Continuar / Abandonar arriba a la derecha.
• Resultado: trofeo y puntuación a la izquierda; decisiones, progreso y acciones a la derecha.
```

```text
PERFIL WEB · QUÉ CAMBIA
• Perfil: tarjeta, sincronización y accesos en una columna lateral; habilidades en tarjetas de 3 columnas; recomendaciones y evidencias recientes lado a lado. Las propiedades «datos» y «pendientes» siguen funcionando.
• Recorrido: resumen arriba a la derecha y decisiones en dos columnas.
• Evolución: gráfica ancha (hasta 720 px) y lista de partidas al lado.
• Recomendaciones: cuadrícula de tarjetas.
```

```text
• Mis partidas: tabla (simulación, estado, fecha, puntuación, acción) con scroll horizontal si no cabe.
• Evidencias: cuadrícula de tarjetas y «Cargar más» centrado.
• Evidencia: contenido a la izquierda; enlaces, «Crear enlace» y «Eliminar evidencia» en la columna derecha.
• Crear enlace: diálogo centrado.
```

```text
CUENTA WEB
• Formulario de nombre y datos de solo lectura lado a lado (máx. 760 px); Salir y Eliminar cuenta abajo.
• Eliminar cuenta: diálogo centrado con la misma confirmación por correo.
```

```text
ENTRADA Y FLUJO BASE WEB · QUÉ CAMBIA
• Entrar y Crear cuenta: el mismo formulario en un contenedor centrado de 440 px, con el suelo pixel abajo. Crear cuenta mantiene el error 409 EMAIL_ALREADY_REGISTERED de Bruno.
• Catálogo: encabezado web, saludo y «Partida en curso» en la misma fila, buscador y filtros en una línea, tarjetas en cuadrícula. «Tres entregas para mañana» lleva al 409 J6 porque Ana ya la tiene en curso.
• Antes de jugar: ilustración a la izquierda; datos, «Entrena» y «Comenzar» a la derecha.
• Correo, Decisión y Conversación: barra de juego y dos columnas, igual que J1–J3. Conversación lleva a ResultadoV2 Web.
• Endpoints: POST /api/auth/login, POST /api/auth/register, GET /api/simulations, GET /api/simulations/:id, POST /api/attempts y POST /api/attempts/:id/responses.
• Ahora todos los enlaces de esta página van a versiones web. Resultado, Perfil, Evidencias, Evidencia y Crear enlace v1 no se duplicaron: sus versiones web son las V2 Web.
```
