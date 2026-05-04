import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function PATCH(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { id } = params;
  const { status } = await req.json();
  if (!["approved","rejected"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  try {
    await pool.query("UPDATE cotizaciones SET status=?, decided_at=NOW() WHERE id_cotizacion=?", [status, id]);
    return NextResponse.json({ ok: true });
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}