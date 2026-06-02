import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "asociada") return unauthorized();

  try {
    const [reuniones] = await dbAupair.query(`
      SELECT 
        r.id, r.fecha, r.hora, r.duracion, r.tema, r.descripcion,
        r.confirmada,
        u.nombre as nombreUsuaria, u.apellido as apellidoUsuaria,
        u.email as emailUsuaria,
        CASE 
          WHEN r.tipo = 'inicial' THEN 'Reunión Inicial'
          WHEN r.tipo = 'seguimiento' THEN 'Seguimiento'
          WHEN r.tipo = 'asesoramiento' THEN 'Asesoramiento'
          ELSE 'Reunión'
        END as tipoReunion
      FROM reuniones r
      JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.asesora_id = ?
      ORDER BY r.fecha DESC, r.hora DESC
    `, [session.id]);

    return NextResponse.json({
      ok: true,
      reuniones,
    });
  } catch (err) {
    console.error("[GET /api/asociada/reuniones]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
