// app/api/admin/aprobar-evaluacion/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function PUT(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { usuario_id, aprobada } = await req.json();
    if (!usuario_id) {
      return NextResponse.json({ error: "usuario_id es requerido" }, { status: 400 });
    }

    await dbAupair.query(
      "UPDATE usuarios SET evaluacion_aprobada = ? WHERE id = ?",
      [aprobada ? 1 : 0, usuario_id]
    );

    return NextResponse.json({
      ok: true,
      mensaje: aprobada ? "Evaluación aprobada" : "Aprobación removida",
    });
  } catch (err) {
    console.error("[PUT /api/admin/aprobar-evaluacion]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}