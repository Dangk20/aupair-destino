// ════════════════════════════════════════════════════════════════════════
// app/api/admin/comisiones/[id]/pagar/route.js — Registrar el pago de una
// comisión a su asociada.
//
// Idempotente: marcarla dos veces no duplica nada ni mueve la fecha original.
// Una comisión anulada NO se puede pagar — su venta se anuló, así que no se
// debe.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function POST(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  const { id } = await params;

  try {
    const [[comision]] = await dbAupair.query(
      "SELECT id, estado, pagada_at FROM comisiones WHERE id = ?",
      [id]
    );
    if (!comision) {
      return NextResponse.json({ error: "Comisión no encontrada" }, { status: 404 });
    }

    if (comision.estado === "anulada") {
      return NextResponse.json(
        { error: "La venta de esta comisión fue anulada: no se puede pagar." },
        { status: 409 }
      );
    }

    // Ya estaba pagada: no se toca la fecha original.
    if (comision.estado === "pagada") {
      return NextResponse.json({ ok: true, yaPagada: true, pagada_at: comision.pagada_at });
    }

    await dbAupair.query(
      "UPDATE comisiones SET estado = 'pagada', pagada_at = NOW() WHERE id = ? AND estado = 'pendiente'",
      [id]
    );

    const [[actualizada]] = await dbAupair.query(
      "SELECT pagada_at FROM comisiones WHERE id = ?",
      [id]
    );
    return NextResponse.json({ ok: true, pagada_at: actualizada?.pagada_at ?? null });
  } catch (err) {
    console.error("[admin/comisiones pagar]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
