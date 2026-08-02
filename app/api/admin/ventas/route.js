// ════════════════════════════════════════════════════════════════════════
// app/api/admin/ventas/route.js — Panel de ventas del admin.
//
// GET: lista real de ventas desde la tabla `ventas` (estado, fechas y código
//      reales — ya no se infiere de tiene_acceso=1 ni con fechas hardcodeadas).
//      Query param ?estado=pendiente|confirmado para filtrar.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("estado");
    const where = estado ? "WHERE v.estado = ?" : "";
    const params = estado ? [estado] : [];

    const [ventas] = await dbAupair.query(
      `SELECT
         v.id,
         v.usuario_id,
         CONCAT(u.nombre, ' ', u.apellido)   AS candidata,
         u.email                             AS email,
         v.monto,
         v.estado,
         v.tipo,
         v.codigo_texto                      AS codigo,
         cp.asociada_id                      AS asociada_id,
         v.metodo,
         v.referencia,
         v.created_at,
         v.confirmado_at
       FROM ventas v
       JOIN usuarios u        ON u.id = v.usuario_id
       LEFT JOIN codigos_promo cp ON cp.id = v.codigo_promo_id
       ${where}
       ORDER BY v.created_at DESC`,
      params
    );

    // Contadores para el encabezado del panel
    const [[stats]] = await dbAupair.query(
      `SELECT
         COUNT(*)                                                   AS total,
         SUM(estado = 'pendiente')                                  AS pendientes,
         SUM(estado = 'confirmado')                                 AS confirmadas,
         COALESCE(SUM(CASE WHEN estado='confirmado' THEN monto END),0) AS ingresos_confirmados
       FROM ventas`
    );

    return NextResponse.json({ ventas, stats });
  } catch (err) {
    console.error("[admin/ventas GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
