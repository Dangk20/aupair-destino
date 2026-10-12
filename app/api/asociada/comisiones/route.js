// app/api/asociada/comisiones/route.js
//
// GET  las comisiones de la asociada en sesión, sus totales por moneda y sus
//      códigos con el precio vigente (R18, change `comisiones-asociada`).
//      Siempre las suyas: el id sale de la sesión, nunca de la petición.
import { NextResponse } from "next/server";
import { requiereRol } from "@/lib/session-aupair";
import { listarComisiones, codigosDeAsociada } from "@/lib/comisiones-aupair";

export async function GET(req) {
  const guard = requiereRol(req, "asociada");
  if (guard.error) return guard.error;
  const asociadaId = Number(guard.session.id);
  try {
    const estado = new URL(req.url).searchParams.get("estado");
    const datos = await listarComisiones({ asociadaId, estado, paraAsociada: true });
    return NextResponse.json({ ...datos, codigos: await codigosDeAsociada(asociadaId) });
  } catch (err) {
    console.error("[GET /api/asociada/comisiones]", err);
    return NextResponse.json({ error: "No se pudieron cargar tus comisiones." }, { status: 500 });
  }
}
