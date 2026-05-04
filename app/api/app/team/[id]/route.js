import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function PATCH(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { id } = params;
  const body   = await req.json();
  const allowed = ["nombre","apellido","email","telefono","estado"];
  const fields  = allowed.filter(f => body[f] !== undefined);

  if (body.id_rol) {
    const [[role]] = await pool.query("SELECT id_rol FROM roles WHERE nombre_rol=?", [body.id_rol]);
    if (role) await pool.query("UPDATE usuarios SET id_rol=? WHERE id_usuario=? AND id_empresa=?", [role.id_rol, id, session.id_empresa]);
  }
  if (fields.length) {
    const set = fields.map(f=>`${f}=?`).join(",");
    await pool.query(`UPDATE usuarios SET ${set} WHERE id_usuario=? AND id_empresa=?`, [...fields.map(f=>body[f]), id, session.id_empresa]);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { id } = params;
  try {
    await pool.query("UPDATE usuarios SET estado='inactivo' WHERE id_usuario=? AND id_empresa=?", [id, session.id_empresa]);
    return NextResponse.json({ ok: true });
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}