// app/api/admin/agenda/route.js — La disponibilidad del equipo
// (change agenda-rango-bloques). Toda la lógica vive en lib/agenda-aupair.js.
//
//   GET    ?mes=YYYY-MM      franjas del mes con sus cupos y reservas, el equipo,
//                            el horario semanal de cada uno y los días ajustados
//   POST   { horario: { dueno_id?, duracion_min, plan, url_meet? } }
//            guarda el horario semanal (se repite sin fecha de fin)
//          { dia: { dueno_id?, fecha, rangos, duracion_min, url_meet? } }
//            ajusta UN día (deja de seguir el horario semanal)
//   PUT    ?id=              cambiar una franja sin reservas
//   DELETE ?id=              borrar una franja sin reservas
//   DELETE ?dia=&dueno_id=   el día vuelve al horario semanal
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { agendaDelMes, horarios, guardarHorario, configurarDia, restablecerDia, editarFranja, borrarFranja } from "@/lib/agenda-aupair";

/** Quién atiende: un admin activo (por omisión, quien la crea). */
async function duenoValido(id, session) {
  const dueno = Number(id) || Number(session.id);
  const [[u]] = await dbAupair.query("SELECT id FROM usuarios WHERE id = ? AND rol = 'admin' AND cuenta_activa = 1", [dueno]);
  return u ? u.id : null;
}

const datos = (b) => ({
  fecha: b.fecha, horaInicio: b.hora_inicio, horaFin: b.hora_fin, duracion: b.duracion_min,
  urlMeet: String(b.url_meet || "").trim(), notas: String(b.notas || "").trim(),
});

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const mes = new URL(req.url).searchParams.get("mes");
    const franjas = await agendaDelMes(mes);
    const [[equipo], hs, [exc]] = await Promise.all([
      dbAupair.query("SELECT id, CONCAT_WS(' ', nombre, apellido) AS nombre FROM usuarios WHERE rol = 'admin' AND cuenta_activa = 1 ORDER BY nombre"),
      horarios(),
      dbAupair.query("SELECT dueno_id, DATE_FORMAT(fecha,'%Y-%m-%d') AS fecha FROM agenda_excepciones WHERE DATE_FORMAT(fecha,'%Y-%m') = ?", [String(mes || "").slice(0, 7)]),
    ]);
    return NextResponse.json({ franjas, equipo, horarios: hs, excepciones: exc });
  } catch (err) {
    console.error("[GET /api/admin/agenda]", err);
    return NextResponse.json({ error: "No se pudo cargar la agenda." }, { status: 500 });
  }
}

export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const b = await req.json().catch(() => ({}));
    const x = b.horario || b.dia;
    if (!x) return NextResponse.json({ error: "Falta el horario o el día." }, { status: 400 });
    const duenoId = await duenoValido(x.dueno_id, guard.session);
    if (!duenoId) return NextResponse.json({ error: "Quien atiende debe ser un admin activo." }, { status: 400 });
    const urlMeet = String(x.url_meet || "").trim();
    const r = b.horario
      ? await guardarHorario({ duenoId, duracion: x.duracion_min, plan: x.plan, urlMeet })
      : await configurarDia({ duenoId, fecha: x.fecha, rangos: x.rangos, duracion: x.duracion_min, urlMeet, creadoPor: guard.session.id });
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  } catch (err) {
    console.error("[POST /api/admin/agenda]", err);
    return NextResponse.json({ error: "No se pudo crear la disponibilidad." }, { status: 500 });
  }
}

export async function PUT(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });
    const b = await req.json().catch(() => ({}));
    const duenoId = await duenoValido(b.dueno_id, guard.session);
    if (!duenoId) return NextResponse.json({ error: "Quien atiende debe ser un admin activo." }, { status: 400 });
    const r = await editarFranja(id, { ...datos(b), duenoId });
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  } catch (err) {
    console.error("[PUT /api/admin/agenda]", err);
    return NextResponse.json({ error: "No se pudo cambiar la disponibilidad." }, { status: 500 });
  }
}

export async function DELETE(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const q = new URL(req.url).searchParams;
    if (q.get("dia")) {
      const duenoId = await duenoValido(q.get("dueno_id"), guard.session);
      if (!duenoId) return NextResponse.json({ error: "Quien atiende debe ser un admin activo." }, { status: 400 });
      return NextResponse.json(await restablecerDia({ duenoId, fecha: q.get("dia") }));
    }
    const id = Number(q.get("id"));
    if (!id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });
    const r = await borrarFranja(id);
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  } catch (err) {
    console.error("[DELETE /api/admin/agenda]", err);
    return NextResponse.json({ error: "No se pudo borrar la disponibilidad." }, { status: 500 });
  }
}
