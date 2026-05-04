// ── /api/admin/stats/route.js ──────────────────────────
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const [[{ totalUsuarias }]] = await dbAupair.query(
    "SELECT COUNT(*) as totalUsuarias FROM usuarios WHERE rol = 'usuaria'"
  );
  const [[{ conAcceso }]] = await dbAupair.query(
    "SELECT COUNT(*) as conAcceso FROM usuarios WHERE rol = 'usuaria' AND tiene_acceso = TRUE"
  );
  const [[{ totalSesiones }]] = await dbAupair.query(
    "SELECT COUNT(*) as totalSesiones FROM sesiones"
  );

  // Usuarias que completaron todas las sesiones
  const [[{ completaron }]] = await dbAupair.query(`
    SELECT COUNT(*) as completaron FROM (
      SELECT id_usuario FROM progreso_usuario WHERE completada = TRUE
      GROUP BY id_usuario
      HAVING COUNT(*) = (SELECT COUNT(*) FROM sesiones)
    ) t
  `);

  const [ultimasUsuarias] = await dbAupair.query(`
    SELECT u.id, u.nombre, u.apellido, u.email, u.tiene_acceso, u.created_at,
      COUNT(p.id) as sesiones_completadas,
      ROUND(COUNT(p.id) / (SELECT COUNT(*) FROM sesiones) * 100) as porcentaje
    FROM usuarios u
    LEFT JOIN progreso_usuario p ON p.id_usuario = u.id AND p.completada = TRUE
    WHERE u.rol = 'usuaria'
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT 5
  `);

  return NextResponse.json({ totalUsuarias, conAcceso, totalSesiones, completaron, ultimasUsuarias });
}