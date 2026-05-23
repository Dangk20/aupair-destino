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

function calcProgreso(u) {
  if (!u) return 0;
  const llenos = CAMPOS_PROGRESO.filter(c => u[c] && String(u[c]).trim() !== "").length;
  return Math.round((llenos / CAMPOS_PROGRESO.length) * 100);
}

function calcEstado(progreso, estadoAdmin) {
  if (estadoAdmin && estadoAdmin !== "Pendiente") return estadoAdmin;
  if (progreso >= 90) return "Completo";
  if (progreso >= 50) return "En revisión";
  if (progreso > 0)   return "Incompleto";
  return "Pendiente";
}

function tiempoRelativo(fecha) {
  if (!fecha) return "—";
  const diff = Math.floor((new Date() - new Date(fecha)) / 60000);
  if (diff < 1)    return "Ahora";
  if (diff < 60)   return `Hace ${diff} min`;
  if (diff < 1440) return `Hace ${Math.floor(diff/60)} h`;
  const dias = Math.floor(diff/1440);
  return `Hace ${dias} día${dias>1?"s":""}`;
}

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const q      = searchParams.get("q")      || "";
    const estado = searchParams.get("estado") || "";
    const ciudad = searchParams.get("ciudad") || "";

    // Todo está en la tabla usuarios — no se necesita JOIN con perfiles
    const [rows] = await dbAupair.query(`
      SELECT
        id, nombre, apellido, email, foto_url,
        ciudad, pais, tiene_acceso, perfil_habilitado,
        created_at, updated_at,
        -- Datos personales del perfil
        cedula, telefono, fecha_nacimiento, bio, pais_destino,
        -- Habilidades
        conoce_requisitos_26, conoce_requisitos_18_20,
        curso_primeros_auxilios, nivel_ingles,
        licencia_conduccion, habilidad_conduccion,
        -- Situación
        situacion_actual, detalle_otra_actividad,
        detalle_estudios, carrera_graduada,
        detalle_trabajo, detalle_sin_ocupacion,
        -- Salud
        enfermedad_medicamentos, detalle_enfermedad_med,
        enfermedad_grave, detalle_enfermedad_grave,
        depresion_panico, trastorno_alimenticio,
        autolesiones, abuso_sustancias, detalle_salud_mental,
        isotretinoina, condiciones_fisicas,
        alergia_medicamentos, detalle_alergias,
        dosis_covid, vacuna_covid,
        -- Experiencia
        exp_ninos_externos, horas_exp_ninos,
        -- Visas
        visa_negada, detalle_visa_negada, visa_cancelada,
        familiar_residencia_usa, detalle_familiar_residencia,
        familiar_visa_estudio_usa, detalle_familiar_visa_estudio,
        overstay_otro_pais,
        entiende_intercambio_cultural, consciente_riesgo_familiar,
        participo_programa_ap, finalizo_programa_ap,
        puede_proveer_certificados
      FROM usuarios
      WHERE rol = 'usuaria'
      ORDER BY created_at DESC
    `);

    const perfiles = rows.map(r => {
      const progreso        = calcProgreso(r);
      const estado_calc     = calcEstado(progreso, null);
      const ultima_fecha    = r.updated_at || r.created_at;

      return {
        ...r,
        progreso,
        estado:           estado_calc,
        estado_agencia:   r.tiene_acceso ? "En progreso" : "Sin acceso",
        progreso_agencia: 0,
        horas_childcare:  0,
        ultima_actividad: tiempoRelativo(ultima_fecha),
        perfil_id:        r.id, // mismo ID del usuario
      };
    });

    // Filtros
    let filtrados = perfiles;
    if (q) filtrados = filtrados.filter(p =>
      `${p.nombre} ${p.apellido} ${p.email} ${p.ciudad||""}`.toLowerCase().includes(q.toLowerCase())
    );
    if (estado) filtrados = filtrados.filter(p => p.estado === estado);
    if (ciudad) filtrados = filtrados.filter(p =>
      (p.ciudad||"").toLowerCase().includes(ciudad.toLowerCase())
    );

    // Stats Tab 1
    const stats_evaluacion = {
      total:       perfiles.length,
      completos:   perfiles.filter(p => p.estado==="Completo"||p.estado==="Verificado").length,
      en_revision: perfiles.filter(p => p.estado==="En revisión").length,
      pendientes:  perfiles.filter(p => p.estado==="Pendiente").length,
      incompletos: perfiles.filter(p => p.estado==="Incompleto").length,
    };

    // Stats Tab 2 — solo con acceso
    const conAcceso = perfiles.filter(p => p.tiene_acceso);
    const stats_agencia = {
      total:       conAcceso.length,
      listos:      conAcceso.filter(p => p.estado_agencia==="Lista para agencia").length,
      en_progreso: conAcceso.filter(p => !p.estado_agencia || p.estado_agencia==="En progreso").length,
      en_revision: conAcceso.filter(p => p.estado_agencia==="En revisión").length,
      incompletos: conAcceso.filter(p => p.estado_agencia==="Incompleto").length,
    };

    return NextResponse.json({ perfiles: filtrados, stats_evaluacion, stats_agencia });

  } catch (err) {
    console.error("[GET /api/admin/perfiles]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}