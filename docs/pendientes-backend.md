# Hallazgos del frontend resueltos en el backend

Los seis hallazgos del plan v2 quedaron resueltos en `develop` de `qatok-backend`. La tabla indica qué está disponible en la API o en el entorno de desarrollo y cómo lo usa el frontend.

| # | Tema | Resolución en el backend | Estado en el frontend |
|---|---|---|---|
| 1 | Tipo visual de la habilidad (D1) | `visual_type` disponible según DEC-29. [PR #52](https://github.com/The-Tito/qatok-backend/pull/52) | El selector de Admin se habilita al sincronizar el esquema compartido. |
| 2 | Simulación de Admin por ID (D5) | `GET /api/admin/simulations/:simulationId` devuelve `AdminSimulation` en cualquier estado. [PR #51](https://github.com/The-Tito/qatok-backend/pull/51) | El editor ya usa la consulta por ID. |
| 3 | Datos de prueba | El dataset incluye un paso `INCIDENT` y hay un comando local para probar la sincronización pendiente. [PR #55](https://github.com/The-Tito/qatok-backend/pull/55) | Ambos casos se pueden verificar en el entorno de desarrollo. |
| 4 | Errores al publicar | Los errores `409 INCOMPLETE_CONTENT` e `INVALID_BRANCHES` incluyen `details` con la causa y, cuando aplica, la ubicación. [PR #53](https://github.com/The-Tito/qatok-backend/pull/53) | El editor muestra la causa e identifica el paso y la opción cuando están disponibles. |
| 5 | Referencias en partidas y evolución | `Attempt` incluye `simulation: { id, title }` y la evolución incluye `skill: { id, name, target }`. [PR #54](https://github.com/The-Tito/qatok-backend/pull/54) | «Mis partidas» usa el título del intento y «Evolución» obtiene el nombre y la meta de su propia respuesta. |
| 6 | Saltos de línea en `shared/` | `.gitattributes` normaliza los archivos de texto a LF. [PR #50](https://github.com/The-Tito/qatok-backend/pull/50) | `npm run check:shared` verifica la copia contra el backend. |

## Tipo visual de la habilidad

Admin › Habilidades permite elegir entre `VOICE`, `FIRE`, `CLOCK`, `LEAF`, `SPARK`, `HEART`, `MIND` y `STONE`. La página pública de evidencia conserva su presentación actual. [DEC-29](https://github.com/The-Tito/qatok-backend/blob/develop/docs/decisiones-modelado.md#dec-29--tipo-visual-de-la-habilidad)

## Datos de prueba

- **Paso `INCIDENT`.** Abre el borrador «Servidor caído en hora pico» en Admin, publícalo y juégalo desde el catálogo.
- **Sincronización pendiente.** Desde el backend local, ejecuta `npm run db:sync:pendiente -- crear` y abre el perfil de Ana para ver «Actualizando tu progreso…». Al terminar, ejecuta `npm run db:sync:pendiente -- quitar`.
- **Enlace vencido.** El token `tok-ejemplo-expirado` sigue disponible para comprobar `410 SHARE_LINK_EXPIRED`.

## Consumo del contrato en el frontend

- Publicar devuelve `details: { reason, step_id?, option_id? }` en los errores de contenido y ramificación. El checklist del editor ya comprueba si se llega a todos los pasos desde el inicio. [Contrato de la API](https://github.com/The-Tito/qatok-backend/blob/develop/docs/api/contrato-v0.md)
- «Mis partidas» obtiene el título de `Attempt.simulation`, incluso si la simulación está desactivada. «Evolución» obtiene el nombre y la meta de `skill` y consulta `GET /api/profile/skills` para los chips, el tipo visual y la clasificación. [Contrato de la API](https://github.com/The-Tito/qatok-backend/blob/develop/docs/api/contrato-v0.md)
