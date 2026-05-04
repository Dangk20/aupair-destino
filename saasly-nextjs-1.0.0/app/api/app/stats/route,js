import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionFromRequest, unauthorized } from "@/lib/session";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const id_empresa = session.id_empresa;
  try {
    const [[active]]     = await pool.query("SELECT COUNT(*) as c FROM proyectos WHERE id_empresa=? AND estado='activo'",    [id_empresa]);
    const [[completed]]  = await pool.query("SELECT COUNT(*) as c FROM proyectos WHERE id_empresa=? AND estado='completado'",[id_empresa]);
    const [[onhold]]     = await pool.query("SELECT COUNT(*) as c FROM proyectos WHERE id_empresa=? AND estado='suspendido'",[id_empresa]);
    const [[cancelled]]  = await pool.query("SELECT COUNT(*) as c FROM proyectos WHERE id_empresa=? AND estado='cancelado'", [id_empresa]);
    const [[budget]]     = await pool.query("SELECT SUM(presupuesto) as total FROM proyectos WHERE id_empresa=?",            [id_empresa]);
    const [[team]]       = await pool.query("SELECT COUNT(*) as c FROM usuarios WHERE id_empresa=? AND estado='activo'",    [id_empresa]);
    const [[blueprints]] = await pool.query("SELECT COUNT(*) as c FROM documentos WHERE id_empresa=? AND estado='activo'",  [id_empresa]);
    return NextResponse.json({
      activeProjects: active.c,
      teamMembers:    team.c,
      blueprints:     blueprints.c,
      totalBudget:    budget.total || 0,
      byStatus: { activo: active.c, completado: completed.c, suspendido: onhold.c, cancelado: cancelled.c },
    });
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}