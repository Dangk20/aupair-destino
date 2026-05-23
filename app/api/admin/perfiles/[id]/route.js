// app/api/admin/perfiles/[id]/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

/* ── GET: obtener perfil completo de un usuario ── */
export async function GET(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { id } = await params;
    const [[u]] = await dbAupair.query(`
      SELECT
        id, nombre, apellido, email, foto_url,
        ciudad, pais, tiene_acceso, perfil_habilitado,
        created_at, updated_at,
        cedula, telefono, fecha_nacimiento, bio, pais_destino,
        conoce_requisitos_26, conoce_requisitos_18_20,
        curso_primeros_auxilios, nivel_ingles,
        licencia_conduccion, habilidad_conduccion,
        situacion_actual, detalle_otra_actividad,
        detalle_estudios, carrera_graduada,
        detalle_trabajo, detalle_sin_ocupacion,
        enfermedad_medicamentos, detalle_enfermedad_med,
        enfermedad_grave, detalle_enfermedad_grave,
        depresion_panico, trastorno_alimenticio,
        autolesiones, abuso_sustancias, detalle_salud_mental,
        isotretinoina, condiciones_fisicas,
        alergia_medicamentos, detalle_alergias,
        dosis_covid, vacuna_covid,
        exp_ninos_externos, horas_exp_ninos,
        visa_negada, detalle_visa_negada, visa_cancelada,
        familiar_residencia_usa, detalle_familiar_residencia,
        familiar_visa_estudio_usa, detalle_familiar_visa_estudio,
        overstay_otro_pais,
        entiende_intercambio_cultural, consciente_riesgo_familiar,
        participo_programa_ap, finalizo_programa_ap,
        puede_proveer_certificados
      FROM usuarios WHERE id = ?
    `, [id]);

    if (!u) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ perfil: u });
  } catch (err) {
    console.error("[GET /api/admin/perfiles/[id]]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── PUT: actualizar perfil — guarda en usuarios ── */
export async function PUT(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();

    // Campos del perfil que el admin puede editar (todos en tabla usuarios)
    const CAMPOS_PERMITIDOS = [
      "cedula", "telefono", "fecha_nacimiento", "ciudad", "pais",
      "bio", "pais_destino",
      "conoce_requisitos_26", "conoce_requisitos_18_20",
      "curso_primeros_auxilios", "nivel_ingles",
      "licencia_conduccion", "habilidad_conduccion",
      "situacion_actual", "detalle_otra_actividad",
      "detalle_estudios", "carrera_graduada",
      "detalle_trabajo", "detalle_sin_ocupacion",
      "enfermedad_medicamentos", "detalle_enfermedad_med",
      "enfermedad_grave", "detalle_enfermedad_grave",
      "depresion_panico", "trastorno_alimenticio",
      "autolesiones", "abuso_sustancias", "detalle_salud_mental",
      "isotretinoina", "condiciones_fisicas",
      "alergia_medicamentos", "detalle_alergias",
      "dosis_covid", "vacuna_covid",
      "exp_ninos_externos", "horas_exp_ninos",
      "visa_negada", "detalle_visa_negada", "visa_cancelada",
      "familiar_residencia_usa", "detalle_familiar_residencia",
      "familiar_visa_estudio_usa", "detalle_familiar_visa_estudio",
      "overstay_otro_pais",
      "entiende_intercambio_cultural", "consciente_riesgo_familiar",
      "participo_programa_ap", "finalizo_programa_ap",
      "puede_proveer_certificados",
    ];

    const sets   = [];
    const values = [];

    for (const campo of CAMPOS_PERMITIDOS) {
      if (body[campo] !== undefined) {
        sets.push(`${campo} = ?`);
        values.push(body[campo] === "" ? null : body[campo]);
      }
    }

    if (sets.length === 0)
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });

    values.push(id);
    await dbAupair.query(
      `UPDATE usuarios SET ${sets.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/admin/perfiles/[id]]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}