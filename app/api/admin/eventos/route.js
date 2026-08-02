// app/api/admin/eventos/route.js
import { requiereRol } from "@/lib/session-aupair";
import db from "@/lib/db-aupair";

export async function GET(req) {
  // Antes sólo exigía sesión: cualquier usuaria autenticada, incluida una
  // candidata, leía la agenda de la clienta y sus asesoras. Excepción de rol
  // declarada en docs/rutas-y-acceso.md — la agenda es compartida.
  const guard = requiereRol(req, ["admin", "asociada"]);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { searchParams } = new URL(req.url);
  const mes   = searchParams.get("mes");
  const year  = mes ? mes.split("-")[0] : new Date().getFullYear();
  const month = mes ? mes.split("-")[1] : String(new Date().getMonth()+1).padStart(2,"0");

  const [rows] = await db.query(`
    SELECT e.*, u.nombre AS creador_nombre
    FROM eventos e
    JOIN usuarios u ON u.id = e.creado_por
    WHERE YEAR(e.fecha)=? AND MONTH(e.fecha)=?
      AND (e.visible=1 OR e.creado_por=?)
    ORDER BY e.fecha, e.hora_inicio
  `, [year, month, session.id]);

  return Response.json({ eventos: rows });
}

export async function POST(req) {
  const guard = requiereRol(req, ["admin", "asociada"]);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { titulo, descripcion, tipo, fecha, hora_inicio, hora_fin, url_meet, color, visible } = await req.json();
  if (!titulo || !fecha) return Response.json({ error: "Faltan campos" }, { status: 400 });

  const [res] = await db.query(`
    INSERT INTO eventos (creado_por, titulo, descripcion, tipo, fecha, hora_inicio, hora_fin, url_meet, color, visible)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [session.id, titulo, descripcion||null, tipo||"otro", fecha, hora_inicio||null, hora_fin||null, url_meet||null, color||"#7c3aed", visible??1]);

  return Response.json({ ok: true, id: res.insertId });
}

export async function PUT(req) {
  const guard = requiereRol(req, ["admin", "asociada"]);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { id, titulo, descripcion, tipo, fecha, hora_inicio, hora_fin, url_meet, color, visible } = await req.json();
  if (!id) return Response.json({ error: "Falta id" }, { status: 400 });

  const [existing] = await db.query("SELECT * FROM eventos WHERE id=?", [id]);
  if (!existing.length) return Response.json({ error: "No encontrado" }, { status: 404 });
  if (session.rol !== "admin" && existing[0].creado_por !== session.id)
    return Response.json({ error: "Sin permiso" }, { status: 403 });

  await db.query(`
    UPDATE eventos SET
      titulo=COALESCE(?,titulo), descripcion=COALESCE(?,descripcion),
      tipo=COALESCE(?,tipo), fecha=COALESCE(?,fecha),
      hora_inicio=COALESCE(?,hora_inicio), hora_fin=COALESCE(?,hora_fin),
      url_meet=COALESCE(?,url_meet), color=COALESCE(?,color),
      visible=COALESCE(?,visible)
    WHERE id=?
  `, [titulo||null, descripcion||null, tipo||null, fecha||null, hora_inicio||null, hora_fin||null, url_meet||null, color||null, visible??null, id]);

  return Response.json({ ok: true });
}

export async function DELETE(req) {
  const guard = requiereRol(req, ["admin", "asociada"]);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Falta id" }, { status: 400 });

  const [existing] = await db.query("SELECT * FROM eventos WHERE id=?", [id]);
  if (!existing.length) return Response.json({ error: "No encontrado" }, { status: 404 });
  if (session.rol !== "admin" && existing[0].creado_por !== session.id)
    return Response.json({ error: "Sin permiso" }, { status: 403 });

  await db.query("DELETE FROM eventos WHERE id=?", [id]);
  return Response.json({ ok: true });
}