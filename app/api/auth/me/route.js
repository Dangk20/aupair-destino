import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session-aupair";
import dbAupair from "@/lib/db-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const [rows] = await dbAupair.query(
      "SELECT id, nombre, apellido, email, tiene_acceso, perfil_habilitado, vio_bienvenida, foto_url, ciudad, pais, created_at FROM usuarios WHERE id = ?",
      [session.id]
    );
    if (rows.length === 0) return NextResponse.json({ user: null }, { status: 404 });

    return NextResponse.json({ user: rows[0] });
  } catch (err) {
    console.error("Me error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}