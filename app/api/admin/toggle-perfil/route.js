import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { id, perfil_habilitado } = await req.json();
    await dbAupair.query(
      "UPDATE usuarios SET perfil_habilitado = ? WHERE id = ?",
      [perfil_habilitado ? 1 : 0, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
  }
}