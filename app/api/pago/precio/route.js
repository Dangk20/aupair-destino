// app/api/pago/precio/route.js
//
// GET  el precio del cupo, para /pago. Lo fija el admin en Configuración
//      (R9, change `divisa-cop`); la candidata no puede leer la configuración
//      del admin, así que se le expone sólo esto. { precio: null } = aún no
//      está configurado: /pago no inventa uno.
import { NextResponse } from "next/server";
import { requiereSesion } from "@/lib/session-aupair";
import { precioCupo } from "@/lib/ventas-aupair";
import { MONEDA } from "@/lib/moneda";

export async function GET(req) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  try {
    return NextResponse.json({ precio: await precioCupo(), moneda: MONEDA });
  } catch (err) {
    console.error("[GET /api/pago/precio]", err);
    return NextResponse.json({ error: "No se pudo leer el precio." }, { status: 500 });
  }
}
