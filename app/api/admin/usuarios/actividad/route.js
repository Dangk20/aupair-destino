/ ══════════════════════════════════════════
// app/api/admin/usuarios/actividad/route.js
// ══════════════════════════════════════════
export async function GET() {
  try {
    const [pagos] = await db.query(`
      SELECT 'pago' AS tipo,
        CONCAT('Pago confirmado de $', rr.monto_pagado, ' USD') AS titulo,
        CONCAT(u.nombre, ' ', u.apellido)                        AS descripcion,
        DATE_FORMAT(rr.created_at, '%d/%m %H:%i')               AS tiempo,
        rr.created_at AS orden
      FROM referido_registros rr
      JOIN usuarios u ON u.id = rr.usuario_id
      WHERE rr.pago_realizado = 1
      ORDER BY rr.created_at DESC LIMIT 3
    `);

    const [registros] = await db.query(`
      SELECT 'registro' AS tipo,
        'Nuevo registro' AS titulo,
        CONCAT(nombre, ' ', apellido, ' se registró') AS descripcion,
        DATE_FORMAT(created_at, '%d/%m %H:%i') AS tiempo,
        created_at AS orden
      FROM usuarios WHERE rol != 'admin'
      ORDER BY created_at DESC LIMIT 3
    `);

    const [progresos] = await db.query(`
      SELECT 'progreso' AS tipo,
        CONCAT(u.nombre, ' completó la sesión ', s.orden) AS titulo,
        s.titulo AS descripcion,
        DATE_FORMAT(p.fecha_completado, '%d/%m %H:%i') AS tiempo,
        p.fecha_completado AS orden
      FROM progreso_usuario p
      JOIN usuarios u ON u.id = p.id_usuario
      JOIN sesiones s ON s.id = p.id_sesion
      WHERE p.completada = 1
      ORDER BY p.fecha_completado DESC LIMIT 3
    `);

    const actividad = [...pagos, ...registros, ...progresos]
      .sort((a, b) => new Date(b.orden) - new Date(a.orden))
      .slice(0, 8)
      .map(({ orden, ...rest }) => rest); // quita campo orden

    return NextResponse.json({ actividad });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
