// app/api/dashboard/reuniones/route.js — Las reuniones de la candidata
// (change agenda-rango-bloques). Reservar y cancelar van por
// lib/agenda-aupair.js, que es atómico: dos reservas del mismo cupo dan una.
//
//   GET                         sus reuniones
//   POST   { disponibilidad_id, notas_cliente? }   reservar un cupo
//   DELETE ?id=                 cancelar una reunión suya, confirmada y futura
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requierePermiso } from "@/lib/session-aupair";
import { reunionesDe, reservar, cancelar } from "@/lib/agenda-aupair";
import { avisarReunionAgendada, avisarReunionCancelada, avisarCandidataReunionAgendada } from "@/lib/notificaciones-aupair";

const fechaLarga = (f) => new Date(`${f}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

async function candidata(id) {
  const [[u]] = await dbAupair.query("SELECT id, nombre, apellido, email FROM usuarios WHERE id = ?", [id]);
  return u;
}

export async function GET(req) {
  const guard = await requierePermiso(req, "reuniones");
  if (guard.error) return guard.error;
  try {
    return NextResponse.json({ reuniones: await reunionesDe(guard.session.id) });
  } catch (err) {
    console.error("[GET /api/dashboard/reuniones]", err);
    return NextResponse.json({ reuniones: [], error: "No se pudieron cargar tus reuniones." }, { status: 500 });
  }
}

export async function POST(req) {
  const guard = await requierePermiso(req, "reuniones");
  if (guard.error) return guard.error;
  try {
    const { disponibilidad_id, notas_cliente } = await req.json().catch(() => ({}));
    if (!Number(disponibilidad_id)) return NextResponse.json({ error: "Elige un horario." }, { status: 400 });

    const r = await reservar(guard.session.id, Number(disponibilidad_id), notas_cliente);
    if (!r.ok) return NextResponse.json(r, { status: 409 });

    const u = await candidata(guard.session.id);
    const fecha = fechaLarga(r.fecha);
    avisarReunionAgendada({ candidata: u, fecha, horaInicio: r.hora_inicio, horaFin: r.hora_fin, asesora: "Equipo Destino Au Pair", notas: notas_cliente });
    avisarCandidataReunionAgendada({ usuarioId: u.id, fecha, horaInicio: r.hora_inicio, horaFin: r.hora_fin, urlMeet: r.url_meet });
    return NextResponse.json({ ok: true, reunion_id: r.reunionId });
  } catch (err) {
    console.error("[POST /api/dashboard/reuniones]", err);
    return NextResponse.json({ error: "No se pudo agendar la reunión." }, { status: 500 });
  }
}

export async function DELETE(req) {
  const guard = await requierePermiso(req, "reuniones");
  if (guard.error) return guard.error;
  try {
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
    const r = await cancelar(id, { usuarioId: guard.session.id });
    if (!r.ok) return NextResponse.json(r, { status: 400 });
    const u = await candidata(guard.session.id);
    avisarReunionCancelada({ candidata: u, fecha: fechaLarga(r.fecha), horaInicio: r.hora_inicio, horaFin: r.hora_fin, asesora: "Equipo Destino Au Pair" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/dashboard/reuniones]", err);
    return NextResponse.json({ error: "No se pudo cancelar la reunión." }, { status: 500 });
  }
}
