// ════════════════════════════════════════════════════════════════════════
// lib/comisiones-aupair.js — Lo que se le debe a cada asociada, para leerlo
//
// La única lectura de comisiones: la usan la pantalla del admin y la de la
// asociada (R18, change `comisiones-asociada`), que son la misma con otros
// permisos. Generarlas, pagarlas y anularlas sigue en lib/ventas-aupair.js.
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";
import { porMoneda } from "@/lib/moneda";
import { precioCupo, precioConCodigo } from "@/lib/ventas-aupair";

/**
 * Comisiones con sus totales por moneda.
 * @param {{ asociadaId?:number|string, estado?:string, paraAsociada?:boolean }} o
 *   `paraAsociada`: la vista de la propia asociada; sin correos de candidatas.
 */
export async function listarComisiones({ asociadaId = null, estado = null, paraAsociada = false } = {}) {
  const filtros = [];
  const params  = [];
  if (asociadaId) { filtros.push("c.asociada_id = ?"); params.push(asociadaId); }
  if (estado)     { filtros.push("c.estado = ?");      params.push(estado);     }
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
       c.moneda,
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
  const filtroTotales = asociadaId ? "WHERE c.asociada_id = ?" : "";
  const paramsTotales = asociadaId ? [asociadaId] : [];

  const [[totales]] = await dbAupair.query(
    `SELECT
       COUNT(*)                                                          AS total,
       SUM(c.estado = 'pendiente')                                       AS n_pendientes,
       SUM(c.estado = 'pagada')                                          AS n_pagadas,
       SUM(c.estado = 'anulada')                                         AS n_anuladas
     FROM comisiones c
     ${filtroTotales}`,
    paramsTotales
  );
  // R9: los montos no se suman entre monedas.
  const [porM] = await dbAupair.query(
    `SELECT c.moneda,
       COALESCE(SUM(CASE WHEN c.estado='pendiente' THEN c.monto_comision END),0) AS por_pagar,
       COALESCE(SUM(CASE WHEN c.estado='pagada'    THEN c.monto_comision END),0) AS pagado,
       COALESCE(SUM(CASE WHEN c.estado<>'anulada'  THEN c.monto_comision END),0) AS historico
     FROM comisiones c ${filtroTotales} GROUP BY c.moneda`,
    paramsTotales
  );
  totales.por_moneda = {
    por_pagar: porMoneda(porM, "por_pagar"),
    pagado:    porMoneda(porM, "pagado"),
    historico: porMoneda(porM, "historico"),
  };

  if (paraAsociada) {
    // La asociada ve a quién le vendió, no cómo contactarla.
    for (const c of comisiones) { delete c.candidata_email; delete c.asociada_email; }
    return { comisiones, totales };
  }

  // Para el desplegable de filtro: sólo asociadas que tienen comisiones.
  const [asociadas] = await dbAupair.query(
    `SELECT DISTINCT a.id, CONCAT(a.nombre, ' ', a.apellido) AS nombre
       FROM comisiones c
       JOIN usuarios a ON a.id = c.asociada_id
      ORDER BY nombre`
  );
  return { comisiones, totales, asociadas };
}

/** Los códigos de una asociada, con lo que paga hoy quien los usa. */
export async function codigosDeAsociada(asociadaId) {
  const [codigos] = await dbAupair.query(
    `SELECT c.id, c.codigo, c.activo, c.precio_final, c.moneda, c.descuento_porcentaje,
            c.comision_porcentaje, c.usos_max, c.fecha_expiracion,
            (SELECT COUNT(*) FROM ventas v WHERE v.codigo_promo_id = c.id AND v.estado = 'confirmado') AS usos
       FROM codigos_promo c WHERE c.asociada_id = ? ORDER BY c.created_at`,
    [asociadaId]
  );
  const cupo = await precioCupo();
  const [rec] = await dbAupair.query(
    `SELECT v.codigo_promo_id, v.moneda, SUM(v.monto) AS total
       FROM ventas v JOIN codigos_promo c ON c.id = v.codigo_promo_id
      WHERE c.asociada_id = ? AND v.estado = 'confirmado'
      GROUP BY v.codigo_promo_id, v.moneda`,
    [asociadaId]
  );
  return codigos.map((c) => ({
    ...c,
    precio_actual: precioConCodigo(c, cupo),
    recaudado_por_moneda: porMoneda(rec.filter((r) => r.codigo_promo_id === c.id)),
  }));
}
