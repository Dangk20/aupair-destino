// app/api/dashboard/foto/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const { foto_url } = await req.json();

    if (!foto_url && foto_url !== "") {
      return NextResponse.json({ error: "foto_url requerida" }, { status: 400 });
    }

    // Validar que sea base64 de imagen o string vacío (para borrar)
    if (foto_url !== "" && !foto_url.startsWith("data:image/")) {
      return NextResponse.json({ error: "Formato de imagen no válido" }, { status: 400 });
    }

    await dbAupair.query(
      "UPDATE usuarios SET foto_url = ? WHERE id = ?",
      [foto_url || null, session.id]
    );

    return NextResponse.json({ ok: true, foto_url });
  } catch (err) {
    console.error("[POST /api/dashboard/foto]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}