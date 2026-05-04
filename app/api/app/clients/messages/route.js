import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const id_cliente  = session.id;
  const id_proyecto = new URL(req.url).searchParams.get("id_proyecto");
  try {
    if (id_proyecto) {
      const [msgs] = await pool.query(
        `SELECT m.*, u.nombre as senderName FROM mensajes m
         LEFT JOIN usuarios u ON u.id_usuario = m.id_usuario_sender
         WHERE m.id_proyecto = ? ORDER BY m.created_at ASC`,
        [id_proyecto]
      );
      return NextResponse.json(msgs.map(m=>({ id:m.id_mensaje, sender:m.sender_type, senderName:m.senderName||m.sender_type, text:m.texto, createdAt:m.created_at })));
    } else {
      const [projects] = await pool.query(
        `SELECT p.id_proyecto, p.nombre,
           (SELECT texto FROM mensajes WHERE id_proyecto=p.id_proyecto ORDER BY created_at DESC LIMIT 1) as lastMessage,
           (SELECT COUNT(*) FROM mensajes WHERE id_proyecto=p.id_proyecto AND sender_type!='client' AND leido=0) as unread
         FROM proyectos p WHERE p.id_cliente = ? ORDER BY p.fecha_creacion DESC`,
        [id_cliente]
      );
      return NextResponse.json(projects);
    }
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { id_proyecto, text } = await req.json();
  if (!text || !id_proyecto) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  try {
    const [r] = await pool.query(
      "INSERT INTO mensajes (id_proyecto, id_usuario_sender, sender_type, texto, leido) VALUES (?,?,'client',?,0)",
      [id_proyecto, session.id, text]
    );
    return NextResponse.json({ id_mensaje: r.insertId }, { status: 201 });
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}