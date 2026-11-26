'use strict';
/** Acceso a git y al CLI de Orca, compartido por los scripts de esta carpeta. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const win = process.platform === 'win32';

/** Dentro de un hook, git exporta GIT_DIR y similares: si se heredan, `git -C <otro worktree>` leería el equivocado. */
const entornoGit = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^GIT_(DIR|WORK_TREE|INDEX_FILE|PREFIX|COMMON_DIR|OBJECT_DIRECTORY|NAMESPACE)$/.test(k)));

/** La app de escritorio puede correr esto con un PATH mínimo: si hace falta, se busca el CLI donde Orca lo deja. */
function rutaOrca() {
  if (process.env.ORCA_CLI_COMMAND) return process.env.ORCA_CLI_COMMAND;
  const nombre = process.platform === 'linux' && !process.env.ORCA_WORKTREE_ID ? 'orca-ide' : 'orca';
  const candidatos = [
    process.env.ORCA_CLI_BIN_DIR && path.join(process.env.ORCA_CLI_BIN_DIR, nombre),
    '/Applications/Orca.app/Contents/Resources/bin/orca',
    path.join(os.homedir(), 'Applications/Orca.app/Contents/Resources/bin/orca'),
  ];
  return (!win && candidatos.find((c) => c && fs.existsSync(c))) || nombre;
}

function orca(...args) {
  return JSON.parse(
    execFileSync(rutaOrca(), win ? args.map((a) => `"${a}"`) : args, {
      encoding: 'utf8', shell: win, timeout: 20_000, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'], env: entornoGit,
    }),
  );
}

function git(dir, args, timeout = 20_000) {
  return execFileSync('git', ['-C', dir, ...args], {
    encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'],
    env: { ...entornoGit, GIT_TERMINAL_PROMPT: '0', GIT_SSH_COMMAND: process.env.GIT_SSH_COMMAND || 'ssh -o BatchMode=yes' },
  }).trim();
}

/** Carpeta .git compartida por todos los worktrees y copia principal del repo. */
function rutas(dir = __dirname) {
  const comun = fs.realpathSync(path.resolve(dir, git(dir, ['rev-parse', '--git-common-dir'])));
  return { comun, raiz: path.dirname(comun) };
}

/** Rama principal del remoto: main, master o la que sea. */
function ramaPrincipal(raiz) {
  try {
    return git(raiz, ['symbolic-ref', '--short', 'refs/remotes/origin/HEAD']).replace(/^origin\//, '');
  } catch {
    const existe = (r) => {
      try {
        git(raiz, ['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${r}`]);
        return true;
      } catch {
        return false;
      }
    };
    return existe('main') ? 'main' : 'master';
  }
}

/** Exclusión entre worktrees que se crean a la vez. Un candado de más de 60 s se da por huérfano. */
function conCandado(comun, nombre, fn) {
  const candado = path.join(comun, `${nombre}.lock`);
  const limite = Date.now() + 60_000;
  for (;;) {
    try {
      fs.mkdirSync(candado);
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      const st = fs.statSync(candado, { throwIfNoEntry: false });
      if (st && Date.now() - st.mtimeMs > 60_000) fs.rmSync(candado, { recursive: true, force: true });
      else if (Date.now() > limite) throw new Error(`No se liberó ${candado}`);
      else Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
    }
  }
  try {
    return fn();
  } finally {
    fs.rmSync(candado, { recursive: true, force: true });
  }
}

module.exports = { orca, git, rutas, ramaPrincipal, conCandado };
