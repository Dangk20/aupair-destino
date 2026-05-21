// app/api/admin/toggle-acceso/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { id, tiene_acceso } = await req.json();
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    await dbAupair.query(
      "UPDATE usuarios SET tiene_acceso = ? WHERE id = ?",
      [tiene_acceso ? 1 : 0, id]
    );

    // Verificar que realmente cambió
    const [[updated]] = await dbAupair.query(
      "SELECT tiene_acceso FROM usuarios WHERE id = ?", [id]
    );

    return NextResponse.json({ ok: true, tiene_acceso: updated.tiene_acceso });
  } catch (err) {
    console.error("[toggle-acceso]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}