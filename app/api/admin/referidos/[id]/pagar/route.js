import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function POST(req, { params }) {
  // Ruta de administración: exige sesión con rol admin.
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  const { id } = await params;
  try {
    await dbAupair.query(
      "UPDATE referidos SET estado='Pagado' WHERE id=?",
      [id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}