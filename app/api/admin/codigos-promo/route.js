// app/api/admin/codigos-promo/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

// GET — listar todos los códigos con stats y asociada dueña
export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const [codigos] = await dbAupair.query(`
    SELECT c.*,
      COUNT(u.id) AS total_usos,
      SUM(u.monto_pagado) AS total_recaudado,
      a.nombre AS asociada_nombre,
      a.apellido AS asociada_apellido
    FROM codigos_promo c
    LEFT JOIN codigos_promo_usos u ON u.codigo_id = c.id
    LEFT JOIN usuarios a ON a.id = c.asociada_id
    GROUP BY c.id, a.id
    ORDER BY c.created_at DESC
  `);

  return NextResponse.json({ codigos });
}

// POST — crear código (opcionalmente anclado a una asociada con % de comisión)
export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { codigo, precio_final, usos_max, fecha_expiracion, descripcion, asociada_id, comision_porcentaje } = await req.json();
  if (!codigo || !precio_final)
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });

  try {
    const [res] = await dbAupair.query(`
      INSERT INTO codigos_promo (codigo, precio_final, usos_max, fecha_expiracion, descripcion, asociada_id, comision_porcentaje)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo.toUpperCase(), precio_final, usos_max || null, fecha_expiracion || null,
      descripcion || null, asociada_id || null, Number(comision_porcentaje) || 0,
    ]);

    return NextResponse.json({ ok: true, id: res.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return NextResponse.json({ error: "Este código ya existe" }, { status: 400 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — activar/desactivar o editar (sólo actualiza los campos enviados)
export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  // Campos editables; asociada_id y usos_max admiten null explícito (quitar dueña / usos ∞)
  const campos = ["activo", "codigo", "precio_final", "usos_max", "fecha_expiracion", "descripcion", "asociada_id", "comision_porcentaje"];
  const sets = [], vals = [];
  for (const campo of campos) {
    if (campo in body) {
      sets.push(`${campo} = ?`);
      vals.push(campo === "codigo" && body.codigo ? body.codigo.toUpperCase() : (body[campo] === "" ? null : body[campo]));
    }
  }
  if (!sets.length) return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });

  try {
    await dbAupair.query(`UPDATE codigos_promo SET ${sets.join(", ")} WHERE id = ?`, [...vals, id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return NextResponse.json({ error: "Este código ya existe" }, { status: 400 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — eliminar código
export async function DELETE(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  await dbAupair.query("DELETE FROM codigos_promo WHERE id=?", [id]);
  return NextResponse.json({ ok: true });
}
