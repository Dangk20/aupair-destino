// app/api/admin/toggle-perfil/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { id, perfil_habilitado } = await req.json();
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    await dbAupair.query(
      "UPDATE usuarios SET perfil_habilitado = ? WHERE id = ?",
      [perfil_habilitado ? 1 : 0, id]
    );

    // Verificar que realmente cambió
    const [[updated]] = await dbAupair.query(
      "SELECT perfil_habilitado FROM usuarios WHERE id = ?", [id]
    );

    return NextResponse.json({ ok: true, perfil_habilitado: updated.perfil_habilitado });
  } catch (err) {
    console.error("[toggle-perfil]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}