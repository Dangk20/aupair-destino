import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const [perfiles] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE rol = 'usuaria' ORDER BY created_at DESC"
    );
    return NextResponse.json({ perfiles });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error." }, { status: 500 });
  }
}