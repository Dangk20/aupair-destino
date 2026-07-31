/* ════════════════════════════════════════════════════════════════════════
 * scripts/medir-perfiles-incompletos.mjs
 *
 * Cuántas candidatas quedan con el perfil incompleto bajo el criterio de
 * obligatoriedad de lib/campos-perfil.js. Sirve para saber, antes de anunciar
 * el cambio, a cuántas les va a aparecer el bloqueo y qué les falta.
 *
 * Uso:
 *   node scripts/medir-perfiles-incompletos.mjs
 *   node scripts/medir-perfiles-incompletos.mjs --detalle
 * ════════════════════════════════════════════════════════════════════════ */
import mysql from "mysql2/promise";
import { faltantesDeParte, parteCompleta, progresoParte } from "../lib/campos-perfil.js";

const detalle = process.argv.includes("--detalle");

const db = await mysql.createConnection({
  host:     process.env.DB_AUPAIR_HOST     || "127.0.0.1",
  port:     Number(process.env.DB_AUPAIR_PORT || 3307),
  user:     process.env.DB_AUPAIR_USER     || "root",
  password: process.env.DB_AUPAIR_PASSWORD || "",
  database: process.env.DB_AUPAIR_NAME     || "destino_aupair",
});

const [candidatas] = await db.query("SELECT * FROM usuarios WHERE rol = 'usuaria' ORDER BY id");

let completas = 0;
const filas = [];

for (const u of candidatas) {
  const f1 = faltantesDeParte(1, u);
  const f2 = faltantesDeParte(2, u);
  const completa = parteCompleta(1, u) && parteCompleta(2, u);
  if (completa) completas++;
  filas.push({
    id: u.id,
    nombre: `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim(),
    parte1: `${progresoParte(1, u)}%`,
    parte2: `${progresoParte(2, u)}%`,
    faltan: f1.length + f2.length,
    detalle: [...f1, ...f2].map((c) => c.label),
  });
}

console.log(`\nCandidatas: ${candidatas.length}`);
console.log(`Perfiles completos bajo el criterio nuevo: ${completas}`);
console.log(`Perfiles incompletos: ${candidatas.length - completas}\n`);

console.table(filas.map(({ detalle: _d, ...r }) => r));

if (detalle) {
  for (const f of filas.filter((x) => x.faltan > 0)) {
    console.log(`\n#${f.id} ${f.nombre} — le faltan ${f.faltan}:`);
    console.log("  " + f.detalle.join(", "));
  }
}

await db.end();
