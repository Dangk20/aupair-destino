//══════════════════════════════════════════
// app/api/admin/confirmar-pago/route.js

import dbAupair from "@/lib/db-aupair";

// ══════════════════════════════════════════
export async function POST(req) {
  try {
    const { usuarioId, monto = 35 } = await req.json();

    await dbAupair.query("UPDATE usuarios SET tiene_acceso = 1 WHERE id = ?", [usuarioId]);

    await db.query(`
      UPDATE referido_registros
      SET pago_realizado = 1, monto_pagado = ?
      WHERE usuario_id = ?
    `, [monto, usuarioId]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}