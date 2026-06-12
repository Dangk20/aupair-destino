// app/api/agencia/perfiles/[id]/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

async function upsertEval(agencia_id, candidata_id, campos) {
  const [[existing]] = await dbAupair.query(
    "SELECT id FROM agencia_evaluaciones WHERE agencia_id=? AND candidata_id=?",
    [agencia_id, candidata_id]
  );
  if (existing) {
    const sets = Object.keys(campos).map(k=>`${k}=?`).join(",");
    await dbAupair.query(
      `UPDATE agencia_evaluaciones SET ${sets} WHERE agencia_id=? AND candidata_id=?`,
      [...Object.values(campos), agencia_id, candidata_id]
    );
  } else {
    await dbAupair.query(
      `INSERT INTO agencia_evaluaciones (agencia_id, candidata_id, ${Object.keys(campos).join(",")}) VALUES (?,?,${Object.keys(campos).map(()=>"?").join(",")})`,
      [agencia_id, candidata_id, ...Object.values(campos)]
    );
  }
}

// GET — perfil completo de una candidata
export async function GET(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "agencia") return unauthorized();
  const { id } = await params;

  try {
    const [[candidata]] = await dbAupair.query(`
      SELECT
        u.id, u.nombre, u.apellido, u.email, u.foto_url,
        u.ciudad, u.pais, u.fecha_nacimiento, u.nivel_ingles,
        u.estado_agencia, u.score_dap, u.calificacion_dap, u.nota_dap,
        u.exp_ninos_externos, u.horas_exp_ninos, u.horas_childcare,
        u.situacion_actual, u.carrera_graduada, u.detalle_estudios,
        u.visa_negada, u.familiar_residencia_usa,
        u.entiende_intercambio_cultural, u.consciente_riesgo_familiar,
        u.participo_programa_ap, u.finalizo_programa_ap,
        TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()) as edad,
        ae.evaluacion as eval_agencia, ae.nota as nota_agencia,
        ae.plan, ae.cuotas_pagadas, ae.pago_confirmado, ae.updated_at as eval_updated
      FROM usuarios u
      LEFT JOIN agencia_evaluaciones ae ON ae.candidata_id=u.id AND ae.agencia_id=?
      WHERE u.id=? AND u.perfil_completo=1 AND u.rol NOT IN ('admin','asociada','agencia')
    `, [session.id, id]);

    if (!candidata) return NextResponse.json({ error:"Candidata no encontrada" }, { status:404 });
    return NextResponse.json({ ok:true, candidata });
  } catch(err) {
    return NextResponse.json({ error:err.message }, { status:500 });
  }
}

// PUT — evaluar, elegir plan, confirmar pago
export async function PUT(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "agencia") return unauthorized();
  const { id } = await params;

  try {
    const body = await req.json();
    const { accion } = body;

    // Verificar que la candidata existe y está aprobada
    const [[cand]] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE id=? AND perfil_completo=1 AND rol NOT IN ('admin','asociada','agencia')",
      [id]
    );
    if (!cand) return NextResponse.json({ error:"Candidata no encontrada" }, { status:404 });

    if (accion === "evaluar") {
      const { evaluacion, nota } = body;
      await upsertEval(session.id, id, { evaluacion, nota: nota||null });

      // Actualizar estado_agencia en usuarios
      const estadoMap = {
        califica: "En evaluación",
        requiere_revision: "En ajustes",
        no_califica: "No califica",
      };
      if (estadoMap[evaluacion]) {
        await dbAupair.query("UPDATE usuarios SET estado_agencia=? WHERE id=?", [estadoMap[evaluacion], id]);
      }
      return NextResponse.json({ ok:true, msg:"Evaluación guardada" });
    }

    if (accion === "plan") {
      const { plan } = body;
      await upsertEval(session.id, id, { plan });
      await dbAupair.query("UPDATE usuarios SET estado_agencia='Pago pendiente' WHERE id=?", [id]);
      return NextResponse.json({ ok:true, msg:"Plan seleccionado" });
    }

    if (accion === "confirmar_pago") {
      const { cuotas_pagadas } = body;
      const [[ae]] = await dbAupair.query(
        "SELECT plan, cuotas_pagadas FROM agencia_evaluaciones WHERE agencia_id=? AND candidata_id=?",
        [session.id, id]
      );
      const totalCuotas = ae?.plan === "2_cuotas" ? 2 : 4;
      const nuevasCuotas = Math.min((ae?.cuotas_pagadas||0) + (cuotas_pagadas||1), totalCuotas);
      const pagoCompleto = nuevasCuotas >= totalCuotas ? 1 : 0;

      await upsertEval(session.id, id, { cuotas_pagadas: nuevasCuotas, pago_confirmado: pagoCompleto });

      if (pagoCompleto) {
        await dbAupair.query("UPDATE usuarios SET estado_agencia='Perfil en activación' WHERE id=?", [id]);
      }
      return NextResponse.json({ ok:true, msg:"Pago confirmado", pago_completo: pagoCompleto });
    }

    if (accion === "nota") {
      const { nota } = body;
      await upsertEval(session.id, id, { nota: nota||null });
      return NextResponse.json({ ok:true, msg:"Nota guardada" });
    }

    return NextResponse.json({ error:"Acción no reconocida" }, { status:400 });
  } catch(err) {
    console.error("[PUT /api/agencia/perfiles/[id]]", err);
    return NextResponse.json({ error:err.message }, { status:500 });
  }
}