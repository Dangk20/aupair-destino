import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereRol } from "@/lib/session-aupair";

export async function PUT(req) {
  const guard = requiereRol(req, "asociada");
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { nombre, apellido, telefono, ciudad, pais } = await req.json();

    // Validar que al menos un campo esté presente
    if (!nombre && !apellido && !telefono && !ciudad && !pais) {
      return NextResponse.json(
        { error: "Debe proporcionar al menos un campo para actualizar" },
        { status: 400 }
      );
    }

    // Actualizar perfil
    await dbAupair.query(`
      UPDATE usuarios SET 
        nombre = COALESCE(?, nombre),
        apellido = COALESCE(?, apellido),
        telefono = COALESCE(?, telefono),
        ciudad = COALESCE(?, ciudad),
        pais = COALESCE(?, pais),
        updated_at = NOW()
      WHERE id = ?
    `, [nombre, apellido, telefono, ciudad, pais, session.id]);

    return NextResponse.json({
      ok: true,
      mensaje: "Perfil actualizado correctamente",
    });
  } catch (err) {
    console.error("[PUT /api/asociada/perfil]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
