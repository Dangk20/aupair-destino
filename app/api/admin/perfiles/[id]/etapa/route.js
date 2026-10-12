// app/api/admin/perfiles/[id]/etapa/route.js
// El admin mueve la etapa de la candidata con su agencia. La regla y el
// historial los pone lib/historial-aupair.js · moverEtapa().
import { NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/session-aupair";
import { moverEtapa } from "@/lib/historial-aupair";

export async function PUT(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    const { etapa } = await req.json().catch(() => ({}));
    const r = await moverEtapa({ candidataId: Number(id), etapa, actor: { id: guard.session.id, rol: "admin" } });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status || 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT etapa]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
