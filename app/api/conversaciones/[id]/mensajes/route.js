// app/api/conversaciones/[id]/mensajes/route.js
//
// GET ?desde=<id>  los mensajes posteriores a `desde` (el sondeo pide sólo lo
//                  nuevo) y los marca como leídos para quien pide
// POST { contenido }
import { NextResponse } from "next/server";
import { requiereSesion } from "@/lib/session-aupair";
import { acceso, mensajes, escribir } from "@/lib/conversaciones-aupair";

const actorDe = (s) => ({ id: Number(s.id), rol: s.rol });
const noEncontrada = () => NextResponse.json({ error: "No encontrada" }, { status: 404 });

export async function GET(req, { params }) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  const actor = actorDe(guard.session);
  try {
    const { id } = await params;
    const a = await acceso(actor, id);
    if (!a) return noEncontrada();
    const desde = new URL(req.url).searchParams.get("desde");
    return NextResponse.json({ mensajes: await mensajes(actor, a.conv, desde), permisos: a.permisos });
  } catch (err) {
    console.error("[GET conversacion/mensajes]", err);
    return NextResponse.json({ error: "No se pudieron cargar los mensajes." }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  const actor = actorDe(guard.session);
  try {
    const { id } = await params;
    const a = await acceso(actor, id);
    if (!a) return noEncontrada();
    if (!a.permisos.escribir) {
      return NextResponse.json({
        error: a.permisos.entrar ? "Entra a la conversación para escribir." : "No puedes escribir en esta conversación.",
      }, { status: a.permisos.entrar ? 409 : 403 });
    }
    const { contenido } = await req.json().catch(() => ({}));
    const r = await escribir(actor, a.conv, contenido);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
    return NextResponse.json({ ok: true, id: r.id });
  } catch (err) {
    console.error("[POST conversacion/mensajes]", err);
    return NextResponse.json({ error: "No se pudo enviar el mensaje." }, { status: 500 });
  }
}
