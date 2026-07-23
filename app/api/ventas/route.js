// ════════════════════════════════════════════════════════════════════════
// app/api/ventas/route.js — La candidata registra su intención de pago.
//
// POST: crea (o actualiza) una venta 'pendiente' para la candidata logueada.
//       Ancla el código de descuento si lo trae. Esto es lo que hoy NO existía:
//       antes el botón de pago sólo abría WhatsApp y no dejaba rastro.
// GET:  la candidata consulta el estado de su última venta.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import { resolverCodigo, PRECIO_REGULAR } from "@/lib/ventas-aupair";

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const body = await req.json().catch(() => ({}));
    const codigoTexto = body.codigo?.toString().trim().toUpperCase() || null;

    // Resolver código (si lo hay) contra codigos_promo
    const codigo = codigoTexto ? await resolverCodigo(codigoTexto) : null;
    const codigoPromoId = codigo?.id || null;
    const monto = codigo ? Number(codigo.precio_final) : PRECIO_REGULAR;
    const tipo = codigo ? "con_codigo" : "normal";

    // Un usuario no debería acumular varias intenciones pendientes:
    // si ya tiene una pendiente, la actualizamos; si no, insertamos.
    const [[pendiente]] = await dbAupair.query(
      "SELECT id FROM ventas WHERE usuario_id = ? AND estado = 'pendiente' LIMIT 1",
      [session.id]
    );

    let ventaId;
    if (pendiente) {
      await dbAupair.query(
        `UPDATE ventas
            SET monto = ?, codigo_promo_id = ?, codigo_texto = ?, tipo = ?, created_at = NOW()
          WHERE id = ?`,
        [monto, codigoPromoId, codigo ? codigoTexto : null, tipo, pendiente.id]
      );
      ventaId = pendiente.id;
    } else {
      const [res] = await dbAupair.query(
        `INSERT INTO ventas (usuario_id, monto, estado, codigo_promo_id, codigo_texto, tipo)
         VALUES (?, ?, 'pendiente', ?, ?, ?)`,
        [session.id, monto, codigoPromoId, codigo ? codigoTexto : null, tipo]
      );
      ventaId = res.insertId;
    }

    return NextResponse.json({
      ok: true,
      venta: { id: ventaId, monto, tipo, estado: "pendiente", codigo: codigo ? codigoTexto : null },
    });
  } catch (err) {
    console.error("[ventas POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const [[venta]] = await dbAupair.query(
      `SELECT id, monto, estado, tipo, codigo_texto, created_at, confirmado_at
         FROM ventas WHERE usuario_id = ? ORDER BY created_at DESC LIMIT 1`,
      [session.id]
    );
    return NextResponse.json({ venta: venta || null });
  } catch (err) {
    return NextResponse.json({ venta: null });
  }
}
