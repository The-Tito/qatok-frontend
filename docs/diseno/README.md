# Diseño de la interfaz de QATO'K

Paquete de diseño para implementar la interfaz en Next.js. Está pensado para un agente de código (Codex) o para cualquier persona del equipo: cada pantalla trae su ruta, sus endpoints, sus estados y sus criterios de aceptación.

## Qué hay aquí

| Archivo | Para qué |
|---|---|
| [01-sistema-visual.md](01-sistema-visual.md) | Tokens de color, tipografía, componentes, tipos de habilidad y accesibilidad |
| [02-pantallas.md](02-pantallas.md) | Las 17 pantallas: ruta, acceso, datos, interacción, estados y criterios |
| [03-api-sesion-y-estados.md](03-api-sesion-y-estados.md) | Cliente de la API, sesión, guardas, errores por `code`, sincronización y datos simulados |
| [04-plan-de-implementacion.md](04-plan-de-implementacion.md) | Orden de trabajo por pasos, con comprobaciones y reglas de Git |
| [prototipo/](prototipo/) | Código fuente de cada pantalla del prototipo (`*.dc.html`). Referencia visual exacta: medidas, colores y textos |
| [sprites/](sprites/) | Pixel art propio en SVG, listo para copiar a `public/sprites/` |

El prototipo navegable vive en un lienzo privado de Claude (https://claude.ai/artifact/NrU42y9cmwNpGYLBG5WUG2). Quien no tenga acceso debe usar los archivos de `prototipo/`, que contienen lo mismo.

## Cómo leer el prototipo

Cada `prototipo/*.dc.html` es HTML con estilos en línea. No se ejecuta tal cual (depende del runtime del lienzo): se usa como especificación. Reglas para traducirlo:

- `{{c.tint}}`, `{{c.dark}}` y `{{c.base}}` son los tres colores del tipo de habilidad de la simulación (ver 01, «Tipos de habilidad»).
- `<sc-for>` es un `map`, `<sc-if>` un render condicional y `onClick="{{x}}"` un manejador. La lógica de ejemplo está en el `<script type="text/x-dc">` al final de cada archivo.
- Clases del prototipo: `.pf` = fuente de títulos, `.sk` = etiquetas en Silkscreen mayúsculas, `.px` = borde de 3 px y sombra dura de 4 px, `.seg` = barra segmentada, `svg.sp` = sprite con `shape-rendering: crispEdges`.
- Los textos y datos vienen de `qatok-backend/database/seed/dataset.json`. En la app salen de la API; nunca se escriben fijos.

## Decisiones abiertas (las resuelve Antonio antes del paso indicado)

| # | Decisión | Propuesta | Bloquea |
|---|---|---|---|
| D1 | Cómo se sabe el tipo visual (color) de una habilidad (pedido al backend en `docs/pendientes-backend.md`) | Agregar `visual_type` a la habilidad en el backend y elegirlo en Admin › Habilidades. Mientras tanto, mapa local por ID con respaldo `STONE` | Paso 3 (mapa local), paso 10 (selector admin) |
| D2 | Datos simulados para pantallas cuyo endpoint aún no existe | MSW solo en desarrollo, activado con `NEXT_PUBLIC_API_MOCKS=true`. Cambia la regla de «una sola variable de entorno» | Paso 2 |
| D3 | Ruta pública de una evidencia y quién arma `url_publica` | Ruta `/e/[token]`. El backend necesita la URL base del frontend para construir `url_publica` | Paso 9 |
| D4 | Contrato de F3a y F3b (perfil, evidencias, compartir) | Reescribirlo en inglés como F1 y F2 antes de conectar esas pantallas; hasta entonces se usan tipos provisionales aislados | Pasos 8 y 9 |
| D5 | Falta `GET /api/admin/simulations/:id` para abrir el editor | Agregarlo en el backend. Mientras tanto, buscar la simulación en `GET /api/admin/simulations` | Paso 10 |

## Alcance

- **Estudiante:** móvil primero (RF-10), probado a 360–430 px de ancho. En escritorio, el contenido se centra en una columna de 480 px.
- **Administración:** web de escritorio, desde 1024 px. A menos ancho las tablas se desplazan dentro de su caja y los paneles se apilan.
- **Fuera de alcance:** logo (hay un espacio reservado `[LOGO]`), modo oscuro, internacionalización (todo en español) y el piloto con LLM.
