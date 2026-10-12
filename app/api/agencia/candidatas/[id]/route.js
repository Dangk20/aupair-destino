// app/api/agencia/candidatas/[id]/route.js
//
// La ficha de una candidata, para su agencia: el perfil filtrado en modo
// "agencia" (la presentación del equipo sí, lo interno no), su etapa y su
// línea de tiempo sin hechos internos. Ajena → 404.
import { NextResponse } from "next/server";
import { requiereRol } from "@/lib/session-aupair";
import { perfilPublicable } from "@/lib/perfil";
import { candidataDeAgencia } from "@/lib/agencia-aupair";
import { contextoEtapa, historialDe } from "@/lib/historial-aupair";

export async function GET(req, { params }) {
  const guard = requiereRol(req, "agencia");
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    if (!(await candidataDeAgencia(guard.session.id, id))) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }
    const ctx = await contextoEtapa(Number(id));
    return NextResponse.json({
      perfil: perfilPublicable(ctx.perfil, "agencia"),
      etapa: ctx.etapa,
      score: ctx.score,
      agencia: ctx.relacion?.agencia_nombre || null,
      historial: await historialDe(Number(id), { paraCandidata: true }),
    });
  } catch (err) {
    console.error("[GET /api/agencia/candidatas/[id]]", err);
    return NextResponse.json({ error: "No se pudo cargar la candidata." }, { status: 500 });
  }
}
