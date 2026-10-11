// app/api/dashboard/observaciones/route.js
//
// Las observaciones de la propia candidata: lo que el equipo le pidió corregir
// (abiertas) y lo que ya corrigió y espera revisión (atendidas). Las cerradas
// no se devuelven: para ella ya no hay nada que hacer.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereSesion } from "@/lib/session-aupair";

export async function GET(req) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const [observaciones] = await dbAupair.query(
      `SELECT id, tipo, parte, seccion, campo, tipo_doc, texto, estado, created_at, atendida_at
       FROM observaciones_perfil
       WHERE usuario_id = ? AND estado IN ('abierta','atendida')
       ORDER BY created_at ASC`,
      [session.id]
    );
    const [[u]] = await dbAupair.query(
      "SELECT parte1_enviada_at, parte2_enviada_at FROM usuarios WHERE id = ?",
      [session.id]
    );
    return NextResponse.json({
      observaciones,
      enviadas: { 1: u?.parte1_enviada_at || null, 2: u?.parte2_enviada_at || null },
    });
  } catch (err) {
    console.error("[GET /api/dashboard/observaciones]", err);
    return NextResponse.json({ error: "No se pudieron cargar las observaciones." }, { status: 500 });
  }
}
