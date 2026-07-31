// ════════════════════════════════════════════════════════════════════════
// app/api/admin/confirmar-pago/route.js
// Confirma el pago de una candidata. Envoltorio delgado sobre
// lib/ventas-aupair.js: resuelve o crea su venta y la confirma, con lo cual
// se encienden los permisos, se consume el cupo del código y se genera la
// comisión de la asociada.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import { confirmarAccesoUsuario } from "@/lib/ventas-aupair";

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { usuarioId, monto } = await req.json();
    if (!usuarioId) return NextResponse.json({ error: "usuarioId requerido" }, { status: 400 });

    const result = await confirmarAccesoUsuario(Number(usuarioId), { monto });
    if (!result.ok) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[admin/confirmar-pago]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
