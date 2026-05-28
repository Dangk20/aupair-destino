// app/api/admin/stats/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

async function q(db, sql, params = []) {
  try {
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (_) {
    return null;
  }
}
async function q1(db, sql, params = []) {
  const rows = await q(db, sql, params);
  return rows?.[0] ?? null;
}

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const r1  = await q1(dbAupair, "SELECT COUNT(*) AS n FROM usuarios WHERE rol NOT IN ('admin')");
    const totalUsuarias = Number(r1?.n ?? 0);

    const r2  = await q1(dbAupair, "SELECT COUNT(*) AS n FROM usuarios WHERE rol NOT IN ('admin') AND tiene_acceso = TRUE");
    const conAcceso = Number(r2?.n ?? 0);

    const r3  = await q1(dbAupair, "SELECT COUNT(*) AS n FROM sesiones");
    const totalSesiones = Number(r3?.n ?? 0);

    const r4  = await q1(dbAupair, `
      SELECT COUNT(*) AS n FROM (
        SELECT id_usuario FROM progreso_usuario WHERE completada = TRUE
        GROUP BY id_usuario HAVING COUNT(*) = (SELECT COUNT(*) FROM sesiones)
      ) t
    `);
    const completaron = Number(r4?.n ?? 0);

    const r5  = await q1(dbAupair, `
      SELECT ROUND(AVG(sesiones_completadas / GREATEST(total_sesiones,1) * 100)) AS prom
      FROM (
        SELECT u.id, COUNT(p.id) AS sesiones_completadas,
          (SELECT COUNT(*) FROM sesiones) AS total_sesiones
        FROM usuarios u
        LEFT JOIN progreso_usuario p ON p.id_usuario = u.id AND p.completada = TRUE
        WHERE u.rol NOT IN ('admin') GROUP BY u.id
      ) t
    `);
    const progresoPromedio = Number(r5?.prom ?? 0);

    const r6  = await q(dbAupair, `
      SELECT s.titulo, s.orden, COUNT(p.id) AS completadas
      FROM sesiones s
      LEFT JOIN progreso_usuario p ON p.id_sesion = s.id AND p.completada = TRUE
      GROUP BY s.id ORDER BY s.orden ASC
    `);
    const sesionesPopulares = r6 ?? [];

    const r7  = await q(dbAupair, `
      SELECT u.id, u.nombre, u.apellido, u.email, u.tiene_acceso, u.foto_url, u.created_at,
        COUNT(p.id) AS sesiones_completadas,
        ROUND(COUNT(p.id) / GREATEST((SELECT COUNT(*) FROM sesiones),1) * 100) AS porcentaje
      FROM usuarios u
      LEFT JOIN progreso_usuario p ON p.id_usuario = u.id AND p.completada = TRUE
      WHERE u.rol NOT IN ('admin') GROUP BY u.id ORDER BY u.created_at DESC LIMIT 5
    `);
    const ultimasUsuarias = r7 ?? [];

    const r8  = await q1(dbAupair, `
      SELECT COUNT(*) AS n FROM usuarios u WHERE u.rol NOT IN ('admin')
      AND NOT EXISTS (SELECT 1 FROM progreso_usuario p WHERE p.id_usuario = u.id AND p.completada = TRUE)
    `);
    const sinProgreso = Number(r8?.n ?? 0);

    const r9  = await q(dbAupair, `
      SELECT DATE_FORMAT(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY), '%d/%m') AS semana,
        COUNT(*) AS total
      FROM usuarios WHERE rol NOT IN ('admin') AND created_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
      GROUP BY semana ORDER BY MIN(created_at) ASC
    `);
    const registrosPorSemana = r9 ?? [];

    const r10 = await q1(dbAupair, `
      SELECT COUNT(*) AS n FROM usuarios u WHERE u.rol NOT IN ('admin')
      AND EXISTS (SELECT 1 FROM progreso_usuario p WHERE p.id_usuario = u.id AND p.completada = TRUE)
      AND u.id NOT IN (
        SELECT id_usuario FROM progreso_usuario WHERE completada = TRUE
        GROUP BY id_usuario HAVING COUNT(*) = (SELECT COUNT(*) FROM sesiones)
      )
    `);
    const enProgreso = Number(r10?.n ?? 0);

    const completadas_pct = progresoPromedio;
    const en_progreso_pct = totalUsuarias > 0 ? Math.round((enProgreso / totalUsuarias) * 100) : 0;
    const sin_iniciar_pct = Math.max(0, 100 - completadas_pct - en_progreso_pct);

    const r11 = await q(dbAupair, "SELECT tipo, COUNT(*) AS cantidad FROM sesion_recursos GROUP BY tipo ORDER BY cantidad DESC");
    const recursos_por_tipo = r11 ?? [];

    const r12 = await q1(dbAupair, "SELECT COUNT(*) AS n FROM sesion_recursos");
    const total_recursos = Number(r12?.n ?? 0);

    const r13 = await q(dbAupair, `
      SELECT u.id, CONCAT(u.nombre, ' ', u.apellido) AS nombre,
        LEFT(u.nombre,1) AS ini_nombre, LEFT(u.apellido,1) AS ini_apellido,
        CASE WHEN p.completada = TRUE THEN 'completado' ELSE 'iniciado' END AS tipo_evento,
        s.titulo AS sesion_titulo, p.updated_at AS fecha
      FROM progreso_usuario p
      JOIN usuarios u ON u.id = p.id_usuario
      JOIN sesiones s ON s.id = p.id_sesion
      ORDER BY p.updated_at DESC LIMIT 8
    `);
    const actividad = r13 ?? [];

    // ── FIX: quitado WHERE estado = 'publicada' (columna no existe en tu BD) ──
    const publicadas    = totalSesiones; // todas las sesiones cuentan
    const tiempo_promedio = "—";         // requiere columna duracion_minutos

    return NextResponse.json({
    total: totalUsuarias,
    conAcceso,
    soloGratis: totalUsuarias - conAcceso,
    conversion: totalUsuarias > 0 ? Math.round((conAcceso / totalUsuarias) * 100) : 0,
    ...resto
  });

  } catch (err) {
    console.error("[GET /api/admin/stats]", err.message);
    return NextResponse.json({ error: "Error en stats", detalle: err.message }, { status: 500 });
  }
}