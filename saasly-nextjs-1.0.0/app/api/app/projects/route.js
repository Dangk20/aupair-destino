import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const id_empresa = session.id_empresa;
  const limit = new URL(req.url).searchParams.get("limit");
  try {
    const q = limit
      ? "SELECT * FROM proyectos WHERE id_empresa=? AND estado!='cancelado' ORDER BY fecha_creacion DESC LIMIT ?"
      : "SELECT * FROM proyectos WHERE id_empresa=? ORDER BY fecha_creacion DESC";
    const [rows] = await pool.query(q, limit ? [id_empresa, Number(limit)] : [id_empresa]);
    return NextResponse.json(rows);
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { nombre, descripcion, presupuesto, fecha_inicio, fecha_fin } = await req.json();
  if (!nombre) return NextResponse.json({ error: "Name required" }, { status: 400 });
  try {
    const [r] = await pool.query(
      "INSERT INTO proyectos (id_empresa, nombre, descripcion, presupuesto, fecha_inicio, fecha_fin, estado, progreso_porcentaje) VALUES (?,?,?,?,?,?,'activo',0)",
      [session.id_empresa, nombre, descripcion||null, presupuesto||null, fecha_inicio||null, fecha_fin||null]
    );
    return NextResponse.json({ id_proyecto: r.insertId }, { status: 201 });
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}