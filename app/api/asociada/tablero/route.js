// app/api/asociada/tablero/route.js
//
// GET  las candidatas que llegaron por el cupón de la asociada en sesión, con
//      su etapa (change `candidatas-por-cupon`). El mismo cálculo que el
//      tablero del admin y la agencia (lib/tablero-aupair.js). La asociada ve
//      el avance, no los datos: sin contacto ni fecha de nacimiento.
import { NextResponse } from "next/server";
import { requiereRol } from "@/lib/session-aupair";
import { tablero } from "@/lib/tablero-aupair";

export async function GET(req) {
  const guard = requiereRol(req, "asociada");
  if (guard.error) return guard.error;
  try {
    const filas = await tablero({ asociadaId: Number(guard.session.id) });
    const candidatas = filas.map(({ telefono, email, fecha_nacimiento, no_leidos, ...c }) => c);
    return NextResponse.json({ candidatas });
  } catch (err) {
    console.error("[GET /api/asociada/tablero]", err);
    return NextResponse.json({ error: "No se pudieron cargar tus candidatas." }, { status: 500 });
  }
}
