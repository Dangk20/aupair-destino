// app/api/admin/tablero/route.js
//
// Todas las candidatas con su etapa, score, agencia y desde cuándo están en la
// etapa. El cálculo vive en lib/tablero-aupair.js.
import { NextResponse } from "next/server";
import { requiereAdmin } from "@/lib/session-aupair";
import { tablero } from "@/lib/tablero-aupair";

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  try {
    return NextResponse.json({ candidatas: await tablero({ actor: { id: Number(guard.session.id), rol: guard.session.rol } }) });
  } catch (err) {
    console.error("[GET tablero]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
