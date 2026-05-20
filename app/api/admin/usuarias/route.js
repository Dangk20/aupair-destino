
// ══════════════════════════════════════════
// app/api/admin/usuarias/route.js
// ══════════════════════════════════════════
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        u.id, u.nombre, u.apellido, u.email, u.foto_url,
        u.tiene_acceso, u.perfil_habilitado, u.codigo_referido,
        u.metodo_pago, u.created_at,
        r.nombre  AS referente_nombre,
        r.email   AS referente_email,
        rr.monto_pagado,
        ROUND(rr.monto_pagado * ref.porcentaje / 100, 2) AS comision_generada,
        COUNT(p.id) AS sesiones_completadas,
        ROUND(COUNT(p.id) / (SELECT COUNT(*) FROM sesiones) * 100) AS porcentaje
      FROM usuarios u
      LEFT JOIN referido_registros rr ON rr.usuario_id  = u.id
      LEFT JOIN referidos ref         ON ref.id          = rr.referido_id
      LEFT JOIN referidos r           ON r.codigo        = u.codigo_referido
      LEFT JOIN progreso_usuario p    ON p.id_usuario    = u.id AND p.completada = 1
      WHERE u.rol != 'admin'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return NextResponse.json({ usuarias: rows });
  } catch (e) {
    console.error("Error usuarias:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}