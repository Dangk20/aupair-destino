// ════════════════════════════════════════════════════════════════════════
// app/api/admin/ventas/[id]/confirmar/route.js
//
// POST: el admin confirma una venta pendiente. Dispara:
//   - venta -> confirmado
//   - permisos de la candidata (PERMISOS_AL_PAGAR)
//   - comisión al asociado si el código la define
// Toda la lógica vive en lib/ventas-aupair.js (confirmarVenta).
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import { confirmarVenta } from "@/lib/ventas-aupair";

export async function POST(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { id } = await params;
  const ventaId = Number(id);
  if (!ventaId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  try {
    const result = await confirmarVenta(ventaId);
    if (!result.ok) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[admin/ventas confirmar]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
