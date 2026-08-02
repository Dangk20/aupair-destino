// app/api/agencia/candidatas/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereRol } from "@/lib/session-aupair";

export async function GET(req) {
  const guard = requiereRol(req, "agencia");
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const [candidatas] = await dbAupair.query(`
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.foto_url,
        u.ciudad,
        u.pais,
        u.fecha_nacimiento,
        u.nivel_ingles,
        u.created_at,
        u.estado_agencia,
        u.perfil_completo,
        TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()) as edad,
        ROUND(
          (SELECT COUNT(*) FROM progreso_usuario pu WHERE pu.id_usuario = u.id AND pu.completada = 1) /
          GREATEST((SELECT COUNT(*) FROM sesiones), 1) * 100
        ) as progreso
      FROM usuarios u
      WHERE u.perfil_completo = 1
        AND u.rol NOT IN ('admin','asociada','agencia')
      ORDER BY u.created_at DESC
    `);

    // Stats
    const total = candidatas.length;
    const listasConectar  = candidatas.filter(c => !c.estado_agencia || c.estado_agencia === "Lista para conectar").length;
    const enMatch         = candidatas.filter(c => c.estado_agencia === "En match").length;
    const visaEnProceso   = candidatas.filter(c => c.estado_agencia === "Visa en proceso").length;
    const completadas     = candidatas.filter(c => c.estado_agencia === "Completado").length;

    return NextResponse.json({
      ok: true,
      candidatas,
      stats: { total, listasConectar, enMatch, visaEnProceso, completadas },
    });
  } catch (err) {
    console.error("[GET /api/agencia/candidatas]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}