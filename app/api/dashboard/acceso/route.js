// app/api/dashboard/acceso/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const [[u]] = await dbAupair.query(`
      SELECT
        tiene_acceso,
        perfil_habilitado,
        acceso_documentos,
        acceso_recursos,
        acceso_reuniones,
        acceso_mensajes,
        acceso_comunidad
      FROM usuarios WHERE id = ?
    `, [session.id]);

    if (!u) return unauthorized();

    return NextResponse.json({
      sesiones:   u.tiene_acceso      === 1,
      perfil:     u.perfil_habilitado === 1,
      documentos: u.acceso_documentos === 1,
      recursos:   u.acceso_recursos   === 1,
      reuniones:  u.acceso_reuniones  === 1,
      mensajes:   u.acceso_mensajes   === 1,
      comunidad:  u.acceso_comunidad  === 1,
    });
  } catch (err) {
    console.error("[GET /api/dashboard/acceso]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}