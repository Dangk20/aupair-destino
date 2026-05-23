// app/api/admin/perfiles/[id]/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { id } = await params;
    const [[row]] = await dbAupair.query(`
      SELECT u.*, p.*,
        p.id AS perfil_id,
        p.ciudad AS p_ciudad, p.pais AS p_pais,
        p.estado AS estado_admin
      FROM usuarios u
      LEFT JOIN perfiles p ON p.usuario_id = u.id
      WHERE u.id = ?
    `, [id]);

    if (!row) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ perfil: row });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();

    // Campos que el admin puede actualizar en la tabla perfiles
    const CAMPOS_PERFIL = [
      "cedula","telefono","fecha_nacimiento","ciudad","pais","bio","pais_destino",
      "conoce_requisitos_26","conoce_requisitos_18_20","curso_primeros_auxilios",
      "nivel_ingles","licencia_conduccion","habilidad_conduccion",
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
      "overstay_otro_pais","entiende_intercambio_cultural",
      "consciente_riesgo_familiar","participo_programa_ap",
      "finalizo_programa_ap","puede_proveer_certificados",
      "estado","estado_agencia","progreso_agencia","horas_childcare",
    ];

    const sets   = [];
    const values = [];
    for (const campo of CAMPOS_PERFIL) {
      if (body[campo] !== undefined) {
        sets.push(`${campo} = ?`);
        values.push(body[campo] === "" ? null : body[campo]);
      }
    }

    if (sets.length === 0)
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });

    // Upsert: insert or update
    values.push(id);
    const [[existe]] = await dbAupair.query(
      "SELECT id FROM perfiles WHERE usuario_id = ?", [id]
    );

    if (existe) {
      await dbAupair.query(
        `UPDATE perfiles SET ${sets.join(", ")} WHERE usuario_id = ?`,
        values
      );
    } else {
      // Crear registro de perfil con los campos enviados
      const cols = CAMPOS_PERFIL.filter(c => body[c] !== undefined);
      const vals = cols.map(c => body[c] === "" ? null : body[c]);
      await dbAupair.query(
        `INSERT INTO perfiles (usuario_id, ${cols.join(", ")}) VALUES (?, ${cols.map(()=>"?").join(", ")})`,
        [id, ...vals]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/admin/perfiles/[id]]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}