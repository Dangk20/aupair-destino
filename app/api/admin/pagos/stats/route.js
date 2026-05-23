// app/api/admin/pagos/stats/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";

async function safe(sql, params = []) {
  try { const [r] = await dbAupair.query(sql, params); return r; }
  catch { return null; }
}

export async function GET() {
  try {
    // ── Stats principales ────────────────────────────────────────────────
    const [[s]] = await dbAupair.query(`
  SELECT
    COALESCE(SUM(COALESCE(rr.monto_pagado, 35)), 0)              AS ingresos,
    COALESCE(SUM(CASE WHEN ref.estado = 'Pendiente'
      THEN rr.monto_pagado * ref.porcentaje / 100 ELSE 0 END), 0) AS comisionesPagar,
    COALESCE(SUM(CASE WHEN ref.estado = 'Pagado'
      THEN rr.monto_pagado * ref.porcentaje / 100 ELSE 0 END), 0) AS comisionesPagadas,
    COUNT(DISTINCT u.id)                                          AS totalTransacciones
  FROM usuarios u
  LEFT JOIN referido_registros rr ON rr.usuario_id = u.id
  LEFT JOIN referidos ref ON ref.id = rr.referido_id
  WHERE u.tiene_acceso = 1
    AND u.rol != 'admin'
`);

    // ── Progreso promedio (tabla puede no existir) ───────────────────────
    const progresoRows = await safe(`
      SELECT ROUND(AVG(
        (SELECT COUNT(*) FROM progreso_usuario p
         WHERE p.id_usuario = u.id AND p.completada = 1)
        / GREATEST((SELECT COUNT(*) FROM sesiones), 1) * 100
      )) AS progresoPromedio
      FROM usuarios u WHERE u.rol != 'admin'
    `);
    const progresoPromedio = Number(progresoRows?.[0]?.progresoPromedio || 0);

    // ── Pagos pendientes ─────────────────────────────────────────────────
    const [[{ pagosPendientes }]] = await dbAupair.query(
      "SELECT COUNT(*) AS pagosPendientes FROM referidos WHERE estado = 'Pendiente'"
    );

    // ── Top referentes ───────────────────────────────────────────────────
    const [topReferentes] = await dbAupair.query(`
      SELECT r.nombre, r.codigo,
        ROUND(SUM(rr.monto_pagado) * r.porcentaje / 100, 0) AS comision
      FROM referidos r
      JOIN referido_registros rr ON rr.referido_id = r.id
      WHERE rr.pago_realizado = 1
      GROUP BY r.id ORDER BY comision DESC LIMIT 5
    `);

    // ── Gráfica ingresos por semana ──────────────────────────────────────
    const [graficaIngresos] = await dbAupair.query(`
      SELECT
        CONCAT(DAY(MIN(created_at)), '-', DAY(MAX(created_at)), ' may') AS label,
        SUM(monto_pagado) AS monto
      FROM referido_registros
      WHERE pago_realizado = 1
      GROUP BY WEEK(created_at)
      ORDER BY WEEK(created_at) DESC LIMIT 4
    `);

    const ingresos      = Number(s?.ingresos         || 0);
    const compPagar     = Number(s?.comisionesPagar   || 0);
    const compPagadas   = Number(s?.comisionesPagadas || 0);
    const gananciaNeta  = Math.max(ingresos - compPagar - compPagadas, 0);
    const totalTx       = Number(s?.totalTransacciones || 0);
    const ticketPromedio = totalTx > 0 ? Math.round(ingresos / totalTx) : 0;

    return NextResponse.json({
      ingresos,
      comisionesPagar:   compPagar,
      comisionesPagadas: compPagadas,
      gananciaNeta,
      pagosPendientes:   Number(pagosPendientes || 0),
      montoPendiente:    compPagar,
      pendientes:        compPagar,
      totalTransacciones: totalTx,
      ticketPromedio,
      progresoPromedio,
      topReferentes:     topReferentes || [],
      graficaIngresos:   graficaIngresos || [],
      programadas: 0,
      vencidas:    0,
      metodoPagos: [],
    });
  } catch (err) {
    console.error("[GET /api/admin/pagos/stats]", err.message);
    // Devolver ceros en vez de 500
    return NextResponse.json({
      ingresos: 0, comisionesPagar: 0, comisionesPagadas: 0,
      gananciaNeta: 0, pagosPendientes: 0, montoPendiente: 0,
      pendientes: 0, totalTransacciones: 0, ticketPromedio: 0,
      progresoPromedio: 0, topReferentes: [], graficaIngresos: [],
      programadas: 0, vencidas: 0, metodoPagos: [],
      error: err.message,
    });
  }
}