// POST /api/admin/agenda/reservas/[id]/cancelar — El equipo cancela la reserva
// de una candidata (change agenda-rango-bloques). El cupo queda libre y la
// candidata recibe un correo. `[id]` es el id de la reunión.
import { NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/session-aupair";
import { cancelar } from "@/lib/agenda-aupair";
import { avisarCandidataReunionCancelada } from "@/lib/notificaciones-aupair";

const fechaLarga = (f) => new Date(`${f}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export async function POST(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    const r = await cancelar(Number(id), { porEquipo: true });
    if (!r.ok) return NextResponse.json(r, { status: 400 });
    avisarCandidataReunionCancelada({ usuarioId: r.usuarioId, fecha: fechaLarga(r.fecha), horaInicio: r.hora_inicio, horaFin: r.hora_fin });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/agenda/reservas/[id]/cancelar]", err);
    return NextResponse.json({ error: "No se pudo cancelar la reserva." }, { status: 500 });
  }
}
