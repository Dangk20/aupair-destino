// app/api/dashboard/reuniones/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const [reuniones] = await dbAupair.query(`
      SELECT id, titulo, descripcion, fecha, hora_inicio, hora_fin,
             meet_url, asesora, asesora_foto, estado, created_at
      FROM reuniones WHERE usuario_id = ?
      ORDER BY fecha DESC, hora_inicio DESC
    `, [session.id]);
    return NextResponse.json({ reuniones });
  } catch {
    return NextResponse.json({ reuniones: [] });
  }
}