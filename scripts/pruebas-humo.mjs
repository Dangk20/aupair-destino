#!/usr/bin/env node
// scripts/pruebas-humo.mjs — Pruebas de humo del control de acceso.
//
// Verifica contra un entorno CORRIENDO que cada ruta de la API exige lo que
// docs/rutas-y-acceso.md dice que exige. Sale con código distinto de cero si
// alguna regla falla; el despliegue lo ejecuta y se detiene si eso pasa.
//
//   node scripts/pruebas-humo.mjs                          # local, completo
//   node scripts/pruebas-humo.mjs https://destino-aupair.com
//   node scripts/pruebas-humo.mjs <url> --sin-sesion       # sin el secreto JWT
//
// SEGURO CONTRA PRODUCCIÓN, por diseño:
//   · No escribe en la base ni siembra usuarios.
//   · Las aserciones de rechazo (401/403) se cortan en el guard, antes de que
//     el handler ejecute nada, así que se pueden probar en todos los métodos.
//   · Las aserciones de "sí pasa" se limitan a GET, que no muta.
//
// Cómo prueba que el permiso se lee de la BASE y no del JWT: firma un token de
// un usuario INEXISTENTE que *declara* tener todos los permisos. Si una ruta
// con permiso lo deja pasar, es que confió en el token. Debe responder 403.
//
// SIN NINGUNA dependencia, ni siquiera jsonwebtoken. El despliegue ejecuta
// este script DENTRO del contenedor, y allí no existe: Next empaqueta
// jsonwebtoken dentro del build standalone en vez de dejarlo en node_modules.
// Un JWT HS256 son tres trozos en base64url y un HMAC, así que se firma con el
// `crypto` que Node ya trae.

import { createHmac } from "node:crypto";

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Firma un JWT HS256 equivalente al que emite lib/session-aupair.js. */
function firmar(payload, secreto, segundos = 300) {
  const ahora = Math.floor(Date.now() / 1000);
  const cabecera = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const cuerpo   = b64url(JSON.stringify({ ...payload, iat: ahora, exp: ahora + segundos }));
  const firma    = b64url(createHmac("sha256", secreto).update(`${cabecera}.${cuerpo}`).digest());
  return `${cabecera}.${cuerpo}.${firma}`;
}

const BASE   = (process.argv.find(a => a.startsWith("http")) || "http://localhost:3000").replace(/\/$/, "");
const SOLO_SIN_SESION = process.argv.includes("--sin-sesion");

// El servidor lee .env.local; este script corre fuera de Next, así que lo lee
// por su cuenta. Lo ya definido en el entorno manda (así funciona en el VPS).
async function cargarEnvLocal() {
  try {
    const { readFile } = await import("node:fs/promises");
    for (const linea of (await readFile(".env.local", "utf8")).split("\n")) {
      const m = linea.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const valor = m[2].trim().replace(/^["']|["']$/g, "");
      if (process.env[m[1]] === undefined) process.env[m[1]] = valor;
    }
  } catch { /* no hay .env.local: se usa lo que traiga el entorno */ }
}
await cargarEnvLocal();

const SECRETO = process.env.JWT_AUPAIR_SECRET || "destino_aupair_secreto_2025";
const SECRETO_ES_EL_DE_RESPALDO = !process.env.JWT_AUPAIR_SECRET;

// Id que no existe en ninguna base: sirve para probar los guards sin tocar a
// nadie real. Las rutas con permiso deben rechazarlo aunque el token mienta.
const ID_FANTASMA = 999999999;

/* ── El inventario, en versión legible por máquina ──────────────────────────
   Fuente: docs/rutas-y-acceso.md. Si añades una ruta y no la declaras aquí,
   la prueba de cobertura falla. Niveles: publica | sesion | rol:a,b | permiso:x
   Project Center ya no existe: se retiró en el Sprint 1, grupo 6. */
const INVENTARIO = [
  ["PUT", "/admin/aprobar-evaluacion", "rol:admin"],
  ["GET", "/admin/asesoras", "rol:admin"],
  ["GET", "/admin/asociadas", "rol:admin"],
  ["POST", "/admin/asociadas", "rol:admin"],
  ["DELETE", "/admin/asociadas/[id]", "rol:admin"],
  ["GET", "/admin/asociadas/[id]", "rol:admin"],
  ["PUT", "/admin/asociadas/[id]", "rol:admin"],
  ["GET", "/admin/asociadas/asignar", "rol:admin"],
  ["POST", "/admin/asociadas/asignar", "rol:admin"],
  ["GET", "/admin/bd-estructura", "rol:admin"],
  ["DELETE", "/admin/codigos-promo", "rol:admin"],
  ["GET", "/admin/codigos-promo", "rol:admin"],
  ["POST", "/admin/codigos-promo", "rol:admin"],
  ["PUT", "/admin/codigos-promo", "rol:admin"],
  ["GET", "/admin/configuracion", "rol:admin"],
  ["PUT", "/admin/configuracion", "rol:admin"],
  ["POST", "/admin/confirmar-pago", "rol:admin"],
  ["GET", "/admin/comisiones", "rol:admin"],
  ["POST", "/admin/comisiones/[id]/pagar", "rol:admin"],
  ["DELETE", "/admin/disponibilidad", "rol:admin,asociada"],
  ["GET", "/admin/disponibilidad", "rol:admin,asociada"],
  ["POST", "/admin/disponibilidad", "rol:admin,asociada"],
  ["PUT", "/admin/disponibilidad", "rol:admin,asociada"],
  ["DELETE", "/admin/eventos", "rol:admin,asociada"],
  ["GET", "/admin/eventos", "rol:admin,asociada"],
  ["POST", "/admin/eventos", "rol:admin,asociada"],
  ["PUT", "/admin/eventos", "rol:admin,asociada"],
  ["GET", "/admin/mensajes", "rol:admin"],
  ["POST", "/admin/mensajes", "rol:admin"],
  ["GET", "/admin/pagos/movimientos", "rol:admin"],
  ["GET", "/admin/pagos/stats", "rol:admin"],
  ["GET", "/admin/perfiles", "rol:admin"],
  ["GET", "/admin/perfiles/[id]", "rol:admin"],
  ["PUT", "/admin/perfiles/[id]", "rol:admin"],
  ["DELETE", "/admin/perfiles/[id]/documentos", "rol:admin"],
  ["GET", "/admin/perfiles/[id]/documentos", "rol:admin"],
  ["PUT", "/admin/perfiles/[id]/documentos", "rol:admin"],
  ["DELETE", "/admin/recursos", "rol:admin"],
  ["GET", "/admin/recursos", "rol:admin"],
  ["POST", "/admin/recursos", "rol:admin"],
  ["GET", "/admin/referidos", "rol:admin"],
  ["POST", "/admin/referidos", "rol:admin"],
  ["DELETE", "/admin/referidos/[id]", "rol:admin"],
  ["PUT", "/admin/referidos/[id]", "rol:admin"],
  ["POST", "/admin/referidos/[id]/pagar", "rol:admin"],
  ["GET", "/admin/referidos/inscripciones", "rol:admin"],
  ["DELETE", "/admin/reuniones", "rol:admin"],
  ["GET", "/admin/reuniones", "rol:admin"],
  ["POST", "/admin/reuniones", "rol:admin"],
  ["PUT", "/admin/reuniones", "rol:admin"],
  ["DELETE", "/admin/sesiones", "rol:admin"],
  ["GET", "/admin/sesiones", "rol:admin"],
  ["POST", "/admin/sesiones", "rol:admin"],
  ["PUT", "/admin/sesiones", "rol:admin"],
  ["GET", "/admin/stats", "rol:admin"],
  ["POST", "/admin/toggle-acceso", "rol:admin"],
  ["PUT", "/admin/toggle-acceso", "rol:admin"],
  ["POST", "/admin/toggle-perfil", "rol:admin"],
  ["GET", "/admin/usuarias", "rol:admin"],
  ["PUT", "/admin/usuarias", "rol:admin"],
  ["PUT", "/admin/usuarias/[id]", "rol:admin"],
  ["PUT", "/admin/usuarios/[id]/cambiar-rol", "rol:admin"],
  ["GET", "/admin/usuarios/actividad", "rol:admin"],
  ["GET", "/admin/usuarios/stats", "rol:admin"],
  ["GET", "/admin/usuarios/top-referentes", "rol:admin"],
  ["GET", "/admin/ventas", "rol:admin"],
  ["POST", "/admin/ventas/[id]/anular", "rol:admin"],
  ["POST", "/admin/ventas/[id]/confirmar", "rol:admin"],
  ["GET", "/agencia/[id]", "rol:agencia"],
  ["GET", "/agencia/candidatas", "rol:agencia"],
  ["GET", "/agencia/perfiles", "rol:agencia"],
  ["GET", "/agencia/perfiles/[id]", "rol:agencia"],
  ["PUT", "/agencia/perfiles/[id]", "rol:agencia"],
  ["PUT", "/asociada/perfil", "rol:asociada"],
  ["GET", "/asociada/reuniones", "rol:asociada"],
  ["POST", "/asociada/reuniones/[id]/confirmar", "rol:asociada"],
  ["GET", "/asociada/stats", "rol:asociada"],
  ["GET", "/asociada/usuarias-asignadas", "rol:asociada"],
  ["GET", "/asociada/usuarias/[id]", "rol:asociada"],
  ["POST", "/auth/forgot-password", "publica"],
  ["POST", "/auth/login", "publica"],
  ["POST", "/auth/logout", "publica"],
  ["GET", "/auth/me", "sesion"],
  ["POST", "/auth/register", "publica"],
  ["POST", "/auth/reset-password", "publica"],
  ["POST", "/codigos-promo/usar", "sesion"],
  ["POST", "/codigos-promo/validar", "publica"],
  ["GET", "/dashboard/acceso", "sesion"],
  ["POST", "/dashboard/bienvenida", "sesion"],
  ["POST", "/dashboard/completar", "sesion"],
  ["GET", "/dashboard/configuracion", "sesion"],
  ["PUT", "/dashboard/configuracion", "sesion"],
  ["GET", "/dashboard/disponibilidad", "permiso:reuniones"],
  ["POST", "/dashboard/documento", "sesion"],
  ["DELETE", "/dashboard/documentos", "permiso:documentos"],
  ["GET", "/dashboard/documentos", "permiso:documentos"],
  ["POST", "/dashboard/documentos", "permiso:documentos"],
  ["POST", "/dashboard/foto", "sesion"],
  ["GET", "/dashboard/mensajes", "permiso:mensajes"],
  ["POST", "/dashboard/mensajes", "permiso:mensajes"],
  ["GET", "/dashboard/perfil", "sesion"],
  ["PUT", "/dashboard/perfil", "sesion"],
  ["GET", "/dashboard/proceso", "sesion"],
  ["PUT", "/dashboard/proceso", "rol:admin"],
  ["GET", "/dashboard/recursos", "permiso:recursos"],
  ["DELETE", "/dashboard/reuniones", "permiso:reuniones"],
  ["GET", "/dashboard/reuniones", "permiso:reuniones"],
  ["POST", "/dashboard/reuniones", "permiso:reuniones"],
  ["GET", "/dashboard/sesiones", "sesion"],
  ["GET", "/documentos/[id]", "sesion"],
  ["GET", "/sesion-recursos/[id]/archivo", "sesion"],
  ["GET", "/sesiones-public", "publica"],
  ["GET", "/ventas", "sesion"],
  ["POST", "/ventas", "sesion"],
];

const ROLES = ["admin", "asociada", "agencia", "usuaria"];

/* ── Rutas que hoy responden 500 ────────────────────────────────────────────
   Deuda heredada, no defectos de permisos. Se declaran para que el despliegue
   no se detenga por ellas, pero se comprueban igual: si una deja de estar
   rota, la prueba avisa para quitarla de aquí. Nunca se borran en silencio.  */
const ROTAS_CONOCIDAS = {
  "/asociada/stats":              "usuarios.asesora_asignada_id no existe en la base",
  "/asociada/usuarias-asignadas": "usuarios.asesora_asignada_id no existe en la base",
  "/asociada/usuarias/[id]":      "usuarios.asesora_asignada_id no existe en la base",
  "/admin/asociadas/asignar":     "usuarios.asesora_asignada_id no existe en la base",
  "/admin/reuniones":             "reuniones.fecha no existe · ruta sin consumidor, ver docs/rutas-y-acceso.md",
};

/** Token de un usuario inexistente, que declara todos los permisos. */
function token(rol) {
  return firmar({
    id: ID_FANTASMA, email: `humo-${rol}@ejemplo.invalid`, nombre: "Humo", apellido: rol, rol,
    // Miente a propósito: si una ruta con permiso deja pasar esto, leyó el JWT.
    tiene_acceso: true, acceso_documentos: 1, acceso_mensajes: 1,
    acceso_recursos: 1, acceso_reuniones: 1, acceso_comunidad: 1,
  }, SECRETO);
}
const COOKIE = Object.fromEntries(ROLES.map(r => [r, `dap_token=${token(r)}`]));

const url = ruta => `${BASE}/api${ruta.replace(/\[[^\]]+\]/g, "1")}`;

async function llamar(met, ruta, cookie) {
  const cabeceras = { "Content-Type": "application/json" };
  if (cookie) cabeceras.Cookie = cookie;
  try {
    const res = await fetch(url(ruta), {
      method: met, headers: cabeceras, redirect: "manual",
      body: met === "GET" ? undefined : "{}",
      signal: AbortSignal.timeout(20000),
    });
    return res.status;
  } catch (err) {
    return `ERR ${err.name}`;
  }
}

/* ── Aserciones ─────────────────────────────────────────────────────────── */
let fallos = 0, pasadas = 0, omitidas = 0;
const grupos = [];

function anota(ok, etiqueta, detalle) {
  const g = grupos.at(-1);
  g.total++;
  if (ok) { pasadas++; return; }
  fallos++;
  g.fallos.push(`${etiqueta} — ${detalle}`);
}
function grupo(titulo) { grupos.push({ titulo, fallos: [], total: 0 }); }

/* 1. Cobertura: ninguna ruta puede quedar sin nivel declarado. */
async function cobertura() {
  grupo("Cobertura del inventario");
  const { readdir } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const encontradas = [];
  async function recorrer(dir, pre = "") {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (e.isDirectory()) await recorrer(join(dir, e.name), `${pre}/${e.name}`);
      else if (e.name === "route.js") encontradas.push(pre);
    }
  }
  try { await recorrer("app/api"); }
  catch { omitidas++; grupos.at(-1).nota = "no se ejecutó desde la raíz del repositorio"; return; }

  const declaradas = new Set(INVENTARIO.map(([, r]) => r));
  for (const r of encontradas) {
    anota(declaradas.has(r), r, "existe en app/api/** pero no está declarada en el inventario");
  }
  for (const r of declaradas) {
    anota(encontradas.includes(r), r, "declarada en el inventario pero ya no existe en app/api/**");
  }
}

/* 2. Sin sesión: toda ruta no pública responde 401. */
async function sinSesion() {
  grupo("Sin sesión → 401");
  for (const [met, ruta, nivel] of INVENTARIO) {
    const st = await llamar(met, ruta, null);
    if (nivel === "publica") anota(st !== 401, `${met} ${ruta}`, `es pública y respondió ${st}`);
    else anota(st === 401, `${met} ${ruta}`, `esperaba 401, respondió ${st}`);
  }
}

/* 3. Rol ajeno: 403. Y el rol declarado sí entra (sólo GET, que no muta). */
async function porRol() {
  grupo("Rol ajeno → 403");
  for (const [met, ruta, nivel] of INVENTARIO) {
    if (!nivel.startsWith("rol:")) continue;
    const permitidos = nivel.slice(4).split(",");
    for (const rol of ROLES) {
      if (permitidos.includes(rol)) continue;
      const st = await llamar(met, ruta, COOKIE[rol]);
      anota(st === 403, `${met} ${ruta} como ${rol}`, `esperaba 403, respondió ${st}`);
    }
  }

  grupo("Rol declarado → entra y no revienta");
  for (const [met, ruta, nivel] of INVENTARIO) {
    if (met !== "GET" || !nivel.startsWith("rol:")) continue;
    for (const rol of nivel.slice(4).split(",")) {
      const st = await llamar(met, ruta, COOKIE[rol]);
      anota(st !== 403 && st !== 401, `${met} ${ruta} como ${rol}`, `su propio rol fue rechazado con ${st}`);
      // Un 500 no es un problema de permisos, pero pasaba desapercibido: la
      // aserción de arriba lo daba por bueno porque "no es 403". Así estuvo
      // oculto que el módulo de la asociada consulta una columna inexistente.
      // Un 404 o un 400 sí son respuestas legítimas con un id de prueba.
      const rotaConocida = ROTAS_CONOCIDAS[ruta];
      const revienta = typeof st === "number" && st >= 500;
      if (rotaConocida) {
        // Se comprueba al revés: si ya no revienta, hay que quitarla de la lista.
        anota(revienta, `${met} ${ruta}`, `ya NO está rota (${st}) — quítala de ROTAS_CONOCIDAS`);
      } else {
        anota(!revienta, `${met} ${ruta} como ${rol}`, `el servidor respondió ${st} — la ruta está rota, no es un problema de permisos`);
      }
    }
  }
}

/* 4. Permiso: el token miente y dice tenerlo. Debe leerse de la base → 403. */
async function porPermiso() {
  grupo("Permiso leído de la base, no del JWT → 403");
  for (const [met, ruta, nivel] of INVENTARIO) {
    if (!nivel.startsWith("permiso:")) continue;
    const st = await llamar(met, ruta, COOKIE.usuaria);
    anota(st === 403, `${met} ${ruta}`,
      `esperaba 403 (el token declara el permiso, pero el usuario no existe en la base), respondió ${st}`);
  }
}

/* ── Ejecución ──────────────────────────────────────────────────────────── */
const t0 = Date.now();
console.log(`\n  Pruebas de humo de control de acceso`);
console.log(`  Objetivo: ${BASE}`);
console.log(`  Modo:     ${SOLO_SIN_SESION ? "sólo sin sesión (sin el secreto JWT)" : "completo"}\n`);

const arriba = await llamar("GET", "/auth/me", null);
if (typeof arriba === "string") {
  console.error(`  ✗ El entorno no responde en ${BASE} (${arriba}).\n`);
  process.exit(2);
}

// Si el secreto no casa con el del entorno, TODO daría 401 y el informe sería
// 200 fallos que no dicen nada. Se detecta con una llamada y se aborta.
if (!SOLO_SIN_SESION) {
  const prueba = await llamar("GET", "/auth/me", COOKIE.admin);
  if (prueba === 401) {
    console.error(`  ✗ El entorno no acepta los tokens que firma este script.`);
    console.error(`    JWT_AUPAIR_SECRET no coincide con el de ${BASE}.`);
    console.error(SECRETO_ES_EL_DE_RESPALDO
      ? `    No hay JWT_AUPAIR_SECRET en el entorno ni en .env.local: se usó el valor de respaldo del código.`
      : `    Se tomó de .env.local o del entorno, pero no es el que usa ese servidor.`);
    console.error(`    Exporta el secreto correcto, o usa --sin-sesion para las comprobaciones que no lo necesitan.\n`);
    process.exit(2);
  }
}

await cobertura();
await sinSesion();
if (SOLO_SIN_SESION) {
  console.log("  ⚠ Rol y permiso NO se verificaron: falta JWT_AUPAIR_SECRET.");
  console.log("    Este modo NO es suficiente para dar un despliegue por bueno.\n");
  omitidas += 2;
} else {
  await porRol();
  await porPermiso();
}

const DETALLE = !process.argv.includes("--resumen");
for (const g of grupos) {
  const n = g.fallos.length;
  const marca = g.nota ? "⚠" : n ? "✗" : "✓";
  const cuenta = g.nota ? `omitido: ${g.nota}` : `${g.total - n}/${g.total}`;
  console.log(`  ${marca} ${g.titulo.padEnd(46)} ${cuenta}`);
  if (DETALLE) for (const f of g.fallos) console.log(`      · ${f}`);
}

if (Object.keys(ROTAS_CONOCIDAS).length) {
  console.log(`\n  ⚠ ${Object.keys(ROTAS_CONOCIDAS).length} rutas declaradas como rotas (deuda heredada, no bloquean el despliegue):`);
  for (const [r, motivo] of Object.entries(ROTAS_CONOCIDAS)) console.log(`      · ${r} — ${motivo}`);
}

const seg = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n  ${pasadas} aserciones en verde, ${fallos} en rojo${omitidas ? `, ${omitidas} grupos omitidos` : ""} — ${seg}s\n`);
process.exit(fallos > 0 ? 1 : 0);
