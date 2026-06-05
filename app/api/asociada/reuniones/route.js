// app/api/asociada/reuniones/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "asociada") return unauthorized();

  try {
    // Buscar su referido_id para encontrar reuniones de sus referidas
    const [[referido]] = await dbAupair.query(
      "SELECT r.id FROM referidos r JOIN usuarios u ON u.email = r.email WHERE u.id = ?",
      [session.id]
    ).catch(()=>[[null]]);

    // Traer reuniones de usuarias que se registraron con su código
    const [reuniones] = await dbAupair.query(`
      SELECT 
        r.id,
        r.estado,
        r.notas_cliente as tema,
        r.url_meet,
        d.fecha,
        d.hora_inicio as hora,
        d.hora_fin,
        u.nombre as nombreUsuaria,
        u.apellido as apellidoUsuaria,
        u.email as emailUsuaria
      FROM reuniones r
      JOIN disponibilidad d ON d.id = r.disponibilidad_id
      JOIN usuarios u ON u.id = r.usuario_id
      ${referido ? `WHERE r.usuario_id IN (
        SELECT rr.usuario_id FROM referido_registros rr WHERE rr.referido_id = ?
      )` : "WHERE 1=0"}
      ORDER BY d.fecha DESC, d.hora_inicio DESC
    `, referido ? [referido.id] : []);

    return NextResponse.json({ ok: true, reuniones });
  } catch (err) {
    console.error("[GET /api/asociada/reuniones]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}