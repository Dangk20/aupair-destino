// ════════════════════════════════════════════════════════════════════════
// app/api/admin/ventas/[id]/anular/route.js
// El admin anula una venta pendiente (la candidata no pagó / desistió).
// No toca permisos ni comisiones. Solo marca la venta como 'anulado'.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function POST(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { id } = await params;
  const ventaId = Number(id);
  if (!ventaId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  try {
    const [res] = await dbAupair.query(
      "UPDATE ventas SET estado = 'anulado' WHERE id = ? AND estado = 'pendiente'",
      [ventaId]
    );
    if (res.affectedRows === 0)
      return NextResponse.json({ error: "La venta no existe o ya no está pendiente" }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/ventas anular]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
