// app/api/dashboard/historial/route.js
// La línea de tiempo de la propia candidata: su etapa, su agencia y los hechos,
// sin lo interno (el motivo de No califica) ni quién del equipo los hizo.
import { NextResponse } from "next/server";
import { requiereSesion } from "@/lib/session-aupair";
import { historialDe, contextoEtapa } from "@/lib/historial-aupair";

export async function GET(req) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  try {
    const ctx = await contextoEtapa(guard.session.id);
    if (!ctx) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json({
      etapa: ctx.etapa,
      agencia: ctx.relacion ? { nombre: ctx.relacion.agencia_nombre } : null,
      historial: await historialDe(guard.session.id, { paraCandidata: true }),
    });
  } catch (err) {
    console.error("[GET historial]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
