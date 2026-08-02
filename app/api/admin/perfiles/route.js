// app/api/admin/perfiles/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

/* ── Campos para calcular progreso evaluación ── */
const CAMPOS_EVAL = [
  "cedula","telefono","fecha_nacimiento","ciudad","pais",
  "nivel_ingles","licencia_conduccion","curso_primeros_auxilios",
  "situacion_actual","exp_ninos_externos","horas_exp_ninos",
  "visa_negada","entiende_intercambio_cultural","consciente_riesgo_familiar",
  "enfermedad_medicamentos","depresion_panico",
];

/* ── Secciones agencia y sus campos clave ── */
const SECCIONES_AGENCIA = [
  { campos:["estatura","peso","nacionalidad","tiene_pasaporte"] },         // 1 personal
  { campos:["exp_ninos_externos","horas_exp_ninos","horas_childcare"] },   // 2 experiencia
  { campos:["situacion_actual","carrera_graduada"] },                      // 3 educacion
  { campos:["licencia_conduccion","tipo_licencia"] },                      // 4 conduccion
  { campos:["bio","hobbies"] },                                            // 5 personalidad
  { campos:["por_que_au_pair"] },                                          // 6 preguntas
  { campos:["enfermedad_medicamentos","dieta_especial"] },                 // 7 salud
  { campos:["referencia_1_nombre","referencia_1_email"] },                 // 8 referencias
  { campos:["foto_url"] },                                                 // 9 fotos
  { campos:["estado_agencia"] },                                           // 10 estado
];

function calcProgresoEval(u) {
  if (!u) return 0;
  const llenos = CAMPOS_EVAL.filter(c => u[c] && String(u[c]).trim() !== "").length;
  return Math.round((llenos / CAMPOS_EVAL.length) * 100);
}

function calcProgresoAgencia(u) {
  if (!u) return 0;
  const completadas = SECCIONES_AGENCIA.filter(sec =>
    sec.campos.filter(c => u[c] && String(u[c]).trim() !== "" && u[c] !== "0").length >= Math.ceil(sec.campos.length / 2)
  ).length;
  return Math.round((completadas / SECCIONES_AGENCIA.length) * 100);
}

function calcEstadoEval(progreso) {
  if (progreso >= 90) return "Completo";
  if (progreso >= 50) return "En revisión";
  if (progreso > 0)   return "Incompleto";
  return "Pendiente";
}

function calcEstadoAgencia(u, progreso) {
  // Si el admin ya definió un estado, usarlo
  if (u.estado_agencia && u.estado_agencia !== "En progreso") return u.estado_agencia;
  if (progreso >= 80) return "Lista para agencia";
  if (progreso >= 40) return "En progreso";
  if (progreso > 0)   return "Incompleto";
  return "Sin inicio";
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
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { searchParams } = new URL(req.url);
    const q      = searchParams.get("q")      || "";
    const estado = searchParams.get("estado") || "";
    const ciudad = searchParams.get("ciudad") || "";

    const [rows] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE rol = 'usuaria' ORDER BY created_at DESC"
    );

    const perfiles = rows.map(r => {
      // Quitar password
      delete r.password;

      const progresoEval    = calcProgresoEval(r);
      const progresoAgencia = calcProgresoAgencia(r);
      const estadoEval      = calcEstadoEval(progresoEval);
      const estadoAgencia   = calcEstadoAgencia(r, progresoAgencia);

      return {
        ...r,
        // Tab 1 — evaluación
        progreso:         progresoEval,
        estado:           estadoEval,
        // Tab 2 — agencia (calculado dinámicamente)
        progreso_agencia: progresoAgencia,
        estado_agencia:   estadoAgencia,
        ultima_actividad: tiempoRelativo(r.created_at),
      };
    });

    // La TABLA solo muestra perfiles ya diligenciados (con algo lleno en
    // evaluación o en agencia). Las candidatas que nunca empezaron no aparecen
    // — no hay nada que analizar. Las stats de arriba sí cuentan a todas.
    // Si el admin filtra explícitamente por un estado "vacío", se respeta.
    let filtrados = perfiles;
    const estadosVacios = ["Pendiente", "Sin inicio", "Incompleto"];
    if (!estado || !estadosVacios.includes(estado)) {
      // "Diligenciado" = la candidata ya empezó a llenar su perfil (evaluación).
      filtrados = filtrados.filter(p => p.progreso > 0);
    }

    if (q) filtrados = filtrados.filter(p =>
      `${p.nombre||""} ${p.apellido||""} ${p.email||""} ${p.ciudad||""}`.toLowerCase().includes(q.toLowerCase())
    );
    if (estado) {
      // Filtrar por estado evaluación o agencia según contexto
      filtrados = filtrados.filter(p => p.estado === estado || p.estado_agencia === estado);
    }
    if (ciudad) filtrados = filtrados.filter(p =>
      (p.ciudad||"").toLowerCase().includes(ciudad.toLowerCase())
    );

    // Stats Tab 1 — evaluación
    const stats_evaluacion = {
      total:       perfiles.length,
      completos:   perfiles.filter(p => p.estado==="Completo").length,
      en_revision: perfiles.filter(p => p.estado==="En revisión").length,
      pendientes:  perfiles.filter(p => p.estado==="Pendiente").length,
      incompletos: perfiles.filter(p => p.estado==="Incompleto").length,
    };

    // Stats Tab 2 — agencia (todos los usuarios, no solo con acceso)
    const stats_agencia = {
      total:       perfiles.length,
      listos:      perfiles.filter(p => p.estado_agencia==="Lista para agencia").length,
      en_progreso: perfiles.filter(p => p.estado_agencia==="En progreso").length,
      en_revision: perfiles.filter(p => p.estado_agencia==="En revisión").length,
      incompletos: perfiles.filter(p => p.estado_agencia==="Incompleto"||p.estado_agencia==="Sin inicio").length,
    };

    return NextResponse.json({ perfiles: filtrados, stats_evaluacion, stats_agencia });

  } catch (err) {
    console.error("[GET /api/admin/perfiles]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}