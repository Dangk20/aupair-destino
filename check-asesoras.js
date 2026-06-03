const db = require('./lib/db-aupair');

(async () => {
  try {
    const [[count]] = await db.query('SELECT COUNT(*) as total FROM usuarios WHERE rol = ?', ['asociada']);
    console.log('Asesoras en BD:', count?.total || 0);
    
    if ((count?.total || 0) === 0) {
      console.log('\n⚠️  No hay asesoras. Necesito crear una de prueba.\n');
      
      // Crear asesora de prueba
      const bcrypt = require('bcryptjs');
      const password = await bcrypt.hash('Test123!', 10);
      
      await db.query(
        `INSERT INTO usuarios (nombre, apellido, email, password, rol, codigo_referido, tiene_acceso, perfil_habilitado, created_at)
         VALUES (?, ?, ?, ?, 'asociada', ?, 1, 1, NOW())`,
        ['María', 'Test', 'maria.test@example.com', password, 'MARIA9999']
      );
      
      console.log('✅ Asesora creada exitosamente');
      console.log('   Email: maria.test@example.com');
      console.log('   Contraseña: Test123!');
      console.log('   Código: MARIA9999\n');
    } else {
      // Listar asesoras existentes
      const [asesoras] = await db.query('SELECT id, nombre, apellido, email, codigo_referido FROM usuarios WHERE rol = ? LIMIT 5', ['asociada']);
      console.log('\n✅ Asesoras encontradas:');
      console.table(asesoras);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
