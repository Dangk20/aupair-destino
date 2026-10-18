// app/api/dashboard/disponibilidad/route.js — Los cupos que la candidata puede
// reservar (change agenda-rango-bloques): libres, futuros en hora de Bogotá y
// de la agenda del equipo. La regla vive en lib/agenda-aupair.js · cuposLibres.
import { NextResponse } from "next/server";
import { requierePermiso } from "@/lib/session-aupair";
import { cuposLibres } from "@/lib/agenda-aupair";

export async function GET(req) {
  const guard = await requierePermiso(req, "reuniones");
  if (guard.error) return guard.error;
  try {
    return NextResponse.json({ cupos: await cuposLibres() });
  } catch (err) {
    console.error("[GET /api/dashboard/disponibilidad]", err);
    return NextResponse.json({ error: "No se pudo cargar la disponibilidad." }, { status: 500 });
  }
}
