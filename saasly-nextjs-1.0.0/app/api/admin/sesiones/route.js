import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
 
export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();
 
  const [sesiones] = await dbAupair.query(
    "SELECT * FROM sesiones ORDER BY orden ASC"
  );
  return NextResponse.json({ sesiones });
}
 
export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();
 
  const { id, titulo, descripcion, url_video } = await req.json();
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
 
  await dbAupair.query(
    "UPDATE sesiones SET titulo = ?, descripcion = ?, url_video = ? WHERE id = ?",
    [titulo, descripcion, url_video, id]
  );
 
  return NextResponse.json({ ok: true });
}