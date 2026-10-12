// app/api/admin/perfiles/[id]/historial/route.js
// Etapa, score, agencia e historial completo (con lo interno y el autor).
import { NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/session-aupair";
import { historialDe, contextoEtapa } from "@/lib/historial-aupair";

export async function GET(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    const ctx = await contextoEtapa(Number(id));
    if (!ctx) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json({
      etapa: ctx.etapa, score: ctx.score,
      agencia: ctx.relacion ? { id: ctx.relacion.agencia_id, nombre: ctx.relacion.agencia_nombre, desde: ctx.relacion.etapa_desde } : null,
      decision: { valor: ctx.perfil.decision_dap, fecha: ctx.perfil.decision_dap_at, motivo: ctx.perfil.decision_dap_motivo },
      historial: await historialDe(Number(id)),
    });
  } catch (err) {
    console.error("[GET historial admin]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
