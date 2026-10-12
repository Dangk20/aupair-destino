// app/api/admin/configuracion/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

// GET — obtener toda la configuración
export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

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
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const body = await req.json();

    // R9: el precio del cupo es un entero positivo en pesos, o nada.
    if ("precio_cupo_cop" in body && body.precio_cupo_cop !== "" && body.precio_cupo_cop !== null) {
      const n = Number(body.precio_cupo_cop);
      if (!Number.isInteger(n) || n <= 0) {
        return NextResponse.json({ error: "El precio del cupo debe ser un número entero de pesos, mayor que cero." }, { status: 400 });
      }
    }

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