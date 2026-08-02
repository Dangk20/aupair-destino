import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereRol } from "@/lib/session-aupair";

export async function GET(req, { params }) {
  const guard = requiereRol(req, "asociada");
  if (guard.error) return guard.error;
  const session = guard.session;

  const { id: usuariaId } = await params;

  try {
    const [usuarias] = await dbAupair.query(`
      SELECT 
        id, nombre, apellido, email, ciudad, pais, telefono,
        estado_agencia, perfil_completo, created_at,
        cedula, fecha_nacimiento, nivel_ingles,
        exp_ninos_externos, horas_exp_ninos, horas_childcare,
        situacion_actual, carrera_graduada, detalle_estudios,
        enfermedad_medicamentos, depresion_panico, trastorno_alimenticio,
        visa_negada, familiar_residencia_usa, overstay_otro_pais,
        entiende_intercambio_cultural, consciente_riesgo_familiar,
        participo_programa_ap, finalizo_programa_ap
      FROM usuarios 
      WHERE id = ? AND rol NOT IN ('admin','asociada') AND asesora_asignada_id = ?
    `, [usuariaId, session.id]);

    if (usuarias.length === 0) {
      return NextResponse.json({ error: "Usuaria no encontrada" }, { status: 404 });
    }

    const usuaria = usuarias[0];

    // Sesiones usando progreso_usuario
    const [sesiones] = await dbAupair.query(`
      SELECT 
        s.id, s.titulo, s.orden as numero_sesion,
        CASE WHEN pu.id IS NOT NULL THEN 1 ELSE 0 END as completada,
        pu.created_at as fecha_inicio,
        pu.updated_at as fecha_fin
      FROM sesiones s
      LEFT JOIN progreso_usuario pu ON pu.id_sesion = s.id AND pu.id_usuario = ? AND pu.completada = 1
      ORDER BY s.orden ASC
    `, [usuariaId]);

    const [reuniones] = await dbAupair.query(`
      SELECT 
        r.id, r.estado,
        d.fecha, d.hora_inicio as hora,
        r.notas_cliente as tema,
        DATEDIFF(NOW(), d.fecha) as dias_atras
      FROM reuniones r
      LEFT JOIN disponibilidad d ON d.id = r.disponibilidad_id
      WHERE r.usuario_id = ?
      ORDER BY d.fecha DESC
      LIMIT 10
    `, [usuariaId]);

    const sesionesCompletadas = sesiones.filter(s => s.completada).length;
    const porcentajeProgreso = sesiones.length > 0 ? Math.round((sesionesCompletadas / sesiones.length) * 100) : 0;

    return NextResponse.json({
      ok: true,
      usuaria,
      sesiones,
      sesionesCompletadas,
      porcentajeProgreso,
      reuniones,
      documentos: [],
    });
  } catch (err) {
    console.error("[GET /api/asociada/usuarias/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}