import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function POST(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "asociada") return unauthorized();

  const { id: reunionId } = await params;

  try {
    // Verificar que la reunión pertenece a esta asesora
    const [reuniones] = await dbAupair.query(`
      SELECT * FROM reuniones WHERE id = ? AND asesora_id = ?
    `, [reunionId, session.id]);

    if (reuniones.length === 0) {
      return NextResponse.json({ error: "Reunión no encontrada" }, { status: 404 });
    }

    // Confirmar asistencia
    await dbAupair.query(`
      UPDATE reuniones SET confirmada = 1 WHERE id = ?
    `, [reunionId]);

    return NextResponse.json({
      ok: true,
      mensaje: "Asistencia confirmada",
    });
  } catch (err) {
    console.error("[POST /api/asociada/reuniones/[id]/confirmar]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
