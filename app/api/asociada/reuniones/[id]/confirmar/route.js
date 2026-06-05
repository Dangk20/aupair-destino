// app/api/asociada/reuniones/[id]/confirmar/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function POST(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "asociada") return unauthorized();

  const { id: reunionId } = await params;

  try {
    // Buscar su referido_id
    const [[referido]] = await dbAupair.query(
      "SELECT r.id FROM referidos r JOIN usuarios u ON u.email = r.email WHERE u.id = ?",
      [session.id]
    ).catch(()=>[[null]]);

    if (!referido) {
      return NextResponse.json({ error: "No tienes código de referida asignado" }, { status: 403 });
    }

    // Verificar que la reunión pertenece a una de sus referidas
    const [[reunion]] = await dbAupair.query(`
      SELECT r.id FROM reuniones r
      WHERE r.id = ? AND r.usuario_id IN (
        SELECT rr.usuario_id FROM referido_registros rr WHERE rr.referido_id = ?
      )
    `, [reunionId, referido.id]);

    if (!reunion) {
      return NextResponse.json({ error: "Reunión no encontrada" }, { status: 404 });
    }

    await dbAupair.query(
      "UPDATE reuniones SET estado = 'confirmada' WHERE id = ?",
      [reunionId]
    );

    return NextResponse.json({ ok: true, mensaje: "Reunión confirmada" });
  } catch (err) {
    console.error("[POST /api/asociada/reuniones/[id]/confirmar]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}