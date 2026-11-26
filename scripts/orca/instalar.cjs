'use strict';
/**
 * Deja en el equipo de cada persona los dos disparadores que cierran tarjetas. Lo llaman el setup de cada worktree nuevo y
 * el propio hook; también a mano: node scripts/orca/instalar.cjs.
 *  1. Hook `post-merge`: al traer la rama principal (`git pull` en la copia principal). Un hook ajeno NO se toca.
 *  2. Automatización de Orca según config.json (cada 30 minutos). Se crea UNA vez por copia del repo. Si alguien la pausa o la borra, se respeta: no se recrea (salvo --reinstalar).
 *  - No gasta tokens: el precheck hace el trabajo y termina en 1, y Orca omite la corrida sin lanzar el agente.
 */
const fs = require('fs');
const path = require('path');
const { orca, git, rutas, ramaPrincipal, conCandado } = require('./_entorno.cjs');
const { nombreAutomatizacion, hookPostMerge, decidirInstalacion, decidirHook } = require('./_lib.cjs');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const forzar = process.argv.includes('--reinstalar');

function instalarHook() {
  const { comun, raiz } = rutas();
  const destino = path.join(path.resolve(raiz, git(raiz, ['rev-parse', '--git-path', 'hooks'])), 'post-merge');
  const actual = fs.existsSync(destino) ? fs.readFileSync(destino, 'utf8') : null;
  const deseado = hookPostMerge(ramaPrincipal(raiz));
  const d = decidirHook(actual, deseado);
  if (d.escribir) {
    conCandado(comun, 'orca-hook', () => {
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.writeFileSync(destino, deseado, { mode: 0o755 });
      fs.chmodSync(destino, 0o755);
    });
  }
  console.log(`[orca] Hook al traer la rama principal: ${d.motivo}`);
}

function instalarAutomatizacion() {
  const { comun, raiz } = rutas();
  conCandado(comun, 'orca-automatizacion', () => {
    const marcador = path.join(comun, 'orca-automatizacion.json');
    const nombre = nombreAutomatizacion(path.basename(raiz));
    const lista = orca('automations', 'list', '--json').result.automations;
    const d = decidirInstalacion({ lista, nombre, yaInstalada: fs.existsSync(marcador), forzar });
    if (d.crear) {
      const r = orca(
        'automations', 'create', '--name', nombre,
        '--trigger', config.horario, '--timezone', config.zonaHoraria,
        '--workspace', `path:${raiz}`, '--workspace-mode', 'existing', '--provider', 'claude',
        '--precheck', 'node scripts/orca/cerrar-tarjetas.cjs --aplicar --precheck', '--precheck-timeout', '120',
        // Solo se usa si alguien pulsa «Run now», que se salta el precheck.
        '--prompt', 'Corre node scripts/orca/cerrar-tarjetas.cjs --aplicar, muestra el resultado y termina. No hagas nada mas.',
        '--json',
      );
      if (!r.ok) throw new Error('Orca rechazó la creación');
    }
    if (d.crear || d.existe) fs.writeFileSync(marcador, `${JSON.stringify({ nombre })}\n`);
    console.log(`[orca] Automatización de tarjetas: ${d.motivo}`);
  });
}

for (const [que, paso] of [['el hook', instalarHook], ['la automatización', instalarAutomatizacion]]) {
  try {
    paso();
  } catch (e) {
    console.warn(`[orca] No se instaló ${que}: ${String(e.message).split('\n')[0]}`);
  }
}
