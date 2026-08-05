// app/api/agencia/perfiles/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereRol } from "@/lib/session-aupair";
import { progresoParte } from "@/lib/campos-perfil";
import { perfilPublicable } from "@/lib/perfil";

// El avance sale de lib/campos-perfil.js, como en la ficha y en el listado del
// admin. Este archivo llevaba una cuarta copia del criterio, con la misma regla
// de "media sección llena cuenta como completa" que hacía que la agencia viera
// un porcentaje distinto del que veía la candidata sobre el mismo perfil.
const calcProgresoEval    = (u) => (u ? progresoParte(1, u) : 0);
const calcProgresoAgencia = (u) => (u ? progresoParte(2, u) : 0);

export async function GET(req) {
  const guard = requiereRol(req, "agencia");
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    // `u.*` en vez de una lista blanca de columnas: el avance se calcula sobre
    // los campos declarados en campos-perfil.js, y una lista blanca dejaría
    // fuera la mitad de ellos, con lo que toda candidata parecería incompleta.
    // Lo que no debe salir lo quita `perfilPublicable()`, no la consulta.
    const [rows] = await dbAupair.query(`
      SELECT
        u.*,
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

    const candidatas = rows.map(fila => {
      const r = perfilPublicable(fila, "revision");
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