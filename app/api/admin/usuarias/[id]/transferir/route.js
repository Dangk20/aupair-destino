// app/api/admin/usuarias/[id]/transferir/route.js
// R11 (change `transferir-cupo`): transferir el cupo pagado de una candidata a
// una persona nueva. La lógica es de lib/transferencias-aupair.js.
//
//   GET     la invitación pendiente, si hay
//   POST    { email } invita o reenvía (devuelve el link para copiarlo)
//   DELETE  cancela la pendiente
import { NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/session-aupair";
import { invitar, cancelar, pendienteDe } from "@/lib/transferencias-aupair";

const responder = (r) => r.ok
  ? NextResponse.json(r)
  : NextResponse.json({ error: r.error }, { status: r.status || 400 });

export async function GET(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    return NextResponse.json({ pendiente: await pendienteDe(Number(id)) });
  } catch (err) {
    console.error("[GET transferir]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    const { email } = await req.json().catch(() => ({}));
    return responder(await invitar({ origenId: Number(id), email, actor: { id: guard.session.id, rol: "admin" } }));
  } catch (err) {
    console.error("[POST transferir]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    return responder(await cancelar({ origenId: Number(id), actor: { id: guard.session.id, rol: "admin" } }));
  } catch (err) {
    console.error("[DELETE transferir]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
