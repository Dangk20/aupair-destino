// app/api/admin/disponibilidad/route.js
import { requiereRol } from "@/lib/session-aupair";
import db from "@/lib/db-aupair";

// GET — listar slots (admin ve todos, asociada solo los suyos)
export async function GET(req) {
  const guard = requiereRol(req, ["admin", "asociada"]);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { searchParams } = new URL(req.url);
  const mes  = searchParams.get("mes");  // YYYY-MM
  const year = mes ? mes.split("-")[0] : new Date().getFullYear();
  const month= mes ? mes.split("-")[1] : String(new Date().getMonth()+1).padStart(2,"0");

  let rows;
  if (session.rol === "admin") {
    [rows] = await db.query(`
      SELECT d.*,
        a.nombre AS asesora_nombre, a.apellido AS asesora_apellido, a.foto_url AS asesora_foto,
        u.nombre AS cliente_nombre, u.apellido AS cliente_apellido, u.email AS cliente_email
      FROM disponibilidad d
      JOIN usuarios a ON a.id = d.asesora_id
      LEFT JOIN usuarios u ON u.id = d.reservado_por
      WHERE YEAR(d.fecha)=? AND MONTH(d.fecha)=?
      ORDER BY d.fecha, d.hora_inicio
    `, [year, month]);
  } else {
    [rows] = await db.query(`
      SELECT d.*,
        a.nombre AS asesora_nombre, a.apellido AS asesora_apellido,
        u.nombre AS cliente_nombre, u.apellido AS cliente_apellido, u.email AS cliente_email
      FROM disponibilidad d
      JOIN usuarios a ON a.id = d.asesora_id
      LEFT JOIN usuarios u ON u.id = d.reservado_por
      WHERE d.asesora_id=? AND YEAR(d.fecha)=? AND MONTH(d.fecha)=?
      ORDER BY d.fecha, d.hora_inicio
    `, [session.id, year, month]);
  }

  return Response.json({ slots: rows });
}

// POST — crear slot(s)
export async function POST(req) {
  const guard = requiereRol(req, ["admin", "asociada"]);
  if (guard.error) return guard.error;
  const session = guard.session;

  const body = await req.json();
  const { fecha, hora_inicio, hora_fin, url_meet, notas, repetir_semanas = 0 } = body;

  if (!fecha || !hora_inicio || !hora_fin)
    return Response.json({ error: "Faltan campos requeridos" }, { status: 400 });

  const asesora_id = session.rol === "admin" ? (body.asesora_id || session.id) : session.id;

  const fechas = [fecha];
  for (let i = 1; i <= repetir_semanas; i++) {
    const d = new Date(fecha);
    d.setDate(d.getDate() + i * 7);
    fechas.push(d.toISOString().split("T")[0]);
  }

  for (const f of fechas) {
    await db.query(`
      INSERT INTO disponibilidad (asesora_id, fecha, hora_inicio, hora_fin, url_meet, notas)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [asesora_id, f, hora_inicio, hora_fin, url_meet||null, notas||null]);
  }

  return Response.json({ ok: true, creados: fechas.length });
}

// PUT — editar slot
export async function PUT(req) {
  const guard = requiereRol(req, ["admin", "asociada"]);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { id, fecha, hora_inicio, hora_fin, url_meet, notas, estado } = await req.json();
  if (!id) return Response.json({ error: "Falta id" }, { status: 400 });

  const [existing] = await db.query("SELECT * FROM disponibilidad WHERE id=?", [id]);
  if (!existing.length) return Response.json({ error: "No encontrado" }, { status: 404 });
  if (session.rol !== "admin" && existing[0].asesora_id !== session.id)
    return Response.json({ error: "Sin permiso" }, { status: 403 });

  await db.query(`
    UPDATE disponibilidad SET
      fecha=COALESCE(?,fecha), hora_inicio=COALESCE(?,hora_inicio),
      hora_fin=COALESCE(?,hora_fin), url_meet=COALESCE(?,url_meet),
      notas=COALESCE(?,notas), estado=COALESCE(?,estado)
    WHERE id=?
  `, [fecha||null, hora_inicio||null, hora_fin||null, url_meet||null, notas||null, estado||null, id]);

  return Response.json({ ok: true });
}

// DELETE — eliminar slot (solo si no está reservado, o admin fuerza)
export async function DELETE(req) {
  const guard = requiereRol(req, ["admin", "asociada"]);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Falta id" }, { status: 400 });

  const [existing] = await db.query("SELECT * FROM disponibilidad WHERE id=?", [id]);
  if (!existing.length) return Response.json({ error: "No encontrado" }, { status: 404 });
  if (session.rol !== "admin" && existing[0].asesora_id !== session.id)
    return Response.json({ error: "Sin permiso" }, { status: 403 });
  if (existing[0].estado === "reservada" && session.rol !== "admin")
    return Response.json({ error: "Slot ya reservado" }, { status: 400 });

  await db.query("DELETE FROM disponibilidad WHERE id=?", [id]);
  return Response.json({ ok: true });
}