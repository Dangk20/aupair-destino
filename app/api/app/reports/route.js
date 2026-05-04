import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const id_empresa = session.id_empresa;
  try {
    const [projects]    = await pool.query("SELECT * FROM proyectos WHERE id_empresa=? ORDER BY fecha_creacion DESC", [id_empresa]);
    const [[budget]]    = await pool.query("SELECT SUM(presupuesto) as total FROM proyectos WHERE id_empresa=?", [id_empresa]);
    const [[active]]    = await pool.query("SELECT COUNT(*) as c FROM proyectos WHERE id_empresa=? AND estado='activo'", [id_empresa]);
    const [[completed]] = await pool.query("SELECT COUNT(*) as c FROM proyectos WHERE id_empresa=? AND estado='completado'", [id_empresa]);
    return NextResponse.json({ projects, totalBudget: budget.total||0, totalSpent:0, activeCount: active.c, completedCount: completed.c });
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}