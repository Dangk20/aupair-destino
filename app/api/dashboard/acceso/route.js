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

    // Estado de la venta más reciente → distingue "invitar a pagar" vs "pendiente".
    // none = nunca solicitó · pendiente = solicitó, falta confirmar · confirmado = pagó
    let venta = "none";
    try {
      const [[v]] = await dbAupair.query(
        "SELECT estado FROM ventas WHERE usuario_id = ? ORDER BY created_at DESC LIMIT 1",
        [session.id]
      );
      if (v?.estado) venta = v.estado;
    } catch { /* tabla ventas puede no existir en entornos viejos */ }

    return NextResponse.json({
      sesiones:   u.tiene_acceso      === 1,
      perfil:     u.perfil_habilitado === 1,
      documentos: u.acceso_documentos === 1,
      recursos:   u.acceso_recursos   === 1,
      reuniones:  u.acceso_reuniones  === 1,
      mensajes:   u.acceso_mensajes   === 1,
      comunidad:  u.acceso_comunidad  === 1,
      venta,
    });
  } catch (err) {
    console.error("[GET /api/dashboard/acceso]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}