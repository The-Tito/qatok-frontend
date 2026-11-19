# CLAUDE.md — qatok-frontend (interfaz de QATO'K)

Interfaz Next.js de QATO'K. El contexto completo del proyecto (dominio, arquitectura, plan, convenciones, contrato de la API) está en el repo hermano **The-Tito/qatok-backend** (`../qatok-backend/CLAUDE.md`). Léelo antes de cambiar algo aquí.

## Reglas

- La interfaz **solo** consume la API (`NEXT_PUBLIC_API_URL`). Prohibido: drivers de bases (ESLint lo bloquea), Route Handlers o Server Actions como backend, credenciales de bases.
- `src/shared/` es una **copia de solo lectura** de `qatok-backend/shared/src`. No se edita: se cambia en el backend y se trae con `npm run sync:shared` (commit propio). `npm run check:shared` y el CI fallan si difiere.
- Los tipos se importan de `@qatok/shared` (alias en `tsconfig.json`); no se redefinen.
- El contrato de los endpoints está en `../qatok-backend/docs/api/contrato-v0.md`; los errores en `../qatok-backend/context/convenciones.md` §5.

## Comandos

```bash
npm install
npm run verificar      # lint + formato + tipos + check:shared (debe quedar en verde antes de cada commit)
npm run sync:shared    # trae shared/ desde ../qatok-backend
```

## Git

Gitflow: `feature/*` desde `develop`, un commit por implementación (`<ámbito>: <qué cambia>`), PR a `develop`.
