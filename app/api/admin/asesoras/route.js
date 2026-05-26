// app/api/admin/asesoras/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const [rows] = await dbAupair.query(`
    SELECT id, nombre, apellido, email, foto_url
    FROM usuarios
    WHERE rol = 'asociada'
    ORDER BY nombre ASC
  `);

  return NextResponse.json({ usuarias: rows });
}