import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "asociada") return unauthorized();

  try {
    const [usuarias] = await dbAupair.query(`
      SELECT 
        u.id, u.nombre, u.apellido, u.email, u.ciudad, u.pais,
        u.estado_agencia as estado,
        u.perfil_completo,
        u.created_at,
        (SELECT COUNT(*) FROM sesiones) as sesionesTotal,
        (SELECT COUNT(*) FROM progreso_usuario pu 
         WHERE pu.id_usuario = u.id AND pu.completada = 1) as sesionesCompletadas,
        ROUND(
          (SELECT COUNT(*) FROM progreso_usuario pu WHERE pu.id_usuario = u.id AND pu.completada = 1) /
          GREATEST((SELECT COUNT(*) FROM sesiones), 1) * 100
        ) as porcentajeProgreso
      FROM usuarios u
      WHERE u.rol NOT IN ('admin','asociada') AND u.asesora_asignada_id = ?
      ORDER BY u.created_at DESC
    `, [session.id]);

    return NextResponse.json({ ok: true, usuarias });
  } catch (err) {
    console.error("[GET /api/asociada/usuarias-asignadas]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}