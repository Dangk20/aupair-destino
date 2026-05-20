// ══════════════════════════════════════════
// app/api/admin/pagos/stats/route.js
// ══════════════════════════════════════════
export async function GET() {
  try {
    const [[s]] = await db.query(`
      SELECT
        COALESCE(SUM(rr.monto_pagado), 0) AS ingresos,
        COALESCE(SUM(CASE WHEN ref.estado='Pendiente'
          THEN rr.monto_pagado * ref.porcentaje / 100 ELSE 0 END), 0) AS comisionesPagar,
        COALESCE(SUM(CASE WHEN ref.estado='Pagado'
          THEN rr.monto_pagado * ref.porcentaje / 100 ELSE 0 END), 0) AS comisionesPagadas,
        COUNT(DISTINCT rr.usuario_id) AS totalTransacciones
      FROM referido_registros rr
      LEFT JOIN referidos ref ON ref.id = rr.referido_id
      WHERE rr.pago_realizado = 1
    `);

    const [[{ progresoPromedio }]] = await db.query(`
      SELECT ROUND(AVG(
        (SELECT COUNT(*) FROM progreso_usuario p
         WHERE p.id_usuario = u.id AND p.completada = 1)
        / (SELECT COUNT(*) FROM sesiones) * 100
      )) AS progresoPromedio
      FROM usuarios u WHERE u.rol != 'admin'
    `);

    const [[{ pagosPendientes }]] = await db.query(
      "SELECT COUNT(*) AS pagosPendientes FROM referidos WHERE estado = 'Pendiente'"
    );

    const [topReferentes] = await db.query(`
      SELECT r.nombre, r.codigo,
        ROUND(SUM(rr.monto_pagado) * r.porcentaje / 100, 0) AS comision
      FROM referidos r
      JOIN referido_registros rr ON rr.referido_id = r.id
      WHERE rr.pago_realizado = 1
      GROUP BY r.id ORDER BY comision DESC LIMIT 5
    `);

    const [graficaIngresos] = await db.query(`
      SELECT
        CONCAT(DAY(MIN(created_at)), '-', DAY(MAX(created_at)), ' may') AS label,
        SUM(monto_pagado) AS monto
      FROM referido_registros
      WHERE pago_realizado = 1
      GROUP BY WEEK(created_at)
      ORDER BY WEEK(created_at) LIMIT 4
    `);

    const gananciaNeta = s.ingresos - s.comisionesPagar - s.comisionesPagadas;
    const ticketPromedio = s.totalTransacciones > 0
      ? Math.round(s.ingresos / s.totalTransacciones) : 0;

    return NextResponse.json({
      ...s, gananciaNeta, pagosPendientes,
      montoPendiente: s.comisionesPagar,
      pendientes: s.comisionesPagar,
      programadas: 0, vencidas: 0,
      progresoPromedio, topReferentes,
      graficaIngresos, ticketPromedio,
      metodoPagos: [],
    });
  } catch (e) {
    console.error("Error pagos/stats:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}