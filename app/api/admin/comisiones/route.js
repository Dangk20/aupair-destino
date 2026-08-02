// ════════════════════════════════════════════════════════════════════════
// app/api/admin/comisiones/route.js — Comisiones de las asociadas.
//
// GET: listado con la asociada, la candidata que originó la venta, el código
//      usado, los montos, el porcentaje, el estado y las fechas.
//      Filtros: ?asociada=<id> y ?estado=pendiente|pagada|anulada
//
// Las comisiones las genera lib/ventas-aupair.js al confirmar una venta con
// código de asociada. Esta ruta sólo lee: no crea ni recalcula nada.
//
// Los totales EXCLUYEN las anuladas — una comisión anulada no se debe ni se
// pagó, así que no puede sumar en ninguna parte.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const { searchParams } = new URL(req.url);
    const asociada = searchParams.get("asociada");
    const estado   = searchParams.get("estado");

    const filtros = [];
    const params  = [];
    if (asociada) { filtros.push("c.asociada_id = ?"); params.push(asociada); }
    if (estado)   { filtros.push("c.estado = ?");      params.push(estado);   }
    const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : "";

    const [comisiones] = await dbAupair.query(
      `SELECT
         c.id,
         c.venta_id,
         c.asociada_id,
         CONCAT(a.nombre, ' ', a.apellido)   AS asociada,
         a.email                             AS asociada_email,
         c.codigo_promo_id,
         cp.codigo                           AS codigo,
         v.usuario_id                        AS candidata_id,
         CONCAT(u.nombre, ' ', u.apellido)   AS candidata,
         u.email                             AS candidata_email,
         c.monto_venta,
         c.porcentaje,
         c.monto_comision,
         c.estado,
         c.created_at,
         c.pagada_at
       FROM comisiones c
       JOIN usuarios a            ON a.id  = c.asociada_id
       JOIN ventas   v            ON v.id  = c.venta_id
       JOIN usuarios u            ON u.id  = v.usuario_id
       LEFT JOIN codigos_promo cp ON cp.id = c.codigo_promo_id
       ${where}
       ORDER BY c.created_at DESC`,
      params
    );

    // Totales del encabezado. Se calculan sobre el MISMO filtro de asociada
    // que la lista —para que "total por pagar de esta asociada" cuadre con lo
    // que se ve en pantalla— pero ignorando el filtro de estado, que si no
    // haría que al filtrar por "pagada" el total por pagar diera cero.
    const filtroTotales = asociada ? "WHERE c.asociada_id = ?" : "";
    const paramsTotales = asociada ? [asociada] : [];

    const [[totales]] = await dbAupair.query(
      `SELECT
         COUNT(*)                                                          AS total,
         SUM(c.estado = 'pendiente')                                       AS n_pendientes,
         SUM(c.estado = 'pagada')                                          AS n_pagadas,
         SUM(c.estado = 'anulada')                                         AS n_anuladas,
         COALESCE(SUM(CASE WHEN c.estado='pendiente' THEN c.monto_comision END),0) AS por_pagar,
         COALESCE(SUM(CASE WHEN c.estado='pagada'    THEN c.monto_comision END),0) AS pagado,
         COALESCE(SUM(CASE WHEN c.estado<>'anulada'  THEN c.monto_comision END),0) AS historico
       FROM comisiones c
       ${filtroTotales}`,
      paramsTotales
    );

    // Para el desplegable de filtro: sólo asociadas que tienen comisiones.
    const [asociadas] = await dbAupair.query(
      `SELECT DISTINCT a.id, CONCAT(a.nombre, ' ', a.apellido) AS nombre
         FROM comisiones c
         JOIN usuarios a ON a.id = c.asociada_id
        ORDER BY nombre`
    );

    return NextResponse.json({ comisiones, totales, asociadas });
  } catch (err) {
    console.error("[admin/comisiones GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
