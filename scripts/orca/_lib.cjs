'use strict';
/** Lógica pura de los scripts de Orca (probada en scripts/orca/orca.test.cjs). */

const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Puerto declarado en un .env para esa variable, o null. Si está repetido, el último. */
function leerPuerto(env, variable) {
  const m = [...env.matchAll(new RegExp(`^${escapar(variable)}=(\\d+)\\s*$`, 'gm'))].pop();
  return m ? Number(m[1]) : null;
}

/** Deja UNA sola línea de esa variable, sin tocar el resto del .env. */
function fijarPuerto(env, variable, puerto) {
  const resto = env.replace(new RegExp(`^${escapar(variable)}=.*(?:\\r?\\n|$)`, 'gm'), '');
  return `${resto}${resto === '' || resto.endsWith('\n') ? '' : '\n'}${variable}=${puerto}\n`;
}

/** Conserva el puerto propio si es válido y nadie más lo usa; si no, toma el primero libre. */
function elegirPuerto(actual, usados, { puertoPrincipal, puertoMin, puertoMax }) {
  const ocupados = new Set([puertoPrincipal, ...usados]);
  if (actual >= puertoMin && actual <= puertoMax && !ocupados.has(actual)) return actual;
  for (let p = puertoMin; p <= puertoMax; p++) if (!ocupados.has(p)) return p;
  throw new Error(`No hay puertos libres entre ${puertoMin} y ${puertoMax}.`);
}

/** Rutas de `git worktree list --porcelain`. */
function rutasDeWorktrees(porcelain) {
  return [...porcelain.matchAll(/^worktree (.+)$/gm)].map((m) => m[1].trim());
}

/**
 * ¿La tarjeta se puede cerrar? Solo si la rama aportó commits propios que YA están en la rama principal del remoto.
 * Una rama recién creada también es «ancestro», pero su punta está en la primera línea de la principal: esa NO se cierra.
 * Limitación: un PR integrado con fast-forward se ve igual que una rama sin commits propios y no se cierra.
 */
function decidirCierre(t) {
  const no = (motivo) => ({ cerrar: false, motivo });
  if (t.esPrincipal) return no('copia principal');
  if (t.archivado) return no('archivado');
  if (t.estado === 'completed') return no('ya está en Done');
  if (!t.rama) return no('sin rama');
  if (!t.limpio) return no('tiene cambios sin commitear');
  if (t.cerradoEn === t.punta) return no('ya se cerró con esta misma punta y alguien la reabrió');
  if (t.esAncestro) return t.enPrimeraLinea ? no('sin commits propios') : { cerrar: true, motivo: 'PR mergeado' };
  if (t.squash) return { cerrar: true, motivo: 'PR mergeado con squash' };
  if (t.parches.length > 0 && t.parches.every((p) => p === '-')) return { cerrar: true, motivo: 'commits ya aplicados en la rama principal (rebase)' };
  return no('tiene commits que no están en la rama principal');
}

const nombreAutomatizacion = (proyecto) => `${proyecto}: cerrar tarjetas mergeadas`;

/** Una sola vez por copia del repo; si la persona la borró, no se le vuelve a crear salvo que lo pida. */
function decidirInstalacion({ lista, nombre, yaInstalada, forzar }) {
  if (lista.some((a) => a.name === nombre)) return { crear: false, existe: true, motivo: 'ya existe' };
  if (yaInstalada && !forzar) return { crear: false, existe: false, motivo: 'se borró a mano; se respeta (usa --reinstalar)' };
  return { crear: true, existe: false, motivo: 'creada' };
}

const MARCA_HOOK = '# tablero-orca (lo genera scripts/orca/instalar.cjs)';

/** Solo actúa cuando el pull cae en la rama principal, en segundo plano, y nunca hace fallar el pull. */
const hookPostMerge = (rama) => `#!/bin/sh
${MARCA_HOOK}
[ "$(git branch --show-current)" = "${rama}" ] || exit 0
command -v node >/dev/null 2>&1 || exit 0
raiz=$(git rev-parse --show-toplevel) || exit 0
[ -f "$raiz/scripts/orca/cerrar-tarjetas.cjs" ] || exit 0
(node "$raiz/scripts/orca/cerrar-tarjetas.cjs" --aplicar; node "$raiz/scripts/orca/instalar.cjs") >/dev/null 2>&1 </dev/null &
exit 0
`;

function decidirHook(actual, deseado) {
  if (actual === null) return { escribir: true, motivo: 'instalado' };
  if (!actual.includes(MARCA_HOOK)) return { escribir: false, motivo: 'ya hay un post-merge de otra herramienta; no se toca' };
  if (actual === deseado) return { escribir: false, motivo: 'al día' };
  return { escribir: true, motivo: 'actualizado' };
}

/**
 * Qué hacer con la tarjeta ante un hook de Claude Code. `estado` nulo = no moverla.
 * Solo se mueve entre In progress e In review (y de To do a In progress): Done no se toca aquí.
 */
function decidirTarjeta({ entrada, estado, esPrincipal }) {
  if (esPrincipal) return { estado: null };
  const evento = entrada.hook_event_name;
  const pregunta = entrada.tool_name === 'AskUserQuestion';
  const trabaja = { estado: ['in-review', 'todo'].includes(estado) ? 'in-progress' : null, espera: false };
  const teToca = { estado: estado === 'in-progress' ? 'in-review' : null };

  if (evento === 'UserPromptSubmit' || evento === 'PostToolUse' || evento === 'ElicitationResult') return trabaja;
  if (evento === 'Notification') return entrada.notification_type === 'permission_prompt' ? { ...teToca, espera: true } : { estado: null };
  if (evento === 'Elicitation' || (evento === 'PreToolUse' && pregunta)) return { ...teToca, espera: true };
  if (evento === 'Stop') {
    const ocupado = (entrada.background_tasks || []).some((t) => t.status === 'running') || (entrada.session_crons || []).length > 0;
    return ocupado ? { estado: null } : { ...teToca, espera: false }; // con tareas vivas, sigue trabajando
  }
  return { estado: null };
}

module.exports = { decidirTarjeta, nombreAutomatizacion, MARCA_HOOK, hookPostMerge, decidirInstalacion, decidirHook, leerPuerto, fijarPuerto, elegirPuerto, rutasDeWorktrees, decidirCierre };
