#!/usr/bin/env node
const db = require('./lib/db-aupair');

(async () => {
  try {
    console.log('🔍 Buscando asesoras...\n');

    // Query simple
    const [asociadas] = await db.query(`
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.codigo_referido,
        u.rol
      FROM usuarios u
      WHERE u.rol = 'asociada'
      ORDER BY u.created_at DESC
      LIMIT 5
    `);

    console.log(`✅ Se encontraron ${asociadas.length} asesoras\n`);

    if (asociadas.length === 0) {
      console.log('⚠️  No hay asesoras en la BD. Necesitas crear una.');
      console.log('   Ve a /admin/asociadas y crea una nueva.\n');
    } else {
      console.table(asociadas);
    }

    // Verificar referidos
    console.log('\n🔍 Buscando referidos...\n');
    const [referidos] = await db.query(`
      SELECT 
        r.id,
        r.nombre,
        r.email,
        r.codigo,
        u.nombre as asesora_nombre,
        u.email as asesora_email
      FROM referidos r
      LEFT JOIN usuarios u ON u.email = r.email AND u.rol = 'asociada'
      LIMIT 5
    `);

    console.log(`✅ Se encontraron ${referidos.length} referidos\n`);
    console.table(referidos);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
