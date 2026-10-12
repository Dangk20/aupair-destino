// ════════════════════════════════════════════════════════════════════════
// app/api/admin/comisiones/route.js — Comisiones de las asociadas.
//
// GET: listado con la asociada, la candidata que originó la venta, el código
//      usado, los montos, el porcentaje, el estado y las fechas.
//      Filtros: ?asociada=<id> y ?estado=pendiente|pagada|anulada
//
// Las comisiones las genera lib/ventas-aupair.js al confirmar una venta con
// código de asociada. Esta ruta sólo lee: no crea ni recalcula nada.
//
// Los totales EXCLUYEN las anuladas — una comisión anulada no se debe ni se
// pagó, así que no puede sumar en ninguna parte.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/session-aupair";
import { listarComisiones } from "@/lib/comisiones-aupair";

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const { searchParams } = new URL(req.url);
    return NextResponse.json(await listarComisiones({
      asociadaId: searchParams.get("asociada"),
      estado:     searchParams.get("estado"),
    }));
  } catch (err) {
    console.error("[admin/comisiones GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
