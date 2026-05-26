// app/api/admin/codigos-promo/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

// GET — listar todos los códigos con stats
export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const [codigos] = await dbAupair.query(`
    SELECT c.*,
      COUNT(u.id) AS total_usos,
      SUM(u.monto_pagado) AS total_recaudado
    FROM codigos_promo c
    LEFT JOIN codigos_promo_usos u ON u.codigo_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);

  return NextResponse.json({ codigos });
}

// POST — crear código
export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { codigo, precio_final, usos_max, fecha_expiracion, descripcion } = await req.json();
  if (!codigo || !precio_final)
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });

  try {
    const [res] = await dbAupair.query(`
      INSERT INTO codigos_promo (codigo, precio_final, usos_max, fecha_expiracion, descripcion)
      VALUES (?, ?, ?, ?, ?)
    `, [codigo.toUpperCase(), precio_final, usos_max||null, fecha_expiracion||null, descripcion||null]);

    return NextResponse.json({ ok: true, id: res.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return NextResponse.json({ error: "Este código ya existe" }, { status: 400 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — activar/desactivar o editar
export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { id, activo, codigo, precio_final, usos_max, fecha_expiracion, descripcion } = await req.json();
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  await dbAupair.query(`
    UPDATE codigos_promo SET
      activo = COALESCE(?, activo),
      codigo = COALESCE(?, codigo),
      precio_final = COALESCE(?, precio_final),
      usos_max = COALESCE(?, usos_max),
      fecha_expiracion = COALESCE(?, fecha_expiracion),
      descripcion = COALESCE(?, descripcion)
    WHERE id = ?
  `, [activo??null, codigo||null, precio_final||null, usos_max||null, fecha_expiracion||null, descripcion||null, id]);

  return NextResponse.json({ ok: true });
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