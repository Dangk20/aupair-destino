import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "asociada") return unauthorized();

  try {
    const [[usuariasStats]] = await dbAupair.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado_agencia = 'Completado' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado_agencia = 'En progreso' THEN 1 ELSE 0 END) as enProgreso
      FROM usuarios 
      WHERE rol NOT IN ('admin','asociada') AND asesora_asignada_id = ?
    `, [session.id]);

    const [reuniones] = await dbAupair.query(`
      SELECT 
        r.id, d.fecha, d.hora_inicio as hora,
        u.nombre as nombreUsuaria
      FROM reuniones r
      JOIN disponibilidad d ON d.id = r.disponibilidad_id
      JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.usuario_id IN (
        SELECT id FROM usuarios WHERE asesora_asignada_id = ?
      )
      AND d.fecha >= CURDATE()
      ORDER BY d.fecha ASC, d.hora_inicio ASC
      LIMIT 5
    `, [session.id]);

    const [usuariasRecientes] = await dbAupair.query(`
      SELECT 
        u.id, u.nombre, u.apellido, u.estado_agencia as estado,
        ROUND(
          (SELECT COUNT(*) FROM progreso_usuario pu WHERE pu.id_usuario = u.id AND pu.completada = 1) /
          GREATEST((SELECT COUNT(*) FROM sesiones), 1) * 100
        ) as porcentajeProgreso
      FROM usuarios u
      WHERE u.rol NOT IN ('admin','asociada') AND u.asesora_asignada_id = ?
      ORDER BY u.created_at DESC
      LIMIT 5
    `, [session.id]);

    const [[reunionesSemanales]] = await dbAupair.query(`
      SELECT COUNT(*) as count
      FROM reuniones r
      JOIN disponibilidad d ON d.id = r.disponibilidad_id
      WHERE r.usuario_id IN (SELECT id FROM usuarios WHERE asesora_asignada_id = ?)
        AND WEEK(d.fecha) = WEEK(NOW())
        AND YEAR(d.fecha) = YEAR(NOW())
    `, [session.id]);

    return NextResponse.json({
      totalUsuarias: usuariasStats?.total || 0,
      completadas: usuariasStats?.completadas || 0,
      enProgreso: usuariasStats?.enProgreso || 0,
      reunionesSemanales: reunionesSemanales?.count || 0,
      proximasReuniones: reuniones,
      usuariasRecientes,
      tareasPendientes: [],
    });
  } catch (err) {
    console.error("[GET /api/asociada/stats]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}