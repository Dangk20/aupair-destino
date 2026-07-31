/* ════════════════════════════════════════════════════════════════════════
 * scripts/reconciliar-usos-codigos.js
 *
 * Iguala codigos_promo.usos_actuales al conteo real de codigos_promo_usos y
 * reporta las diferencias corregidas. Reejecutable: si no hay desfase, no
 * modifica nada.
 *
 * Existe porque el conteo de usos se agregó después de que ya hubiera ventas
 * confirmadas, y porque hasta ahora tres rutas distintas tocaban el contador.
 *
 * Uso:
 *   node scripts/reconciliar-usos-codigos.js            # aplica la corrección
 *   node scripts/reconciliar-usos-codigos.js --dry-run  # sólo reporta
 * ════════════════════════════════════════════════════════════════════════ */
const mysql = require("mysql2/promise");

const dryRun = process.argv.includes("--dry-run");

async function main() {
  const db = await mysql.createConnection({
    host:     process.env.DB_AUPAIR_HOST     || "127.0.0.1",
    port:     Number(process.env.DB_AUPAIR_PORT || 3307),
    user:     process.env.DB_AUPAIR_USER     || "root",
    password: process.env.DB_AUPAIR_PASSWORD || "",
    database: process.env.DB_AUPAIR_NAME     || "destino_aupair",
  });

  const [filas] = await db.query(`
    SELECT c.id, c.codigo, c.usos_actuales,
           (SELECT COUNT(*) FROM codigos_promo_usos u WHERE u.codigo_id = c.id) AS usos_reales
      FROM codigos_promo c
     ORDER BY c.id
  `);

  const desfasados = filas.filter(f => Number(f.usos_actuales) !== Number(f.usos_reales));

  if (desfasados.length === 0) {
    console.log(`✓ ${filas.length} código(s) revisados: todos los contadores están alineados.`);
    await db.end();
    return;
  }

  console.log(`Se encontraron ${desfasados.length} código(s) con el contador desalineado:\n`);
  for (const f of desfasados) {
    console.log(`  ${f.codigo.padEnd(20)} usos_actuales=${f.usos_actuales}  →  real=${f.usos_reales}`);
  }

  if (dryRun) {
    console.log("\n(--dry-run) No se aplicó ningún cambio.");
    await db.end();
    return;
  }

  for (const f of desfasados) {
    await db.query("UPDATE codigos_promo SET usos_actuales = ? WHERE id = ?", [f.usos_reales, f.id]);
  }
  console.log(`\n✓ ${desfasados.length} contador(es) corregidos.`);

  await db.end();
}

main().catch(err => {
  console.error("Error en la reconciliación:", err.message);
  process.exit(1);
});
