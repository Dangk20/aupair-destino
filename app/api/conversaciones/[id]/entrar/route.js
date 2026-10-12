// app/api/conversaciones/[id]/entrar/route.js
//
// POST  el admin entra a la conversación de una agencia con una candidata.
//       Queda en el hilo, visible para todos (R5). Idempotente.
import { NextResponse } from "next/server";
import { requiereSesion } from "@/lib/session-aupair";
import { acceso, entrar } from "@/lib/conversaciones-aupair";

export async function POST(req, { params }) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  const actor = { id: Number(guard.session.id), rol: guard.session.rol };
  try {
    const { id } = await params;
    const a = await acceso(actor, id);
    if (!a) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    const r = await entrar(actor, a.conv);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST conversacion/entrar]", err);
    return NextResponse.json({ error: "No se pudo entrar a la conversación." }, { status: 500 });
  }
}
