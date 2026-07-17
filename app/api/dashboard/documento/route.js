// app/api/dashboard/documento/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

// Whitelist de campos permitidos — evita que se pueda sobreescribir cualquier columna
const CAMPOS_PERMITIDOS = ["cedula_frontal_url", "cedula_posterior_url"];

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const { campo, valor } = await req.json();

    if (!CAMPOS_PERMITIDOS.includes(campo)) {
      return NextResponse.json({ error: "Campo no permitido" }, { status: 400 });
    }

    await dbAupair.query(
      `UPDATE usuarios SET ${campo} = ? WHERE id = ?`,
      [valor || null, session.id]
    );

    return NextResponse.json({ ok: true, mensaje: "Documento guardado" });
  } catch (err) {
    console.error("[POST /api/dashboard/documento]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}