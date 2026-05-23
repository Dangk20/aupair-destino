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

function calcEstado(progreso) {
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

    // Verificar qué columnas existen para no fallar
    const [cols] = await dbAupair.query("DESCRIBE usuarios");
    const colNames = cols.map(c => c.Field);

    // Columnas base que siempre existen
    const selectBase = "id, nombre, apellido, email, foto_url, ciudad, pais, tiene_acceso, perfil_habilitado, rol, created_at";

    // Columnas opcionales del perfil — solo las que existen
    const colsOpcionales = [
      "cedula","telefono","fecha_nacimiento","bio","pais_destino",
      "conoce_requisitos_26","conoce_requisitos_18_20",
      "curso_primeros_auxilios","nivel_ingles","licencia_conduccion","habilidad_conduccion",
      "situacion_actual","detalle_otra_actividad","detalle_estudios",
      "carrera_graduada","detalle_trabajo","detalle_sin_ocupacion",
      "enfermedad_medicamentos","detalle_enfermedad_med","enfermedad_grave",
      "detalle_enfermedad_grave","depresion_panico","trastorno_alimenticio",
      "autolesiones","abuso_sustancias","detalle_salud_mental","isotretinoina",
      "condiciones_fisicas","alergia_medicamentos","detalle_alergias",
      "dosis_covid","vacuna_covid","exp_ninos_externos","horas_exp_ninos",
      "visa_negada","detalle_visa_negada","visa_cancelada",
      "familiar_residencia_usa","detalle_familiar_residencia",
      "familiar_visa_estudio_usa","detalle_familiar_visa_estudio",
      "overstay_otro_pais","entiende_intercambio_cultural","consciente_riesgo_familiar",
      "participo_programa_ap","finalizo_programa_ap","puede_proveer_certificados",
      "codigo_referido","whatsapp",
    ];

    const selectExtra = colsOpcionales
      .filter(c => colNames.includes(c))
      .join(", ");

    const selectFinal = selectExtra ? `${selectBase}, ${selectExtra}` : selectBase;

    const [rows] = await dbAupair.query(
      `SELECT ${selectFinal} FROM usuarios WHERE rol = 'usuaria' ORDER BY created_at DESC`
    );

    const perfiles = rows.map(r => ({
      ...r,
      progreso:         calcProgreso(r),
      estado:           calcEstado(calcProgreso(r)),
      estado_agencia:   r.tiene_acceso ? "En progreso" : "Sin acceso",
      horas_childcare:  r.horas_childcare  || 0,
      progreso_agencia: r.progreso_agencia || 0,
      ultima_actividad: tiempoRelativo(r.created_at),
    }));

    let filtrados = perfiles;
    if (q) filtrados = filtrados.filter(p =>
      `${p.nombre||""} ${p.apellido||""} ${p.email||""} ${p.ciudad||""}`.toLowerCase().includes(q.toLowerCase())
    );
    if (estado) filtrados = filtrados.filter(p => p.estado === estado);
    if (ciudad) filtrados = filtrados.filter(p =>
      (p.ciudad||"").toLowerCase().includes(ciudad.toLowerCase())
    );

    const stats_evaluacion = {
      total:       perfiles.length,
      completos:   perfiles.filter(p => p.estado==="Completo").length,
      en_revision: perfiles.filter(p => p.estado==="En revisión").length,
      pendientes:  perfiles.filter(p => p.estado==="Pendiente").length,
      incompletos: perfiles.filter(p => p.estado==="Incompleto").length,
    };

    const conAcceso = perfiles.filter(p => p.tiene_acceso);
    const stats_agencia = {
      total:       conAcceso.length,
      listos:      conAcceso.filter(p => p.estado_agencia==="Lista para agencia").length,
      en_progreso: conAcceso.filter(p => p.estado_agencia==="En progreso").length,
      en_revision: conAcceso.filter(p => p.estado_agencia==="En revisión").length,
      incompletos: conAcceso.filter(p => p.estado_agencia==="Incompleto").length,
    };

    return NextResponse.json({ perfiles: filtrados, stats_evaluacion, stats_agencia });

  } catch (err) {
    console.error("[GET /api/admin/perfiles]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}