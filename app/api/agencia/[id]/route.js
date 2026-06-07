// app/api/agencia/candidatas/[id]/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "agencia") return unauthorized();

  const { id } = await params;

  try {
    const [[candidata]] = await dbAupair.query(`
      SELECT
        u.id, u.nombre, u.apellido, u.email, u.foto_url,
        u.ciudad, u.pais, u.fecha_nacimiento, u.nivel_ingles,
        u.estado_agencia, u.perfil_completo,
        u.exp_ninos_externos, u.horas_exp_ninos, u.horas_childcare,
        u.situacion_actual, u.carrera_graduada, u.detalle_estudios,
        u.visa_negada, u.familiar_residencia_usa,
        u.entiende_intercambio_cultural, u.consciente_riesgo_familiar,
        u.participo_programa_ap, u.finalizo_programa_ap,
        TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()) as edad,
        ROUND(
          (SELECT COUNT(*) FROM progreso_usuario pu WHERE pu.id_usuario = u.id AND pu.completada = 1) /
          GREATEST((SELECT COUNT(*) FROM sesiones), 1) * 100
        ) as progreso
      FROM usuarios u
      WHERE u.id = ? AND u.perfil_completo = 1 AND u.rol NOT IN ('admin','asociada','agencia')
    `, [id]);

    if (!candidata) {
      return NextResponse.json({ error: "Candidata no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, candidata });
  } catch (err) {
    console.error("[GET /api/agencia/candidatas/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}