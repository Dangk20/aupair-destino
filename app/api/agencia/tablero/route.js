// app/api/agencia/tablero/route.js
// Las candidatas de esta agencia, con su etapa: el mismo cálculo que el
// tablero del admin (lib/tablero-aupair.js), filtrado por la relación.
import { NextResponse } from "next/server";
import { requiereRol } from "@/lib/session-aupair";
import { tablero } from "@/lib/tablero-aupair";

export async function GET(req) {
  const guard = requiereRol(req, "agencia");
  if (guard.error) return guard.error;
  try {
    return NextResponse.json({ candidatas: await tablero({ agenciaId: guard.session.id }) });
  } catch (err) {
    console.error("[GET /api/agencia/tablero]", err);
    return NextResponse.json({ error: "No se pudo cargar el tablero." }, { status: 500 });
  }
}
