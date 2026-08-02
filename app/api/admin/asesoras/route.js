// app/api/admin/asesoras/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  const [rows] = await dbAupair.query(`
    SELECT id, nombre, apellido, email, foto_url
    FROM usuarios
    WHERE rol = 'asociada'
    ORDER BY nombre ASC
  `);

  return NextResponse.json({ usuarias: rows });
}