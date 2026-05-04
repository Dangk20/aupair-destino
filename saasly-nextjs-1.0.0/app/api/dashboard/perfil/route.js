import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const [rows] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE id = ?", [session.id]
    );
    if (rows.length === 0) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    return NextResponse.json({ perfil: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al obtener el perfil." }, { status: 500 });
  }
}

export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const b = await req.json();

    await dbAupair.query(`
      UPDATE usuarios SET
        foto_url=?, cedula=?, telefono=?, fecha_nacimiento=?, ciudad=?, pais=?,
        conoce_requisitos_26=?, conoce_requisitos_18_20=?,
        curso_primeros_auxilios=?, nivel_ingles=?, licencia_conduccion=?, habilidad_conduccion=?,
        situacion_actual=?, detalle_otra_actividad=?, detalle_estudios=?,
        carrera_graduada=?, detalle_trabajo=?, detalle_sin_ocupacion=?,
        enfermedad_medicamentos=?, detalle_enfermedad_med=?,
        enfermedad_grave=?, detalle_enfermedad_grave=?,
        depresion_panico=?, trastorno_alimenticio=?, autolesiones=?,
        abuso_sustancias=?, detalle_salud_mental=?, isotretinoina=?,
        condiciones_fisicas=?, alergia_medicamentos=?, detalle_alergias=?,
        dosis_covid=?, vacuna_covid=?,
        exp_ninos_externos=?, horas_exp_ninos=?,
        visa_negada=?, detalle_visa_negada=?, visa_cancelada=?,
        familiar_residencia_usa=?, detalle_familiar_residencia=?,
        familiar_visa_estudio_usa=?, detalle_familiar_visa_estudio=?,
        overstay_otro_pais=?,
        entiende_intercambio_cultural=?, consciente_riesgo_familiar=?,
        participo_programa_ap=?, finalizo_programa_ap=?, puede_proveer_certificados=?,
        perfil_completo=?
      WHERE id=?`,
      [
        b.foto_url||null, b.cedula||null, b.telefono||null,
        b.fecha_nacimiento||null, b.ciudad||null, b.pais||null,
        b.conoce_requisitos_26||null, b.conoce_requisitos_18_20||null,
        b.curso_primeros_auxilios||null, b.nivel_ingles||null,
        b.licencia_conduccion||null, b.habilidad_conduccion||null,
        b.situacion_actual||null, b.detalle_otra_actividad||null,
        b.detalle_estudios||null, b.carrera_graduada||null,
        b.detalle_trabajo||null, b.detalle_sin_ocupacion||null,
        b.enfermedad_medicamentos||null, b.detalle_enfermedad_med||null,
        b.enfermedad_grave||null, b.detalle_enfermedad_grave||null,
        b.depresion_panico||null, b.trastorno_alimenticio||null,
        b.autolesiones||null, b.abuso_sustancias||null,
        b.detalle_salud_mental||null, b.isotretinoina||null,
        b.condiciones_fisicas||null, b.alergia_medicamentos||null,
        b.detalle_alergias||null, b.dosis_covid||null, b.vacuna_covid||null,
        b.exp_ninos_externos||null, b.horas_exp_ninos||null,
        b.visa_negada||null, b.detalle_visa_negada||null,
        b.visa_cancelada||null, b.familiar_residencia_usa||null,
        b.detalle_familiar_residencia||null, b.familiar_visa_estudio_usa||null,
        b.detalle_familiar_visa_estudio||null, b.overstay_otro_pais||null,
        b.entiende_intercambio_cultural||null, b.consciente_riesgo_familiar||null,
        b.participo_programa_ap||null, b.finalizo_programa_ap||null,
        b.puede_proveer_certificados||null,
        !!(b.cedula && b.fecha_nacimiento && b.nivel_ingles && b.situacion_actual) ? 1 : 0,
        session.id,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al guardar." }, { status: 500 });
  }
}