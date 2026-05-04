import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function PATCH(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { id } = params;
  const body   = await req.json();
  const fields = ["nombre","descripcion","presupuesto","fecha_inicio","fecha_fin","estado","progreso_porcentaje"]
    .filter(f => body[f] !== undefined);
  if (!fields.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  try {
    await pool.query(
      `UPDATE proyectos SET ${fields.map(f=>`${f}=?`).join(",")} WHERE id_proyecto=? AND id_empresa=?`,
      [...fields.map(f=>body[f]), id, session.id_empresa]
    );
    return NextResponse.json({ ok: true });
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function DELETE(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { id } = params;
  try {
    await pool.query("UPDATE proyectos SET estado='cancelado' WHERE id_proyecto=? AND id_empresa=?", [id, session.id_empresa]);
    await pool.query("UPDATE documentos SET estado='eliminado' WHERE id_proyecto=?", [id]);
    return NextResponse.json({ ok: true });
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}