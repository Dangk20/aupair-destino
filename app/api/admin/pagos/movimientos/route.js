// app/api/admin/pagos/movimientos/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";

export async function GET() {
  try {
    // INGRESOS: todos los usuarios con acceso activado
    // Usa LEFT JOIN para mostrarlos aunque no tengan referido_registros
    const [ingresos] = await dbAupair.query(`
      SELECT
        u.id                                                         AS usuarioId,
        CONCAT(u.nombre, ' ', u.apellido)                           AS estudiante,
        u.email                                                      AS emailEstudiante,
        LEFT(u.nombre, 1)                                            AS inicial,
        COALESCE(rr.monto_pagado, 35)                               AS montoNum,
        CONCAT('$', FORMAT(COALESCE(rr.monto_pagado, 35), 0), ' USD') AS monto,
        DATE_FORMAT(COALESCE(rr.created_at, u.created_at), '%d may, %Y %H:%i') AS fecha,
        'Ingreso'                                                    AS tipo,
        'Pago del programa'                                          AS descripcion,
        CONCAT('Inscripcion - ', u.nombre, ' ', u.apellido)         AS subdescripcion,
        CONCAT('TXN-', LPAD(u.id, 5, '0'))                          AS referencia,
        COALESCE(u.codigo_referido, 'Directo')                      AS referente,
        'Transferencia'                                              AS metodo,
        'Completado'                                                 AS estado,
        COALESCE(rr.created_at, u.created_at)                       AS orden
      FROM usuarios u
      LEFT JOIN referido_registros rr ON rr.usuario_id = u.id
      WHERE u.tiene_acceso = 1
        AND u.rol != 'admin'
    `);

    // COMISIONES: referentes con estado Pagado
    const [comisiones] = await dbAupair.query(`
      SELECT
        r.nombre                                                     AS estudiante,
        r.email                                                      AS emailEstudiante,
        LEFT(r.nombre, 1)                                            AS inicial,
        CONCAT('$', FORMAT(ROUND(SUM(rr.monto_pagado) * r.porcentaje / 100, 0), 0), ' USD') AS monto,
        DATE_FORMAT(MAX(rr.created_at), '%d may, %Y %H:%i')         AS fecha,
        'Comision'                                                   AS tipo,
        CONCAT('Comision a ', r.nombre)                              AS descripcion,
        ''                                                           AS subdescripcion,
        CONCAT('COM-', LPAD(r.id, 4, '0'))                          AS referencia,
        r.codigo                                                     AS referente,
        'Transferencia'                                              AS metodo,
        r.estado                                                     AS estado,
        MAX(rr.created_at)                                           AS orden
      FROM referidos r
      JOIN referido_registros rr ON rr.referido_id = r.id
      WHERE rr.pago_realizado = 1
      GROUP BY r.id
      ORDER BY MAX(rr.created_at) DESC
    `);

    const movimientos = [...ingresos, ...comisiones]
      .sort((a, b) => new Date(b.orden) - new Date(a.orden));

    return NextResponse.json({ movimientos });
  } catch (e) {
    console.error("Error movimientos:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}