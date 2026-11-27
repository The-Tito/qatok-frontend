// Copia de solo lectura de shared/ (fuente única del contrato, vive en qatok-backend).
//   node scripts/sync-shared.mjs           → copia <backend>/shared/src a src/shared/ y anota el commit
//   node scripts/sync-shared.mjs --check   → falla (exit 1) si la copia difiere del backend
// <backend> es $QATOK_BACKEND o, por defecto, la carpeta hermana ../qatok-backend.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = resolve(raiz, process.env.QATOK_BACKEND ?? '../qatok-backend');
const origen = join(backend, 'shared', 'src');
const destino = join(raiz, 'src', 'shared');
const comprobar = process.argv.includes('--check');

if (!existsSync(origen)) {
  console.error(
    `No encuentro ${origen}. Clona qatok-backend junto a este repo o define QATOK_BACKEND.`,
  );
  process.exit(1);
}

const archivosTs = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.ts'))
        .sort()
    : [];

// Los saltos de línea se normalizan a LF: en Windows el backend puede estar con CRLF.
const leer = (archivo) => readFileSync(archivo, 'utf8').replace(/\r\n/g, '\n');

const enOrigen = archivosTs(origen);
const enDestino = archivosTs(destino);

if (comprobar) {
  const diferencias = [];
  for (const f of new Set([...enOrigen, ...enDestino])) {
    const a = join(origen, f);
    const b = join(destino, f);
    if (!existsSync(b)) diferencias.push(`falta en la copia: ${f}`);
    else if (!existsSync(a)) diferencias.push(`sobra en la copia: ${f}`);
    else if (leer(a) !== leer(b)) diferencias.push(`distinto: ${f}`);
  }
  if (diferencias.length > 0) {
    console.error('src/shared/ no coincide con qatok-backend/shared/src:');
    for (const d of diferencias) console.error(`  - ${d}`);
    console.error('Corre `npm run sync:shared` y haz commit del resultado.');
    process.exit(1);
  }
  console.warn(`src/shared/ coincide con ${origen} (${enOrigen.length} archivos).`);
  process.exit(0);
}

let commit = 'desconocido';
try {
  commit = execFileSync('git', ['-C', backend, 'rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
} catch {
  // El backend puede no ser un repo git (por ejemplo, una copia descargada).
}

rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });
for (const f of enOrigen) writeFileSync(join(destino, f), leer(join(origen, f)));
writeFileSync(
  join(destino, 'ORIGEN.md'),
  `# src/shared/ — NO EDITAR\n\nCopia de solo lectura de \`shared/src/\` de [The-Tito/qatok-backend](https://github.com/The-Tito/qatok-backend), fuente única del contrato.\n\n- Commit de origen: \`${commit}\`\n- Para actualizarla: \`npm run sync:shared\` (con \`qatok-backend\` en la carpeta hermana) y commit propio.\n- Cualquier cambio se hace primero en el backend.\n`,
);
console.warn(`Copiados ${enOrigen.length} archivos de ${origen} (commit ${commit}).`);
