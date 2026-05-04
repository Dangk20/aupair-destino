import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
 
export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();
 
  const { id, tiene_acceso } = await req.json();
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
 
  await dbAupair.query(
    "UPDATE usuarios SET tiene_acceso = ? WHERE id = ?",
    [tiene_acceso ? 1 : 0, id]
  );
 
  return NextResponse.json({ ok: true });
}