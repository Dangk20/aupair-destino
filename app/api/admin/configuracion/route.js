// app/api/admin/configuracion/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

// GET — obtener toda la configuración
export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const [rows] = await dbAupair.query("SELECT clave, valor FROM configuracion");
    const config = {};
    rows.forEach(r => { config[r.clave] = r.valor; });
    return NextResponse.json({ config });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — actualizar uno o varios campos
export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const body = await req.json();

    for (const [clave, valor] of Object.entries(body)) {
      await dbAupair.query(
        "INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?",
        [clave, String(valor), String(valor)]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}