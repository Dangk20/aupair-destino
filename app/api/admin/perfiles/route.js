// app/api/admin/perfiles/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

const CAMPOS_PROGRESO = [
  "cedula","telefono","fecha_nacimiento","ciudad","pais",
  "nivel_ingles","licencia_conduccion","curso_primeros_auxilios",
  "situacion_actual","exp_ninos_externos","horas_exp_ninos",
  "visa_negada","entiende_intercambio_cultural","consciente_riesgo_familiar",
  "enfermedad_medicamentos","depresion_panico",
];

function calcProgreso(p) {
  if (!p) return 0;
  const llenos = CAMPOS_PROGRESO.filter(c => p[c] && String(p[c]).trim() !== "").length;
  return Math.round((llenos / CAMPOS_PROGRESO.length) * 100);
}

function calcEstado(progreso, estadoAdmin) {
  if (estadoAdmin && estadoAdmin !== "Pendiente") return estadoAdmin;
  if (progreso >= 90) return "Completo";
  if (progreso >= 50) return "En revisión";
  if (progreso > 0)   return "Incompleto";
  return "Pendiente";
}

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const q      = searchParams.get("q")      || "";
    const estado = searchParams.get("estado") || "";
    const ciudad = searchParams.get("ciudad") || "";

    const [rows] = await dbAupair.query(`
      SELECT
        u.id, u.nombre, u.apellido, u.email, u.foto_url,
        u.ciudad AS u_ciudad, u.pais AS u_pais,
        u.created_at, u.tiene_acceso,
        p.id          AS perfil_id,
        p.cedula, p.telefono, p.fecha_nacimiento,
        p.ciudad      AS p_ciudad, p.pais AS p_pais,
        p.bio, p.pais_destino,
        p.conoce_requisitos_26, p.conoce_requisitos_18_20,
        p.curso_primeros_auxilios, p.nivel_ingles,
        p.licencia_conduccion, p.habilidad_conduccion,
        p.situacion_actual, p.detalle_otra_actividad,
        p.detalle_estudios, p.carrera_graduada,
        p.detalle_trabajo, p.detalle_sin_ocupacion,
        p.enfermedad_medicamentos, p.detalle_enfermedad_med,
        p.enfermedad_grave, p.detalle_enfermedad_grave,
        p.depresion_panico, p.trastorno_alimenticio,
        p.autolesiones, p.abuso_sustancias,
        p.detalle_salud_mental, p.isotretinoina,
        p.condiciones_fisicas, p.alergia_medicamentos,
        p.detalle_alergias, p.dosis_covid, p.vacuna_covid,
        p.exp_ninos_externos, p.horas_exp_ninos,
        p.visa_negada, p.detalle_visa_negada, p.visa_cancelada,
        p.familiar_residencia_usa, p.detalle_familiar_residencia,
        p.familiar_visa_estudio_usa, p.detalle_familiar_visa_estudio,
        p.overstay_otro_pais,
        p.entiende_intercambio_cultural, p.consciente_riesgo_familiar,
        p.participo_programa_ap, p.finalizo_programa_ap,
        p.puede_proveer_certificados,
        p.estado      AS estado_admin,
        p.estado_agencia, p.progreso_agencia, p.horas_childcare,
        p.updated_at  AS perfil_updated_at
      FROM usuarios u
      LEFT JOIN perfiles p ON p.usuario_id = u.id
      WHERE u.rol = 'usuaria'
      ORDER BY u.created_at DESC
    `);

    // Calcular progreso y estado para cada perfil
    const perfiles = rows.map(r => {
      const perfil = r.perfil_id ? r : null;
      const progreso = calcProgreso(perfil);
      const estado_calculado = calcEstado(progreso, r.estado_admin);
      const ciudad = r.p_ciudad || r.u_ciudad || "";
      const pais   = r.p_pais   || r.u_pais   || "";

      // Tiempo relativo
      const ahora = new Date();
      const ult = new Date(r.perfil_updated_at || r.created_at);
      const diff = Math.floor((ahora - ult) / 60000);
      let tiempo = "Ahora";
      if (diff < 60) tiempo = `Hace ${diff} min`;
      else if (diff < 1440) tiempo = `Hace ${Math.floor(diff/60)} h`;
      else tiempo = `Hace ${Math.floor(diff/1440)} día${Math.floor(diff/1440)>1?"s":""}`;

      return {
        ...r,
        ciudad, pais,
        progreso,
        estado: estado_calculado,
        ultima_actividad: tiempo,
      };
    });

    // Filtros
    let filtrados = perfiles;
    if (q) filtrados = filtrados.filter(p =>
      `${p.nombre} ${p.apellido} ${p.email} ${p.ciudad}`.toLowerCase().includes(q.toLowerCase())
    );
    if (estado) filtrados = filtrados.filter(p => p.estado === estado);
    if (ciudad) filtrados = filtrados.filter(p => p.ciudad?.toLowerCase().includes(ciudad.toLowerCase()));

    // Stats Tab 1 (evaluación)
    const stats_evaluacion = {
      total:      perfiles.length,
      completos:  perfiles.filter(p => p.estado === "Completo" || p.estado === "Verificado").length,
      en_revision:perfiles.filter(p => p.estado === "En revisión").length,
      pendientes: perfiles.filter(p => p.estado === "Pendiente").length,
      incompletos:perfiles.filter(p => p.estado === "Incompleto").length,
    };

    // Stats Tab 2 (agencia) — solo usuarios con acceso
    const conAcceso = perfiles.filter(p => p.tiene_acceso);
    const stats_agencia = {
      total:        conAcceso.length,
      listos:       conAcceso.filter(p => p.estado_agencia === "Lista para agencia").length,
      en_progreso:  conAcceso.filter(p => p.estado_agencia === "En progreso").length,
      en_revision:  conAcceso.filter(p => p.estado_agencia === "En revisión").length,
      incompletos:  conAcceso.filter(p => p.estado_agencia === "Incompleto").length,
    };

    return NextResponse.json({ perfiles: filtrados, stats_evaluacion, stats_agencia });
  } catch (err) {
    console.error("[GET /api/admin/perfiles]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}