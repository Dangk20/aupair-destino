// app/api/admin/agencias/route.js
// Las agencias (usuarios con rol agencia) para elegir al aprobar una candidata.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const [agencias] = await dbAupair.query(
    "SELECT id, CONCAT_WS(' ', nombre, apellido) AS nombre, email FROM usuarios WHERE rol = 'agencia' ORDER BY nombre"
  );
  return NextResponse.json({ agencias });
}
