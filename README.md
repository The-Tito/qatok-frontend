# qatok-frontend — interfaz de QATO'K (Next.js)

Interfaz de **QATO'K**, el proyecto final de Bases de Datos en la Nube. La API, las tres bases (PostgreSQL, MongoDB y Neo4j), la documentación y el plan de trabajo están en **[The-Tito/qatok-backend](https://github.com/The-Tito/qatok-backend)**.

La app Next.js consume solo la API del backend y es responsive (menos de 768 px, de 768 a 1023 px y desde 1024 px). Pantallas:

| Área | Rutas |
|---|---|
| Público | `/` (redirige por sesión y rol), `/entrar`, `/registro`, `/e/[token]` (evidencia compartida), `/estado` (salud de la API) |
| Estudiante | `/simulaciones`, `/simulaciones/[id]`, `/jugar/[attemptId]`, `/perfil`, `/perfil/habilidades/[skillId]`, `/perfil/recomendaciones`, `/perfil/partidas`, `/perfil/partidas/[attemptId]`, `/evidencias`, `/evidencias/[id]`, `/cuenta` |
| Administración | `/admin/simulaciones`, `/admin/simulaciones/nueva`, `/admin/simulaciones/[id]` (editor y publicar), `/admin/habilidades` |
| Desarrollo | `/dev/componentes` (muestra de componentes; 404 en producción) |

Con el dataset del backend se entra como estudiante con `ana.lopez@ejemplo.com` o `bruno.diaz@ejemplo.com` y como administradora con `carla.ruiz@ejemplo.com` (contraseña de demostración del README del backend).

## Reglas que no se negocian (guía §7.6, convenciones §6.8)

- La interfaz **solo** consume la API del backend. ESLint bloquea importar `pg`, `mongodb` o `neo4j-driver`.
- **No** se usan Route Handlers (`app/api/*`) ni Server Actions como backend.
- **No** hay credenciales de bases en el entorno: la única variable es `NEXT_PUBLIC_API_URL`.
- Los tipos y esquemas se importan de `@qatok/shared`; no se redefinen.
- Las rutas y los textos de la interfaz están en español, como define el plan v2 ([docs/diseno/04](docs/diseno/04-plan-de-implementacion.md)); el código (componentes, funciones, tipos) en inglés.

## Preparar tu máquina

Necesitas Node.js 22 o superior (recomendado 24, ver `.nvmrc`) y Git. Clona los dos repos **en carpetas hermanas**:

```bash
git clone git@github.com:The-Tito/qatok-backend.git
git clone git@github.com:The-Tito/qatok-frontend.git
cd qatok-frontend
git checkout develop
npm ci
cp .env.example .env.local
npm run verificar
npm run dev
```

Sigue el [inicio rápido del backend](https://github.com/The-Tito/qatok-backend#inicio-rápido) para inicializar las bases y arrancar la API en `http://localhost:4000/api`. Abre `http://localhost:3000` para entrar, o `http://localhost:3000/estado` para ver el estado y la latencia de cada motor. La API permite ese origen mediante CORS.

## Tipos compartidos: `src/shared/`

`src/shared/` es una **copia de solo lectura** de `shared/src/` de `qatok-backend`, que es la fuente única del contrato. Se importa con el alias `@qatok/shared` (ver `tsconfig.json`):

```ts
import { ErrorRespuesta, Session, SimulationCatalog } from '@qatok/shared';
```

| Comando | Qué hace |
|---|---|
| `npm run sync:shared` | Copia `../qatok-backend/shared/src` a `src/shared/` y anota el commit de origen en `src/shared/ORIGEN.md` |
| `npm run check:shared` | Falla si la copia no coincide con el backend (el CI lo corre contra `develop` del backend) |
| `npm run test` | Pruebas de lógica con Vitest (cliente de la API, errores, sesión, rutas, tipos de habilidad, gráfica de evolución, contenido del editor); va dentro de `npm run verificar` |

- **Nunca** edites `src/shared/` a mano: cambia `shared/` en el backend (con su PR) y luego corre `npm run sync:shared` aquí, en un commit propio.
- Otra ruta del backend: `QATOK_BACKEND=/ruta/a/qatok-backend npm run sync:shared`.

## Compilar la app Next.js

```bash
npm run build
npm run start
```

Configura `NEXT_PUBLIC_API_URL` antes de compilar. Next.js incorpora ese valor en el código que recibe el navegador.

El diseño de todas las pantallas, el sistema visual y el plan de implementación están en [docs/diseno/](docs/diseno/README.md).

| Qué ya está listo en el backend | Dónde |
|---|---|
| Contrato de los endpoints, con ejemplos JSON para simularlos mientras no existan | `docs/api/contrato-v0.md` |
| Formato de error y códigos HTTP | `context/convenciones.md` §5 |
| Plan y forma de trabajo (gitflow, commits, PR) | `context/plan-trabajo.md`, `context/como-trabajar.md` |

## Forma de trabajo

Igual que en el backend: gitflow (`feature/<tarea>` desde `develop`), un commit por implementación con el formato `<ámbito>: <qué cambia>`, `npm run verificar` en verde antes de subir y PR a `develop` con `Closes #N`.

Issues de este repo: #2 (F3a interfaz), #3 (F1 y F3b interfaz), #4 (esqueleto Next.js) y #5 (F2 interfaz). La tabla completa de equivalencias con el monorepo anterior está en `context/github.md` del backend.

## Calidad

- Accesibilidad: Lighthouse móvil da 100 en accesibilidad en todas las pantallas (revisión del issue 8.1, contra la API local con el dataset). Todos los controles son elementos reales con etiqueta, el foco se ve (`outline` ámbar) y las opciones del juego se recorren con flechas.
- Movimiento: solo CSS por pasos y estados en `data-*` (DEC-F06). Con `prefers-reduced-motion: reduce` se apaga y el diálogo aparece completo.
