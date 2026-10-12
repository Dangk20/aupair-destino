// app/api/conversaciones/route.js
//
// GET                    la bandeja de quien pide (candidata, agencia o admin)
// GET ?candidata_id=X    las conversaciones de una candidata, para la vista
//                        rápida, con las que aún se pueden iniciar (id null)
// POST { candidata_id }  inicia la conversación de quien pide: la agencia, la
//                        suya; el admin y la candidata, la del equipo
//
// Quién puede qué vive en lib/conversaciones-aupair.js. Lo ajeno → 404.
import { NextResponse } from "next/server";
import { requiereSesion } from "@/lib/session-aupair";
import { bandeja, deCandidata, iniciar } from "@/lib/conversaciones-aupair";

const actorDe = (s) => ({ id: Number(s.id), rol: s.rol });

export async function GET(req) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  const actor = actorDe(guard.session);
  const candidataId = new URL(req.url).searchParams.get("candidata_id");
  try {
    if (candidataId) {
      const lista = await deCandidata(actor, candidataId);
      if (!lista) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
      return NextResponse.json({ conversaciones: lista });
    }
    return NextResponse.json({ conversaciones: await bandeja(actor) });
  } catch (err) {
    console.error("[GET /api/conversaciones]", err);
    return NextResponse.json({ error: "No se pudieron cargar las conversaciones." }, { status: 500 });
  }
}

export async function POST(req) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  try {
    const { candidata_id } = await req.json().catch(() => ({}));
    const conv = await iniciar(actorDe(guard.session), candidata_id);
    if (!conv) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json({ ok: true, id: conv.id });
  } catch (err) {
    console.error("[POST /api/conversaciones]", err);
    return NextResponse.json({ error: "No se pudo iniciar la conversación." }, { status: 500 });
  }
}
