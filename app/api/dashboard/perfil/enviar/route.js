// app/api/dashboard/perfil/enviar/route.js
//
// La candidata envía una parte de su perfil. Desde ese momento la parte queda
// cerrada: sólo se puede cambiar lo que el admin reabra con una observación
// (ver lib/observaciones-perfil.js). Se envía sólo una parte completa, con el
// mismo criterio que el formulario y la aprobación.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereSesion } from "@/lib/session-aupair";
import { parteCompleta, faltantesDeParte, invalidosDeParte } from "@/lib/campos-perfil";

export async function POST(req) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { parte } = await req.json().catch(() => ({}));
    const n = Number(parte);
    if (n !== 1 && n !== 2) {
      return NextResponse.json({ error: "parte debe ser 1 o 2" }, { status: 400 });
    }

    const [[u]] = await dbAupair.query("SELECT * FROM usuarios WHERE id = ?", [session.id]);
    if (!u) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    if (!parteCompleta(n, u)) {
      return NextResponse.json({
        error: "Completa todos los campos de la parte antes de enviarla.",
        faltantes: faltantesDeParte(n, u).map((c) => c.label),
        invalidos: invalidosDeParte(n, u).map((c) => `${c.label}: ${c.error}`),
      }, { status: 400 });
    }

    // Se conserva la primera fecha de envío: reenviar no la mueve.
    const col = n === 1 ? "parte1_enviada_at" : "parte2_enviada_at";
    await dbAupair.query(
      `UPDATE usuarios SET ${col} = COALESCE(${col}, NOW()) WHERE id = ?`,
      [session.id]
    );
    const [[fila]] = await dbAupair.query(`SELECT ${col} AS enviada_at FROM usuarios WHERE id = ?`, [session.id]);
    return NextResponse.json({ ok: true, parte: n, enviada_at: fila.enviada_at });
  } catch (err) {
    console.error("[POST /api/dashboard/perfil/enviar]", err);
    return NextResponse.json({ error: "No se pudo enviar." }, { status: 500 });
  }
}
