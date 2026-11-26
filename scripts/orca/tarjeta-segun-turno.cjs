'use strict';
/**
 * Hooks de Claude Code (.claude/settings.json): mueve la tarjeta del workspace según de quién es el turno. Misma semántica
 * que propone Orca (github.com/stablyai/orca/pull/28513): si Orca la publica, estos hooks se quitan.
 *   El agente espera a la persona → In review   ·   la persona respondió o hay trabajo de nuevo → In progress
 * Nunca bloquea al agente: cualquier fallo se ignora y siempre sale en 0.
 */
const fs = require('fs');
const path = require('path');
const { decidirTarjeta } = require('./_lib.cjs');

try {
  if (process.env.ORCA_WORKTREE_ID) {
    const entrada = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
    const dir = process.env.CLAUDE_PROJECT_DIR || entrada.cwd || process.cwd();
    process.chdir(dir);
    const { orca } = require('./_entorno.cjs');
    const w = orca('worktree', 'current', '--json').result.worktree;
    const d = decidirTarjeta({ entrada, estado: w.workspaceStatus, esPrincipal: w.isMainWorktree });
    // Marca barata para que PostToolUse solo arranque node cuando hay un permiso pendiente (ver settings.json).
    const marca = path.join(dir, '.orca-espera');
    if (d.espera === true && !w.isMainWorktree) fs.writeFileSync(marca, '');
    if (d.espera === false) fs.rmSync(marca, { force: true });
    if (d.estado) orca('worktree', 'set', '--worktree', `path:${w.path}`, '--workspace-status', d.estado, '--json');
  }
} catch {
  /* el tablero nunca debe estorbar al agente */
}
process.exit(0);
