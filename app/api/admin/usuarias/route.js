import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const [usuarias] = await dbAupair.query(`
    SELECT u.id, u.nombre, u.apellido, u.email, u.foto_url,
      u.tiene_acceso, u.perfil_habilitado, u.created_at,
      COUNT(p.id) as sesiones_completadas,
      ROUND(COUNT(p.id) / (SELECT COUNT(*) FROM sesiones) * 100) as porcentaje
    FROM usuarios u
    LEFT JOIN progreso_usuario p ON p.id_usuario = u.id AND p.completada = TRUE
    WHERE u.rol = 'usuaria'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);

  return NextResponse.json({ usuarias });
}