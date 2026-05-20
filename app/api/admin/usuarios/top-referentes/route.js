//══════════════════════════════════════════
// app/api/admin/usuarios/top-referentes/route.js
// ══════════════════════════════════════════
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        r.nombre, r.codigo, r.email,
        COUNT(rr.id)                                         AS registradas,
        COALESCE(SUM(rr.pago_realizado), 0)                  AS pagaron,
        ROUND(COALESCE(SUM(rr.monto_pagado),0) * r.porcentaje / 100, 0) AS pendiente
      FROM referidos r
      LEFT JOIN referido_registros rr ON rr.referido_id = r.id
      GROUP BY r.id
      ORDER BY registradas DESC
      LIMIT 3
    `);
    return NextResponse.json({ referentes: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }