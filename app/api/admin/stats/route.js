// app/api/admin/stats/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  // ─── Queries que ya tenías ────────────────────────────────────────────────

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

  const [registrosPorSemana] = await dbAupair.query(`
    SELECT 
      DATE_FORMAT(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY), '%d/%m') as semana,
      COUNT(*) as total
    FROM usuarios
    WHERE rol = 'usuaria' AND created_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
    GROUP BY semana
    ORDER BY MIN(created_at) ASC
  `);

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

  const [sesionesPopulares] = await dbAupair.query(`
    SELECT s.titulo, s.orden, COUNT(p.id) as completadas
    FROM sesiones s
    LEFT JOIN progreso_usuario p ON p.id_sesion = s.id AND p.completada = TRUE
    GROUP BY s.id ORDER BY s.orden ASC
  `);

  const [ultimasUsuarias] = await dbAupair.query(`
    SELECT u.id, u.nombre, u.apellido, u.email, u.tiene_acceso, u.foto_url, u.created_at,
      COUNT(p.id) as sesiones_completadas,
      ROUND(COUNT(p.id) / (SELECT COUNT(*) FROM sesiones) * 100) as porcentaje
    FROM usuarios u
    LEFT JOIN progreso_usuario p ON p.id_usuario = u.id AND p.completada = TRUE
    WHERE u.rol = 'usuaria'
    GROUP BY u.id ORDER BY u.created_at DESC LIMIT 5
  `);

  const [[{ sinProgreso }]] = await dbAupair.query(`
    SELECT COUNT(*) as sinProgreso FROM usuarios u
    WHERE u.rol = 'usuaria'
    AND NOT EXISTS (
      SELECT 1 FROM progreso_usuario p WHERE p.id_usuario = u.id AND p.completada = TRUE
    )
  `);

  // ─── Nuevas queries para la página de Sesiones ────────────────────────────

  // Sesiones publicadas
  const [[{ publicadas }]] = await dbAupair.query(
    "SELECT COUNT(*) as publicadas FROM sesiones WHERE estado = 'publicada'"
  );

  // Tiempo promedio del programa (suma duración de sesiones publicadas)
  // Requiere columna duracion_minutos en tabla sesiones.
  // Si no la tienes aún, devuelve "—" sin romper nada.
  let tiempo_promedio = "—";
  try {
    const [[{ minutos_total }]] = await dbAupair.query(
      "SELECT COALESCE(SUM(duracion_minutos), 0) AS minutos_total FROM sesiones WHERE estado = 'publicada'"
    );
    if (minutos_total > 0) {
      const h = Math.floor(minutos_total / 60);
      const m = minutos_total % 60;
      tiempo_promedio = `${h}h ${m}m`;
    }
  } catch (_) { /* columna no existe todavía, ignorar */ }

  // Distribución para la dona (usa progresoPromedio ya calculado arriba)
  const prom          = progresoPromedio || 0;
  const completadas_pct  = prom;
  // Usuarias que tienen algo de progreso pero no terminaron todo
  const [[{ enProgreso }]] = await dbAupair.query(`
    SELECT COUNT(*) as enProgreso FROM usuarios u
    WHERE u.rol = 'usuaria'
    AND EXISTS (
      SELECT 1 FROM progreso_usuario p WHERE p.id_usuario = u.id AND p.completada = TRUE
    )
    AND u.id NOT IN (
      SELECT id_usuario FROM progreso_usuario WHERE completada = TRUE
      GROUP BY id_usuario
      HAVING COUNT(*) = (SELECT COUNT(*) FROM sesiones)
    )
  `);
  const en_progreso_pct = totalUsuarias > 0 ? Math.round((enProgreso / totalUsuarias) * 100) : 0;
  const sin_iniciar_pct = Math.max(0, 100 - completadas_pct - en_progreso_pct);

  // Recursos por tipo (tabla sesion_recursos)
  let recursos_por_tipo = [];
  let total_recursos    = 0;
  try {
    const [rpt] = await dbAupair.query(`
      SELECT tipo, COUNT(*) AS cantidad
      FROM sesion_recursos
      GROUP BY tipo
      ORDER BY cantidad DESC
    `);
    recursos_por_tipo = rpt;

    const [[{ tr }]] = await dbAupair.query(
      "SELECT COUNT(*) AS tr FROM sesion_recursos"
    );
    total_recursos = tr;
  } catch (_) { /* tabla aún no existe, devolver vacío */ }

  // Actividad reciente — últimas 8 acciones de estudiantes
  const [actividad] = await dbAupair.query(`
    SELECT
      u.id,
      CONCAT(u.nombre, ' ', u.apellido) AS nombre,
      LEFT(u.nombre,  1) AS ini_nombre,
      LEFT(u.apellido,1) AS ini_apellido,
      CASE WHEN p.completada = TRUE THEN 'completado' ELSE 'iniciado' END AS tipo_evento,
      s.titulo AS sesion_titulo,
      p.updated_at AS fecha
    FROM progreso_usuario p
    JOIN usuarios u ON u.id = p.id_usuario
    JOIN sesiones s ON s.id = p.id_sesion
    ORDER BY p.updated_at DESC
    LIMIT 8
  `);

  // ─── Respuesta ────────────────────────────────────────────────────────────
  return NextResponse.json({
    // — lo que ya tenías —
    totalUsuarias,
    conAcceso,
    totalSesiones,
    completaron,
    progresoPromedio: progresoPromedio || 0,
    tasaConversion: totalUsuarias > 0 ? Math.round((conAcceso / totalUsuarias) * 100) : 0,
    sinProgreso,
    registrosPorSemana,
    sesionesPopulares,
    ultimasUsuarias,

    // — nuevo para la página de Sesiones —
    publicadas,
    tiempo_promedio,
    completadas_pct,
    en_progreso_pct,
    sin_iniciar_pct,
    recursos_por_tipo,   // [{ tipo: 'pdf', cantidad: 5 }, ...]
    total_recursos,
    actividad,           // últimas acciones de estudiantes
  });
}