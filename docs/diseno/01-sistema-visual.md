# 01 · Sistema visual

Estilo: RPG retro en pixel, **original**. No se usan personajes, nombres, tipografías ni recursos de juegos existentes. El retro está en los bordes duros, los sprites y las etiquetas; el texto largo es limpio y legible. Referencia exacta: [prototipo/Main.dc.html](prototipo/Main.dc.html).

## Tokens

Definir en `src/app/globals.css` y exponerlos a Tailwind v4 con `@theme inline` (o usarlos directamente como variables CSS).

```css
:root {
  /* Base */
  --color-bg: #ffffff;          /* fondo de todas las pantallas */
  --color-surface: #ffffff;     /* paneles: se distinguen por borde y sombra */
  --color-fill: #f5f3ef;        /* relleno suave: campos, encabezados de tabla, zonas secundarias */
  --color-ink: #2a2238;         /* texto, bordes, botón primario */
  --color-ink-muted: #5e5470;   /* texto secundario (contraste AA sobre blanco y relleno) */
  --color-line-soft: #e4dccb;   /* separadores discontinuos */
  --color-stone: #8c8577;       /* deshabilitado, decoración */

  /* Retroalimentación (texto oscuro sobre fondo claro) */
  --color-correct-bg: #d6efd5;  --color-correct-fg: #1f5a28;
  --color-partial-bg: #fcebc8;  --color-partial-fg: #7a4a0b;
  --color-incorrect-bg: #f9d7d2; --color-incorrect-fg: #8a1f16;

  /* Forma */
  --border: 3px;                /* borde estándar */
  --border-thin: 2px;           /* chips y botones pequeños */
  --shadow: 4px 4px 0 var(--color-ink);   /* sombra dura, sin desenfoque */
  --shadow-sm: 3px 3px 0 var(--color-ink);
  --radius: 0;                  /* nada redondeado, salvo la plataforma ovalada de la escena */

  /* Espaciado (múltiplos de 2): 4 6 8 10 12 14 16 18 20 24 28 32 */
}
```

- **Sin azules** en ningún token ni en decoraciones (preferencia del proyecto).
- Botón presionado: `box-shadow: none; transform: translate(4px, 4px)`.
- Foco visible: `outline: 3px solid #E8A33D; outline-offset: 2px` en todo control.

## Tipografía

Cargar con `next/font/google` y exponer como variables CSS.

| Uso | Fuente | Pesos | Notas |
|---|---|---|---|
| Títulos (`.pf` en el prototipo) | Chakra Petch | 600, 700 | Títulos de pantalla, puntuaciones, nombres de simulación |
| Etiquetas (`.sk`) | Silkscreen | 400, 700 | Siempre en MAYÚSCULAS con `letter-spacing: .04em`. Solo textos cortos (menos de 4 palabras): botones, chips, encabezados de sección |
| Texto | IBM Plex Mono | 400, 500, 600 | Correos, diálogos, retroalimentación, formularios, tablas |

Escala móvil: 32 / 28 / 24 / 22 / 19 / 16 / 14 / 13 / 12 / 11 / 10 px. Escritorio admin: títulos 38 y 32 px, texto 14 px. Ningún texto de lectura por debajo de 12 px (las etiquetas Silkscreen pueden bajar a 10 px y, en chips, a 9 px).

## Tipos de habilidad

Cada habilidad tiene un «tipo» visual con tres colores: `base` (decoración, franjas, barras), `dark` (texto sobre `tint` y fondo de botones con texto blanco) y `tint` (fondos de encabezado, chips y opción seleccionada).

| Clave | Nombre | base | dark | tint | Habilidad del dataset |
|---|---|---|---|---|---|
| `VOICE` | Voz | `#E8A33D` | `#7A4A0B` | `#FCEBC8` | Comunicación efectiva (`…0201`) |
| `FIRE` | Fuego | `#D9483B` | `#8A1F16` | `#F9D7D2` | Resolución de conflictos (`…0202`) |
| `CLOCK` | Reloj | `#8A5CC7` | `#4B2A7A` | `#E9DDF7` | Gestión del tiempo (`…0203`) |
| `LEAF` | Hoja | `#4FA35A` | `#1F5A28` | `#D6EFD5` | Libre (p. ej. trabajo en equipo) |
| `SPARK` | Chispa | `#E2703A` | `#7E3410` | `#FBDCC9` | Libre |
| `HEART` | Corazón | `#D66BA0` | `#7D2453` | `#F8D9E8` | Libre |
| `MIND` | Mente | `#9AA33A` | `#4E5414` | `#EEF0CF` | Libre |
| `STONE` | Piedra | `#8C8577` | `#45403A` | `#E8E4DC` | Respaldo para habilidades sin tipo |

En `globals.css` cada tipo tiene `--type-<clave>-base|dark|tint`. Un elemento con `data-type="VOICE"` (o cualquier otra clave) fija `--type-base`, `--type-dark` y `--type-tint`, que son las únicas variables que usan los componentes; sin `data-type` valen las de `STONE`.

Reglas:

1. **Color de una simulación** = tipo de su habilidad con mayor `weight` (empate: la primera por nombre). La segunda habilidad aparece como franja proporcional a su peso en tarjetas.
2. Nunca texto sobre `base`. Texto oscuro (`dark` o `ink`) sobre `tint`; texto blanco solo sobre `dark` o `ink`.
3. El tipo siempre va acompañado de su nombre o del nombre de la habilidad: el color no es la única señal.

Implementación: `src/lib/skill-types.ts` (issue 0.2). Los colores no se repiten en TypeScript: viven en `globals.css` y se eligen con `data-type`.

- `SKILL_TYPES`: clave → nombre («Voz», «Fuego»…).
- `skillType(skillId)`: **provisional (D1)**, mapa por ID del dataset (`…0201` VOICE, `…0202` FIRE, `…0203` CLOCK) con respaldo `STONE`. Se reemplaza por el campo de la API cuando exista.
- `mainSkill(skills)` y `simulationType(skills)`: la regla 1 de arriba (mayor `weight`, empate por nombre; sin habilidades, `STONE`).
- Pruebas en `src/lib/skill-types.test.ts`.

## Componentes

Todos en `src/components/`. Cada uno con su variante en la página de muestra `/dev/componentes`, solo visible en desarrollo (en producción da 404).

Hechos en el issue 0.3 (estilos en `src/components/ui.css`): `PixelButton`, `TypeChip`, `Chip`, `FeedbackBadge`, `ImpactBadge`, `ClassificationBadge` (en `Badges.tsx`), `LevelBar`, `StateCard` y `LoadingCard`, `SyncBanner`, `Sheet` (hoja inferior en móvil, diálogo centrado de 520 px desde 1024 px, con `<dialog>` modal) y las estructuras `StudentShell` (BottomNav debajo de 1024 px, barra superior desde 1024 px) y `AdminShell` (en `Shells.tsx`). Los componentes del juego (`OptionList`, `DialogBox`, `StepHeader`, `StepContext`, `Sprite`, `Sparkle`) y `Field` llegan con sus pantallas.

| Componente | Prototipo | Especificación |
|---|---|---|
| `PixelButton` | Main §04 | Variantes `primary` (ink, texto blanco), `type` (fondo `dark` del tipo), `secondary` (blanco con borde), `danger-link`, deshabilitado (borde discontinuo `stone`). Alto mínimo 48 px (móvil 52–56 px). Texto Silkscreen. Puede renderizar `<button>` o `<Link>` |
| `Panel` | todos | Blanco, borde 3 px ink, sombra dura. Variante `flat` sin sombra |
| `TypeChip` | Catálogo | Chip Silkscreen con `tint` y texto `dark`; muestra nombre de tipo o de habilidad y, opcional, el peso en % |
| `TypeStripe` | Catálogo | Franja superior de 10–12 px dividida por pesos |
| `LevelBar` | Perfil | Barra segmentada (segmentos de 16 px), relleno con `base`, marca vertical del objetivo, valor «75/75». `role="meter"` con `aria-valuenow/min/max` |
| `FeedbackBadge` | Decisión | ★ Acierto / ◆ Parcial / ✕ Error con los colores de retroalimentación |
| `ImpactBadge` | Decisión | ▲ Positiva / ■ Neutra / ▼ Negativa |
| `OptionList` | Paso correo | `role="radiogroup"`; cada opción es `role="radio"` con cursor ▶. Seleccionada: fondo `tint`, sombra. Navegable con flechas |
| `DialogBox` | Conversación | Panel con nombre del hablante en Silkscreen y ▼ al final |
| `StepHeader` | Juego | Barra de 64 px con fondo `tint`: botón pausa «II», «Paso N · Tipo», título truncado, icono del tipo |
| `StepContext` | Juego | Un renderizador por tipo: EMAIL, MEETING, CONVERSATION, TASK, INCIDENT (ver 02) |
| `SyncBanner` | Resultado | Panel ink con barra de carga a rayas; se muestra si `graph = PENDING` |
| `StateCard` | Estados | Vacío, error, sin permiso, sesión vencida, enlace vencido o no válido |
| `Sprite` | sprites/ | `<img>` de `public/sprites/*.svg` con `image-rendering: pixelated`; decorativo con `alt=""` |
| `Sparkle` | todos | Destello de 11×11 en el color indicado; decorativo |
| `BottomNav` | Catálogo, Perfil, Evidencias | 72 px, 3 destinos: Jugar, Perfil, Evidencias. El activo con fondo ink y `aria-current="page"` |
| `AdminShell` | Admin | Barra superior ink con «QATO'K · Admin», navegación Simulaciones / Habilidades y usuario con «Salir» |
| `Field` | Formularios | `<label>` + control con borde 3 px y fondo `fill`. Error: borde y fondo de `incorrect`, mensaje debajo con ✕ y `aria-describedby` |

## Logo

Propuesta 4 (cuadro de diálogo), sacada de `prototipo-v2/movil/Logo.dc.html`: `public/logo.svg` (símbolo 16×16), `public/logo-texto.svg` (palabra «QATOK» 64×15) y `src/app/icon.svg` (favicon). Escalar por múltiplos enteros.

## Sprites

En [sprites/](sprites/): `student.svg`, `interlocutor.svg`, `student-back.svg`, `trophy.svg`, `envelope.svg`, `bubble.svg`, `meeting.svg`, `task.svg`, `incident.svg`, `sparkle.svg`. Rejilla de 16×16 (personajes y trofeo) o menor (iconos). Escalar solo por múltiplos enteros cuando sea posible (2×, 3×, 4×…).

El color de la camisa del estudiante (`#8A5CC7` en el archivo) puede cambiarse por el `base` del tipo, si se quiere, usando el SVG en línea.

## Accesibilidad (obligatoria)

- Contraste AA: todas las combinaciones de esta página cumplen 4.5:1 para texto normal. No inventar combinaciones nuevas sin comprobarlas.
- Controles reales: `<button>`, `<a href>`, `<input>` con `<label>`. Nada clicable en `<div>`.
- Botones solo con icono: `aria-label` («Pausar y salir», «Volver», «Cerrar»).
- Objetivos táctiles de 44 px o más.
- Sprites y destellos: `alt=""` o `aria-hidden="true"`, salvo el interlocutor de la conversación (`alt` con su nombre y estado).
- Respetar `prefers-reduced-motion`: sin animación de la barra de carga ni transiciones.
