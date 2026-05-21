// ═══════════════════════════════════════════════════════════════════
// app/api/dashboard/mensajes/route.js
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const limit      = parseInt(searchParams.get("limit") || "100");
  const soloConteo = searchParams.get("solo_conteo") === "true";

  try {
    if (soloConteo) {
      const [[r]] = await dbAupair.query(
        "SELECT COUNT(*) AS n FROM mensajes WHERE usuario_id = ? AND remitente = 'admin' AND leido = 0",
        [session.id]
      );
      return NextResponse.json({ no_leidos: Number(r?.n ?? 0) });
    }

    // Marcar mensajes del admin como leídos
    await dbAupair.query(
      "UPDATE mensajes SET leido = 1 WHERE usuario_id = ? AND remitente = 'admin' AND leido = 0",
      [session.id]
    );

    const [mensajes] = await dbAupair.query(
      `SELECT id, remitente, contenido, leido, created_at
       FROM mensajes WHERE usuario_id = ?
       ORDER BY created_at ASC LIMIT ?`,
      [session.id, limit]
    );

    return NextResponse.json({ mensajes });
  } catch {
    return NextResponse.json({ mensajes: [] });
  }
}

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const { contenido } = await req.json();
    if (!contenido?.trim())
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });

    const [r] = await dbAupair.query(
      "INSERT INTO mensajes (usuario_id, remitente, contenido) VALUES (?, 'usuario', ?)",
      [session.id, contenido.trim()]
    );

    return NextResponse.json({ ok: true, id: r.insertId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* SQL:
CREATE TABLE IF NOT EXISTS mensajes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  remitente  ENUM('usuario','admin') NOT NULL,
  contenido  TEXT NOT NULL,
  leido      TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
*/