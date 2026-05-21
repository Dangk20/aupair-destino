// app/api/admin/usuarias/[id]/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function PUT(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    // ── FIX: await params (obligatorio en Next.js 16) ──────────────────────
    const { id } = await params;
    const body = await req.json();

    // ── Solo actualizar los campos que vienen en el body ───────────────────
    // Así si solo envías { tiene_acceso: true }, no toca nombre/email/etc.
    const CAMPOS_PERMITIDOS = {
      tiene_acceso:      v => [v ? 1 : 0],
      perfil_habilitado: v => [v ? 1 : 0],
      nombre:            v => [v],
      apellido:          v => [v],
      email:             v => [v],
    };

    const sets   = [];
    const values = [];

    for (const [campo, transform] of Object.entries(CAMPOS_PERMITIDOS)) {
      if (body[campo] !== undefined) {
        sets.push(`${campo} = ?`);
        values.push(...transform(body[campo]));
      }
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    values.push(id);
    await dbAupair.query(
      `UPDATE usuarios SET ${sets.join(", ")} WHERE id = ?`,
      values
    );

    // Devolver los valores actualizados para que el frontend los aplique al estado
    const [[updated]] = await dbAupair.query(
      "SELECT id, tiene_acceso, perfil_habilitado, nombre, apellido, email FROM usuarios WHERE id = ?",
      [id]
    );

    return NextResponse.json({ ok: true, usuario: updated });

  } catch (err) {
    console.error("[PUT /api/admin/usuarias/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}