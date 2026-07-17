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
        u.licencia_conduccion, u.curso_primeros_auxilios,
        u.cedula, u.telefono, u.enfermedad_medicamentos, u.depresion_panico,
        u.estatura, u.peso, u.nacionalidad, u.tiene_pasaporte,
        u.tipo_licencia, u.bio, u.hobbies, u.por_que_au_pair, u.dieta_especial,
        u.referencia_1_nombre, u.referencia_1_email, u.referencia_1_telefono,
        u.referencia_2_nombre, u.referencia_2_email,
        TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()) as edad,
        ae.evaluacion as eval_agencia, ae.nota as nota_agencia,
        ae.plan, ae.cuotas_pagadas, ae.pago_confirmado,
        ae.updated_at as eval_updated
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

export async function PUT(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "agencia") return unauthorized();
  const { id } = await params;

  try {
    const body = await req.json();
    const { accion } = body;

    // Verificar candidata
    const [[cand]] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE id=? AND perfil_completo=1 AND rol NOT IN ('admin','asociada','agencia')",
      [id]
    );
    if (!cand) return NextResponse.json({ error:"Candidata no encontrada" }, { status:404 });

    // ── Evaluar ──────────────────────────────────────────────
    if (accion === "evaluar") {
      const { evaluacion, nota } = body;
      await upsertEval(session.id, id, { evaluacion, nota: nota||null });
      const estadoMap = {
        califica:          "En evaluación",
        requiere_revision: "En ajustes",
        no_califica:       "No califica",
      };
      if (estadoMap[evaluacion]) {
        await dbAupair.query("UPDATE usuarios SET estado_agencia=? WHERE id=?", [estadoMap[evaluacion], id]);
      }
      return NextResponse.json({ ok:true, msg:"Evaluación guardada" });
    }

    // ── Seleccionar plan ─────────────────────────────────────
    if (accion === "plan") {
      const { plan } = body;
      await upsertEval(session.id, id, { plan });
      await dbAupair.query("UPDATE usuarios SET estado_agencia='Pago pendiente' WHERE id=?", [id]);
      return NextResponse.json({ ok:true, msg:"Plan seleccionado" });
    }

    // ── Confirmar pago ───────────────────────────────────────
    if (accion === "confirmar_pago") {
      const [[ae]] = await dbAupair.query(
        "SELECT plan, cuotas_pagadas FROM agencia_evaluaciones WHERE agencia_id=? AND candidata_id=?",
        [session.id, id]
      );
      const totalCuotas  = ae?.plan === "2_cuotas" ? 2 : 4;
      const nuevasCuotas = Math.min((ae?.cuotas_pagadas||0) + 1, totalCuotas);
      const pagoCompleto = nuevasCuotas >= totalCuotas ? 1 : 0;
      await upsertEval(session.id, id, { cuotas_pagadas: nuevasCuotas, pago_confirmado: pagoCompleto });
      if (pagoCompleto) {
        await dbAupair.query("UPDATE usuarios SET estado_agencia='Perfil en activación' WHERE id=?", [id]);
      }
      return NextResponse.json({ ok:true, msg:"Pago confirmado", pago_completo: pagoCompleto });
    }

    // ── Guardar nota ─────────────────────────────────────────
    if (accion === "nota") {
      const { nota } = body;
      await upsertEval(session.id, id, { nota: nota||null });
      return NextResponse.json({ ok:true, msg:"Nota guardada" });
    }

    // ── Actualizar perfil agencia ─────────────────────────────
    if (accion === "actualizar_perfil") {
      const {
        bio, hobbies, por_que_au_pair,
        estatura, peso, nacionalidad, tiene_pasaporte,
        tipo_licencia, dieta_especial,
      } = body;

      await dbAupair.query(`
        UPDATE usuarios SET
          bio              = COALESCE(?, bio),
          hobbies          = COALESCE(?, hobbies),
          por_que_au_pair  = COALESCE(?, por_que_au_pair),
          estatura         = COALESCE(?, estatura),
          peso             = COALESCE(?, peso),
          nacionalidad     = COALESCE(?, nacionalidad),
          tiene_pasaporte  = ?,
          tipo_licencia    = COALESCE(?, tipo_licencia),
          dieta_especial   = COALESCE(?, dieta_especial)
        WHERE id = ?
      `, [
        bio||null, hobbies||null, por_que_au_pair||null,
        estatura||null, peso||null, nacionalidad||null,
        tiene_pasaporte ? 1 : 0,
        tipo_licencia||null, dieta_especial||null,
        id,
      ]);

      return NextResponse.json({ ok:true, msg:"Perfil actualizado" });
    }

    return NextResponse.json({ error:"Acción no reconocida" }, { status:400 });

  } catch(err) {
    console.error("[PUT /api/agencia/perfiles/[id]]", err);
    return NextResponse.json({ error:err.message }, { status:500 });
  }
}