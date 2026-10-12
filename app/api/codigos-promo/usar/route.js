// app/api/codigos-promo/usar/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import { precioCupo, precioConCodigo } from "@/lib/ventas-aupair";

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const { codigo } = await req.json();
    if (!codigo) return NextResponse.json({ error: "Falta código" }, { status: 400 });

    const [rows] = await dbAupair.query(
      "SELECT * FROM codigos_promo WHERE codigo = ? AND activo = 1",
      [codigo.toUpperCase().trim()]
    );

    if (!rows.length)
      return NextResponse.json({ error: "Código no válido" }, { status: 404 });

    const c = rows[0];

    // Guardar en el perfil del usuario — esto es lo más importante
    await dbAupair.query(
      "UPDATE usuarios SET codigo_promo_usado = ? WHERE id = ?",
      [c.codigo, session.id]
    );

    // El precio con el cupón sale del precio del cupo configurado (R9).
    const precio = precioConCodigo(c, await precioCupo());
    return NextResponse.json({ ok: true, precio_final: precio?.monto ?? null, moneda: precio?.moneda ?? null });

  } catch (err) {
    console.error("[usar codigo promo]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}