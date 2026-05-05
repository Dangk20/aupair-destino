import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  await dbAupair.query(
    "UPDATE usuarios SET vio_bienvenida = TRUE WHERE id = ?",
    [session.id]
  );
  return NextResponse.json({ ok: true });
}