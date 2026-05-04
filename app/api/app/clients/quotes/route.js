import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const id_cliente = session.id;
  try {
    const [rows] = await pool.query(
      `SELECT c.*, p.nombre as projectName FROM cotizaciones c
       JOIN proyectos p ON p.id_proyecto = c.id_proyecto
       WHERE p.id_cliente = ? ORDER BY c.created_at DESC`,
      [id_cliente]
    );
    return NextResponse.json(rows.map(r => ({
      id: r.id_cotizacion, projectName: r.projectName, status: r.status||"pending",
      priceNote: r.price_note, blueprintUrl: r.blueprint_url,
      shapes: (() => { try { return JSON.parse(r.shapes||"[]"); } catch { return []; } })(),
      sentAt: r.created_at, decidedAt: r.decided_at,
    })));
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}