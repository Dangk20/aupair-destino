// ════════════════════════════════════════════════════════════════════════
// app/api/admin/ventas/[id]/anular/route.js
// El admin anula una venta. Si estaba confirmada, anularla revierte todo su
// efecto: libera el cupo del código, anula la comisión y apaga los permisos.
// Toda la lógica vive en lib/ventas-aupair.js (anularVenta).
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import { anularVenta } from "@/lib/ventas-aupair";

export async function POST(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { id } = await params;
  const ventaId = Number(id);
  if (!ventaId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  try {
    const result = await anularVenta(ventaId);
    if (!result.ok) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[admin/ventas anular]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
