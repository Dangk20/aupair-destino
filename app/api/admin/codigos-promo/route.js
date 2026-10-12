// app/api/admin/codigos-promo/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { precioCupo, precioConCodigo } from "@/lib/ventas-aupair";
import { porMoneda } from "@/lib/moneda";

/** Un % de 0 a 100, o null si no es válido. */
function porcentajeValido(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
}

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
  // Lo que hoy paga quien use cada cupón, con el precio configurado (R9).
  const cupo = await precioCupo();
  // Lo recaudado por cupón, por moneda (R9): sale de las ventas confirmadas,
  // que guardan su moneda; codigos_promo_usos no la tiene.
  const [rec] = await dbAupair.query(
    `SELECT codigo_promo_id, moneda, SUM(monto) AS total FROM ventas
      WHERE estado = 'confirmado' AND codigo_promo_id IS NOT NULL GROUP BY codigo_promo_id, moneda`
  );
  for (const c of codigos) {
    c.recaudado_por_moneda = porMoneda(rec.filter((r) => r.codigo_promo_id === c.id));
    c.total_usos = c.usos_confirmados;
    c.precio_actual = precioConCodigo(c, cupo);   // null = precio del cupo sin configurar
  }

  return NextResponse.json({ codigos });
}

// POST — crear código (opcionalmente anclado a una asociada con % de comisión)
export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { codigo, descuento_porcentaje, usos_max, fecha_expiracion, descripcion, asociada_id, comision_porcentaje } = await req.json();
  // R9: un cupón es un % de descuento sobre el precio del cupo, no un precio.
  const pct = porcentajeValido(descuento_porcentaje);
  if (!codigo || pct === null)
    return NextResponse.json({ error: "Faltan el código o el descuento (0 a 100 %)." }, { status: 400 });

  try {
    const [res] = await dbAupair.query(`
      INSERT INTO codigos_promo (codigo, precio_final, moneda, descuento_porcentaje, usos_max, fecha_expiracion, descripcion, asociada_id, comision_porcentaje)
      VALUES (?, NULL, 'COP', ?, ?, ?, ?, ?, ?)
    `, [
      codigo.toUpperCase(), pct, usos_max || null, fecha_expiracion || null,
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
  // El precio no se edita: se edita el descuento (R9).
  const campos = ["activo", "codigo", "usos_max", "fecha_expiracion", "descripcion", "asociada_id", "comision_porcentaje"];
  const sets = [], vals = [];
  for (const campo of campos) {
    if (campo in body) {
      sets.push(`${campo} = ?`);
      vals.push(campo === "codigo" && body.codigo ? body.codigo.toUpperCase() : (body[campo] === "" ? null : body[campo]));
    }
  }
  try {
    // R9: poner un descuento deja el cupón atado al precio del cupo, en COP:
    // un cupón viejo de precio fijo en USD deja de serlo.
    if ("descuento_porcentaje" in body) {
      const pct = porcentajeValido(body.descuento_porcentaje);
      if (pct === null) return NextResponse.json({ error: "El descuento va de 0 a 100 %." }, { status: 400 });
      sets.push("descuento_porcentaje = ?", "precio_final = NULL", "moneda = 'COP'");
      vals.push(pct);
    }
    if (!sets.length) return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
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
