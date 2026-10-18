// POST /api/admin/agenda/reservas — El equipo agenda a una candidata en un cupo
// libre desde su propio panel (Daniel, 17 oct; change agenda-rango-bloques).
//   { cupo_id, usuario_id, notas? }
// Mismas reglas que cuando reserva ella (lib/agenda-aupair.js · reservar):
// atómico, un cupo una reunión, una reunión activa por candidata. Ella recibe
// la confirmación por correo.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { reservar } from "@/lib/agenda-aupair";
import { avisarCandidataReunionAgendada } from "@/lib/notificaciones-aupair";

const fechaLarga = (f) => new Date(`${f}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const { cupo_id, usuario_id, notas } = await req.json().catch(() => ({}));
    const [[u]] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE id = ? AND rol IN ('usuaria','usuario') AND cuenta_activa = 1",
      [Number(usuario_id) || 0]
    );
    if (!u) return NextResponse.json({ error: "Elige una candidata activa." }, { status: 400 });
    if (!Number(cupo_id)) return NextResponse.json({ error: "Elige el horario." }, { status: 400 });

    const r = await reservar(u.id, Number(cupo_id), notas);
    if (!r.ok) return NextResponse.json(r, { status: 409 });
    avisarCandidataReunionAgendada({ usuarioId: u.id, fecha: fechaLarga(r.fecha), horaInicio: r.hora_inicio, horaFin: r.hora_fin, urlMeet: r.url_meet });
    return NextResponse.json({ ok: true, reunion_id: r.reunionId });
  } catch (err) {
    console.error("[POST /api/admin/agenda/reservas]", err);
    return NextResponse.json({ error: "No se pudo agendar." }, { status: 500 });
  }
}
