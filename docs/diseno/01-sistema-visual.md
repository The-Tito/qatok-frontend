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

Reglas:

1. **Color de una simulación** = tipo de su habilidad con mayor `weight` (empate: la primera por nombre). La segunda habilidad aparece como franja proporcional a su peso en tarjetas.
2. Nunca texto sobre `base`. Texto oscuro (`dark` o `ink`) sobre `tint`; texto blanco solo sobre `dark` o `ink`.
3. El tipo siempre va acompañado de su nombre o del nombre de la habilidad: el color no es la única señal.

Implementación (`src/lib/skill-types.ts`), mientras se resuelve la decisión D1:

```ts
export const SKILL_TYPES = {
  VOICE: { label: 'Voz', base: '#E8A33D', dark: '#7A4A0B', tint: '#FCEBC8' },
  FIRE: { label: 'Fuego', base: '#D9483B', dark: '#8A1F16', tint: '#F9D7D2' },
  CLOCK: { label: 'Reloj', base: '#8A5CC7', dark: '#4B2A7A', tint: '#E9DDF7' },
  LEAF: { label: 'Hoja', base: '#4FA35A', dark: '#1F5A28', tint: '#D6EFD5' },
  SPARK: { label: 'Chispa', base: '#E2703A', dark: '#7E3410', tint: '#FBDCC9' },
  HEART: { label: 'Corazón', base: '#D66BA0', dark: '#7D2453', tint: '#F8D9E8' },
  MIND: { label: 'Mente', base: '#9AA33A', dark: '#4E5414', tint: '#EEF0CF' },
  STONE: { label: 'Piedra', base: '#8C8577', dark: '#45403A', tint: '#E8E4DC' },
} as const;
export type SkillTypeKey = keyof typeof SKILL_TYPES;

// Provisional (D1): mapa por ID. Se reemplaza por el campo de la API cuando exista.
const BY_SKILL_ID: Record<string, SkillTypeKey> = {
  'e0000000-0000-4000-8000-000000000201': 'VOICE',
  'e0000000-0000-4000-8000-000000000202': 'FIRE',
  'e0000000-0000-4000-8000-000000000203': 'CLOCK',
};
export const skillType = (skillId: string): SkillTypeKey => BY_SKILL_ID[skillId] ?? 'STONE';
```

Probar con pruebas unitarias: mapa conocido, respaldo `STONE` y la regla del mayor peso con empate.

## Componentes

Todos en `src/components/`. Cada uno con su variante en la página de muestra `/dev/componentes`, solo visible en desarrollo.

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
