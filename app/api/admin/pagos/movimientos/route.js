// ══════════════════════════════════════════
// app/api/admin/pagos/movimientos/route.js

import dbAupair from "@/lib/db-aupair";

// ══════════════════════════════════════════
export async function GET() {
  try {
    const [ingresos] = await dbAupair.query(`
      SELECT
        u.id AS usuarioId,
        CONCAT(u.nombre, ' ', u.apellido)                   AS estudiante,
        u.email                                             AS emailEstudiante,
        LEFT(u.nombre, 1)                                   AS inicial,
        rr.monto_pagado                                     AS montoNum,
        CONCAT('$', FORMAT(rr.monto_pagado, 0), ' USD')     AS monto,
        DATE_FORMAT(rr.created_at, '%d may, %Y %H:%i')      AS fecha,
        'Ingreso'                                           AS tipo,
        'Pago del programa'                                 AS descripcion,
        CONCAT('Inscripción – ', u.nombre, ' ', u.apellido) AS subdescripcion,
        CONCAT('TXN-', LPAD(rr.id, 5, '0'))                 AS referencia,
        COALESCE(u.codigo_referido, '—')                    AS referente,
        COALESCE(u.metodo_pago, 'Transferencia')            AS metodo,
        'Completado'                                        AS estado
      FROM referido_registros rr
      JOIN usuarios u ON u.id = rr.usuario_id
      WHERE rr.pago_realizado = 1
      ORDER BY rr.created_at DESC
    `);

    const [comisiones] = await dbAupair.query(`
      SELECT
        r.nombre                                                 AS estudiante,
        r.email                                                  AS emailEstudiante,
        LEFT(r.nombre, 1)                                        AS inicial,
        CONCAT('$', FORMAT(SUM(rr.monto_pagado)*r.porcentaje/100, 0), ' USD') AS monto,
        DATE_FORMAT(MAX(rr.created_at), '%d may, %Y %H:%i')     AS fecha,
        'Comisión'                                               AS tipo,
        CONCAT('Comisión a ', r.nombre)                          AS descripcion,
        ''                                                       AS subdescripcion,
        CONCAT('COM-', LPAD(r.id, 4, '0'))                       AS referencia,
        r.codigo                                                 AS referente,
        'Transferencia'                                          AS metodo,
        r.estado                                                 AS estado
      FROM referidos r
      JOIN referido_registros rr ON rr.referido_id = r.id
      WHERE rr.pago_realizado = 1
      GROUP BY r.id
      ORDER BY MAX(rr.created_at) DESC
    `);

    return NextResponse.json({ movimientos: [...ingresos, ...comisiones] });
  } catch (e) {
    console.error("Error movimientos:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}