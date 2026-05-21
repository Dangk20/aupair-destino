// app/api/admin/reuniones/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const [reuniones] = await dbAupair.query(`
      SELECT r.*, u.nombre, u.apellido, u.email, u.foto_url AS usuario_foto
      FROM reuniones r JOIN usuarios u ON u.id = r.usuario_id
      ORDER BY r.fecha DESC, r.hora_inicio DESC
    `);
    const [usuarias] = await dbAupair.query(
      "SELECT id, nombre, apellido, email, foto_url FROM usuarios WHERE rol='usuaria' ORDER BY nombre ASC"
    );
    return NextResponse.json({ reuniones, usuarias });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { usuario_id, titulo, descripcion, fecha, hora_inicio, hora_fin, meet_url, asesora, asesora_foto } = await req.json();
    if (!usuario_id || !titulo || !fecha || !hora_inicio)
      return NextResponse.json({ error: "usuario_id, titulo, fecha y hora_inicio son requeridos" }, { status: 400 });

    const [r] = await dbAupair.query(
      "INSERT INTO reuniones (usuario_id, titulo, descripcion, fecha, hora_inicio, hora_fin, meet_url, asesora, asesora_foto) VALUES (?,?,?,?,?,?,?,?,?)",
      [usuario_id, titulo, descripcion||null, fecha, hora_inicio, hora_fin||null, meet_url||null, asesora||null, asesora_foto||null]
    );
    return NextResponse.json({ ok: true, id: r.insertId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { id, estado, titulo, descripcion, fecha, hora_inicio, hora_fin, meet_url, asesora } = await req.json();
    await dbAupair.query(
      "UPDATE reuniones SET estado=?, titulo=?, descripcion=?, fecha=?, hora_inicio=?, hora_fin=?, meet_url=?, asesora=? WHERE id=?",
      [estado, titulo, descripcion||null, fecha, hora_inicio, hora_fin||null, meet_url||null, asesora||null, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await dbAupair.query("DELETE FROM reuniones WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* SQL:
CREATE TABLE IF NOT EXISTS reuniones (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id   INT NOT NULL,
  titulo       VARCHAR(255) NOT NULL,
  descripcion  TEXT,
  fecha        DATE NOT NULL,
  hora_inicio  TIME NOT NULL,
  hora_fin     TIME,
  meet_url     VARCHAR(500),
  asesora      VARCHAR(100),
  asesora_foto VARCHAR(500),
  estado       ENUM('programada','completada','cancelada') DEFAULT 'programada',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
*/