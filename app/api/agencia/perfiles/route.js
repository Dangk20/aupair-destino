// app/api/agencia/perfiles/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

const CAMPOS_EVAL = [
  "cedula","telefono","fecha_nacimiento","ciudad","pais",
  "nivel_ingles","licencia_conduccion","curso_primeros_auxilios",
  "situacion_actual","exp_ninos_externos","horas_exp_ninos",
  "visa_negada","entiende_intercambio_cultural","consciente_riesgo_familiar",
  "enfermedad_medicamentos","depresion_panico",
];

const SECCIONES_AGENCIA = [
  { campos:["estatura","peso","nacionalidad","tiene_pasaporte"] },
  { campos:["exp_ninos_externos","horas_exp_ninos","horas_childcare"] },
  { campos:["situacion_actual","carrera_graduada"] },
  { campos:["licencia_conduccion","tipo_licencia"] },
  { campos:["bio","hobbies"] },
  { campos:["por_que_au_pair"] },
  { campos:["enfermedad_medicamentos","dieta_especial"] },
  { campos:["referencia_1_nombre","referencia_1_email"] },
  { campos:["foto_url"] },
  { campos:["estado_agencia"] },
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

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "agencia") return unauthorized();

  try {
    const [rows] = await dbAupair.query(`
      SELECT
        u.id, u.nombre, u.apellido, u.email, u.foto_url,
        u.ciudad, u.pais, u.fecha_nacimiento, u.nivel_ingles,
        u.estado_agencia, u.perfil_completo,
        u.score_dap, u.calificacion_dap, u.nota_dap,
        u.cedula, u.telefono, u.licencia_conduccion, u.curso_primeros_auxilios,
        u.situacion_actual, u.exp_ninos_externos, u.horas_exp_ninos, u.horas_childcare,
        u.visa_negada, u.entiende_intercambio_cultural, u.consciente_riesgo_familiar,
        u.enfermedad_medicamentos, u.depresion_panico, u.carrera_graduada,
        u.estatura, u.peso, u.nacionalidad, u.tiene_pasaporte,
        u.tipo_licencia, u.bio, u.hobbies, u.por_que_au_pair, u.dieta_especial,
        u.referencia_1_nombre, u.referencia_1_email, u.referencia_1_telefono,
        u.referencia_2_nombre, u.referencia_2_email,
        u.created_at,
        TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()) as edad,
        ae.id as eval_id,
        ae.evaluacion as eval_agencia,
        ae.nota as nota_agencia,
        ae.plan, ae.cuotas_pagadas, ae.pago_confirmado,
        ae.updated_at as eval_updated
      FROM usuarios u
      LEFT JOIN agencia_evaluaciones ae ON ae.candidata_id = u.id AND ae.agencia_id = ?
      WHERE u.perfil_completo = 1 AND u.rol NOT IN ('admin','asociada','agencia')
      ORDER BY u.created_at DESC
    `, [session.id]);

    const candidatas = rows.map(r => {
      delete r.password;
      return {
        ...r,
        progreso_eval:    calcProgresoEval(r),
        progreso_agencia: calcProgresoAgencia(r),
      };
    });

    const total              = candidatas.length;
    const califican          = candidatas.filter(c=>c.calificacion_dap==="califica").length;
    const requierenRevision  = candidatas.filter(c=>c.calificacion_dap==="requiere_revision").length;
    const noCalifican        = candidatas.filter(c=>c.calificacion_dap==="no_califica").length;
    const perfilCompleto     = candidatas.filter(c=>c.progreso_agencia>=80).length;

    return NextResponse.json({
      ok: true,
      candidatas,
      stats: { total, califican, requierenRevision, noCalifican, perfilCompleto },
    });
  } catch (err) {
    console.error("[GET /api/agencia/perfiles]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}