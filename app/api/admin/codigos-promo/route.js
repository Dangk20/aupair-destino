// app/api/admin/codigos-promo/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

// GET — listar todos los códigos con stats y asociada dueña
export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  // usos_confirmados = ventas pagadas (consumen cupo)
  // aplicaciones_pendientes = candidatas que aplicaron el código y aún no
  //   tienen venta confirmada. No consumen cupo, pero la clienta necesita
  //   verlas: son el movimiento del código antes de que entre la plata.
  const [codigos] = await dbAupair.query(`
    SELECT c.*,
      (SELECT COUNT(*) FROM codigos_promo_usos u WHERE u.codigo_id = c.id)         AS usos_confirmados,
      (SELECT COALESCE(SUM(u.monto_pagado),0) FROM codigos_promo_usos u
        WHERE u.codigo_id = c.id)                                                  AS total_recaudado,
      (SELECT COUNT(*) FROM ventas v
        WHERE v.codigo_promo_id = c.id AND v.estado = 'pendiente')                 AS aplicaciones_pendientes,
      a.nombre   AS asociada_nombre,
      a.apellido AS asociada_apellido
    FROM codigos_promo c
    LEFT JOIN usuarios a ON a.id = c.asociada_id
    ORDER BY c.created_at DESC
  `);

  // total_usos se mantiene como alias de usos_confirmados por compatibilidad
  // con lo que ya consumía la UI.
  for (const c of codigos) c.total_usos = c.usos_confirmados;

  return NextResponse.json({ codigos });
}

// POST — crear código (opcionalmente anclado a una asociada con % de comisión)
export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

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
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

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
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  await dbAupair.query("DELETE FROM codigos_promo WHERE id=?", [id]);
  return NextResponse.json({ ok: true });
}
