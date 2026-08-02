import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const [usuarias] = await dbAupair.query(`
      SELECT id, nombre, apellido, email, created_at
      FROM usuarios
      WHERE rol NOT IN ('admin','asociada') AND asesora_asignada_id IS NULL
      ORDER BY nombre ASC
    `);

    return NextResponse.json({ ok: true, usuarias });
  } catch (err) {
    console.error("[GET /api/admin/asociadas/asignar]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { usuarioId, asociadaId } = await req.json();

    if (!usuarioId || !asociadaId) {
      return NextResponse.json(
        { error: "usuarioId y asociadaId son obligatorios" },
        { status: 400 }
      );
    }

    const [usuario] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE id = ? AND rol NOT IN ('admin','asociada')",
      [usuarioId]
    );
    if (usuario.length === 0) {
      return NextResponse.json({ error: "Usuaria no encontrada" }, { status: 404 });
    }

    const [asociada] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE id = ? AND rol = 'asociada'",
      [asociadaId]
    );
    if (asociada.length === 0) {
      return NextResponse.json({ error: "Asesora no encontrada" }, { status: 404 });
    }

    await dbAupair.query(
      "UPDATE usuarios SET asesora_asignada_id = ? WHERE id = ?",
      [asociadaId, usuarioId]
    );

    return NextResponse.json({ ok: true, mensaje: "Usuaria asignada correctamente" });
  } catch (err) {
    console.error("[POST /api/admin/asociadas/asignar]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}