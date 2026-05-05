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
  const [[{ completaron }]] = await dbAupair.query(`
    SELECT COUNT(*) as completaron FROM (
      SELECT id_usuario FROM progreso_usuario WHERE completada = TRUE
      GROUP BY id_usuario
      HAVING COUNT(*) = (SELECT COUNT(*) FROM sesiones)
    ) t
  `);

  // Registros por semana (últimas 8 semanas)
  const [registrosPorSemana] = await dbAupair.query(`
    SELECT 
      DATE_FORMAT(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY), '%d/%m') as semana,
      COUNT(*) as total
    FROM usuarios
    WHERE rol = 'usuaria' AND created_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
    GROUP BY semana
    ORDER BY MIN(created_at) ASC
  `);

  // Progreso promedio
  const [[{ progresoPromedio }]] = await dbAupair.query(`
    SELECT ROUND(AVG(sesiones_completadas / total_sesiones * 100)) as progresoPromedio
    FROM (
      SELECT u.id,
        COUNT(p.id) as sesiones_completadas,
        (SELECT COUNT(*) FROM sesiones) as total_sesiones
      FROM usuarios u
      LEFT JOIN progreso_usuario p ON p.id_usuario = u.id AND p.completada = TRUE
      WHERE u.rol = 'usuaria'
      GROUP BY u.id
    ) t
  `);

  // Sesiones populares
  const [sesionesPopulares] = await dbAupair.query(`
    SELECT s.titulo, s.orden, COUNT(p.id) as completadas
    FROM sesiones s
    LEFT JOIN progreso_usuario p ON p.id_sesion = s.id AND p.completada = TRUE
    GROUP BY s.id ORDER BY s.orden ASC
  `);

  // Últimas usuarias
  const [ultimasUsuarias] = await dbAupair.query(`
    SELECT u.id, u.nombre, u.apellido, u.email, u.tiene_acceso, u.foto_url, u.created_at,
      COUNT(p.id) as sesiones_completadas,
      ROUND(COUNT(p.id) / (SELECT COUNT(*) FROM sesiones) * 100) as porcentaje
    FROM usuarios u
    LEFT JOIN progreso_usuario p ON p.id_usuario = u.id AND p.completada = TRUE
    WHERE u.rol = 'usuaria'
    GROUP BY u.id ORDER BY u.created_at DESC LIMIT 5
  `);

  // Sin progreso
  const [[{ sinProgreso }]] = await dbAupair.query(`
    SELECT COUNT(*) as sinProgreso FROM usuarios u
    WHERE u.rol = 'usuaria'
    AND NOT EXISTS (
      SELECT 1 FROM progreso_usuario p WHERE p.id_usuario = u.id AND p.completada = TRUE
    )
  `);

  return NextResponse.json({
    totalUsuarias, conAcceso, totalSesiones, completaron,
    progresoPromedio: progresoPromedio || 0,
    tasaConversion: totalUsuarias > 0 ? Math.round((conAcceso / totalUsuarias) * 100) : 0,
    sinProgreso,
    registrosPorSemana,
    sesionesPopulares,
    ultimasUsuarias,
  });
}