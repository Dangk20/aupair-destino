import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function GET(req) {
  // Ruta de administración: exige sesión con rol admin.
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const [rows] = await dbAupair.query(`
      SELECT
        r.nombre, r.codigo, r.email,
        COUNT(rr.id) AS registradas,
        COALESCE(SUM(rr.pago_realizado), 0) AS pagaron,
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
}