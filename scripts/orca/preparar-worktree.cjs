'use strict';
/**
 * Setup de Orca (orca.yaml → scripts.setup): corre en cada worktree recién creado. Idempotente.
 *  1. Copia `.env` si falta y, si config.json define `variablePuerto`, le asigna un puerto que ningún otro worktree use.
 *  2. Pasa a Done las tarjetas ya mergeadas y deja instalado lo que lo repite (best-effort: nunca hace fallar el setup).
 * No fija el estado de la tarjeta nueva: Orca la crea en «In progress».
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { git: gitEn, rutas, conCandado } = require('./_entorno.cjs');
const { leerPuerto, fijarPuerto, elegirPuerto, rutasDeWorktrees } = require('./_lib.cjs');

const { comun, raiz } = rutas();
const git = (...args) => gitEn(process.cwd(), args);
const actual = fs.realpathSync(git('rev-parse', '--show-toplevel'));
if (actual === raiz) {
  console.log('[orca] Copia principal: no hay nada que preparar.');
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const variable = config.variablePuerto;
const env = path.join(actual, '.env');
if (!fs.existsSync(env) && fs.existsSync(path.join(raiz, '.env'))) fs.copyFileSync(path.join(raiz, '.env'), env);

if (variable && fs.existsSync(env)) {
  conCandado(comun, 'orca-puerto', () => {
    const otros = rutasDeWorktrees(git('worktree', 'list', '--porcelain'))
      .filter((r) => fs.existsSync(path.join(r, '.env')) && fs.realpathSync(r) !== actual)
      .map((r) => leerPuerto(fs.readFileSync(path.join(r, '.env'), 'utf8'), variable))
      .filter(Boolean);
    const texto = fs.readFileSync(env, 'utf8');
    const puerto = elegirPuerto(leerPuerto(texto, variable), otros, config);
    fs.writeFileSync(env, fijarPuerto(texto, variable, puerto));
    console.log(`[orca] ${variable}=${puerto}`);
  });
}
console.log(`[orca] Worktree listo: ${git('branch', '--show-current')}`);

for (const [script, ...args] of [['cerrar-tarjetas.cjs', '--aplicar'], ['instalar.cjs']]) {
  spawnSync(process.execPath, [path.join(__dirname, script), ...args], { stdio: 'inherit', timeout: 90_000 });
}
