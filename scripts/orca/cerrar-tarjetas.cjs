'use strict';
/**
 * Pasa a «Done» las tarjetas de Orca cuyo trabajo ya está en la rama principal del remoto. Sin agente ni tokens.
 *   node scripts/orca/cerrar-tarjetas.cjs             → simula (no cambia nada)
 *   node scripts/orca/cerrar-tarjetas.cjs --aplicar   → mueve las tarjetas
 *   … --precheck  → además termina en 1, para usarlo como `--precheck` de una automatización de Orca sin lanzar el agente
 * No borra worktrees ni ramas. Si algo falla, no mueve nada y sale en 0 (salvo --precheck).
 */
const fs = require('fs');
const path = require('path');
const { orca, git: gitEn, rutas, ramaPrincipal } = require('./_entorno.cjs');
const { decidirCierre } = require('./_lib.cjs');

const aplicar = process.argv.includes('--aplicar');
const precheck = process.argv.includes('--precheck');

/** Squash de varios commits: se condensa la rama en un commit suelto y se compara su parche con la rama principal. */
function integradaConSquash(dir, base) {
  const origen = gitEn(dir, ['merge-base', base, 'HEAD']);
  const arbol = gitEn(dir, ['rev-parse', 'HEAD^{tree}']);
  if (gitEn(dir, ['rev-parse', `${origen}^{tree}`]) === arbol) return false; // la rama no cambia nada
  const suelto = gitEn(dir, ['-c', 'user.name=orca', '-c', 'user.email=orca@localhost', 'commit-tree', arbol, '-p', origen, '-m', 'squash']);
  return gitEn(dir, ['cherry', base, suelto], 60_000).startsWith('-');
}

function main() {
  const { comun, raiz } = rutas();
  const rama = ramaPrincipal(raiz);
  const base = `origin/${rama}`;
  gitEn(raiz, ['fetch', '--quiet', 'origin', rama], 60_000);
  const primeraLinea = new Set(gitEn(raiz, ['rev-list', '--first-parent', base]).split('\n'));
  const registro = path.join(comun, 'orca-tarjetas-cerradas.json');
  const cerradas = fs.existsSync(registro) ? JSON.parse(fs.readFileSync(registro, 'utf8')) : {};

  let movidas = 0;
  for (const w of orca('worktree', 'list', '--repo', `path:${raiz}`, '--limit', '500', '--json').result.worktrees) {
    if (w.hostId !== 'local' || !fs.existsSync(w.path)) continue;
    let d;
    try {
      const punta = gitEn(w.path, ['rev-parse', 'HEAD']);
      const esAncestro = gitEn(w.path, ['rev-list', '--count', `${base}..HEAD`]) === '0';
      const parches = esAncestro ? [] : gitEn(w.path, ['cherry', base, 'HEAD'], 60_000).split('\n').filter(Boolean).map((l) => l[0]);
      d = decidirCierre({
        esPrincipal: w.isMainWorktree, archivado: w.isArchived, estado: w.workspaceStatus, rama: w.branch,
        limpio: gitEn(w.path, ['status', '--porcelain']) === '',
        punta, cerradoEn: cerradas[w.path], esAncestro, enPrimeraLinea: primeraLinea.has(punta), parches,
        squash: !esAncestro && integradaConSquash(w.path, base),
      });
      if (d.cerrar && aplicar) {
        const r = orca('worktree', 'set', '--worktree', `path:${w.path}`, '--workspace-status', 'completed', '--json');
        if (!r.ok) throw new Error('Orca rechazó el cambio');
        cerradas[w.path] = punta;
        fs.writeFileSync(registro, `${JSON.stringify(cerradas, null, 2)}\n`);
        movidas++;
      }
    } catch (e) {
      d = { cerrar: false, motivo: `no se pudo evaluar (${String(e.message).split('\n')[0]})` };
    }
    console.log(`[orca] ${d.cerrar ? (aplicar ? '→ Done' : 'cerraría') : 'queda  '} ${w.displayName}: ${d.motivo}`);
  }
  console.log(`[orca] ${aplicar ? `${movidas} tarjeta(s) movida(s) a Done.` : 'Simulación: no se movió nada (usa --aplicar).'}`);
}

try {
  main();
} catch (e) {
  console.log(`[orca] No se revisaron las tarjetas: ${String(e.message).split('\n')[0]}`);
}
process.exit(precheck ? 1 : 0);
