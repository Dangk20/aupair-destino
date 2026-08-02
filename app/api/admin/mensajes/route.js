// app/api/admin/mensajes/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

// GET /api/admin/mensajes?usuario_id=X  → mensajes de una usuaria
// GET /api/admin/mensajes               → lista de conversaciones
export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { searchParams } = new URL(req.url);
  const usuario_id = searchParams.get("usuario_id");

  try {
    if (usuario_id) {
      // Marcar mensajes de la usuaria como leídos
      await dbAupair.query(
        "UPDATE mensajes SET leido = 1 WHERE usuario_id = ? AND remitente = 'usuario' AND leido = 0",
        [usuario_id]
      );
      const [mensajes] = await dbAupair.query(
        "SELECT id, remitente, contenido, leido, created_at FROM mensajes WHERE usuario_id = ? ORDER BY created_at ASC",
        [usuario_id]
      );
      return NextResponse.json({ mensajes });
    }

    // Lista de conversaciones (una por usuaria, con último mensaje y no leídos)
    const [conversaciones] = await dbAupair.query(`
      SELECT
        u.id, u.nombre, u.apellido, u.email, u.foto_url,
        (SELECT contenido FROM mensajes WHERE usuario_id = u.id ORDER BY created_at DESC LIMIT 1) AS ultimo_mensaje,
        (SELECT created_at FROM mensajes WHERE usuario_id = u.id ORDER BY created_at DESC LIMIT 1) AS ultimo_tiempo,
        (SELECT COUNT(*) FROM mensajes WHERE usuario_id = u.id AND remitente = 'usuario' AND leido = 0) AS no_leidos
      FROM usuarios u
      WHERE u.rol = 'usuaria'
        AND EXISTS (SELECT 1 FROM mensajes WHERE usuario_id = u.id)
      ORDER BY ultimo_tiempo DESC
    `);
    return NextResponse.json({ conversaciones });
  } catch (err) {
    return NextResponse.json({ conversaciones: [], mensajes: [], error: err.message });
  }
}

// POST /api/admin/mensajes  → admin responde
export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { usuario_id, contenido } = await req.json();
    if (!usuario_id || !contenido?.trim())
      return NextResponse.json({ error: "usuario_id y contenido requeridos" }, { status: 400 });

    const [r] = await dbAupair.query(
      "INSERT INTO mensajes (usuario_id, remitente, contenido) VALUES (?, 'admin', ?)",
      [usuario_id, contenido.trim()]
    );
    return NextResponse.json({ ok: true, id: r.insertId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}