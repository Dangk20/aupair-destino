// app/api/agencia/candidatas/[id]/etapa/route.js
// La agencia mueve a su candidata entre las etapas de la agencia. La regla y
// el historial son de lib/historial-aupair.js · moverEtapa(), la misma que usa
// el admin; la agencia queda como autora del cambio.
import { NextResponse } from "next/server";
import { requiereRol } from "@/lib/session-aupair";
import { candidataDeAgencia } from "@/lib/agencia-aupair";
import { moverEtapa } from "@/lib/historial-aupair";

export async function PUT(req, { params }) {
  const guard = requiereRol(req, "agencia");
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    if (!(await candidataDeAgencia(guard.session.id, id))) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }
    const { etapa } = await req.json().catch(() => ({}));
    const r = await moverEtapa({
      candidataId: Number(id), etapa, agenciaId: guard.session.id,
      actor: { id: guard.session.id, rol: "agencia" },
    });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status || 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT agencia etapa]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
