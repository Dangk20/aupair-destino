import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import bcrypt from "bcryptjs";

export async function GET(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { id } = await params;

  try {
    const [asociadas] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE id = ? AND rol = 'asociada'",
      [id]
    );

    if (asociadas.length === 0) {
      return NextResponse.json({ error: "Asesora no encontrada" }, { status: 404 });
    }

    const [usuarias] = await dbAupair.query(
      `SELECT id, nombre, apellido, email, estado_agencia as estado
       FROM usuarios 
       WHERE asesora_asignada_id = ? AND rol NOT IN ('admin','asociada')
       ORDER BY created_at DESC`,
      [id]
    );

    const [[reuniones]] = await dbAupair.query(
      `SELECT COUNT(*) as total, 
        SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas
       FROM reuniones
       WHERE asesora_id = ?`,
      [id]
    );

    return NextResponse.json({
      ok: true,
      asociada: asociadas[0],
      usuarias,
      reuniones,
    });
  } catch (err) {
    console.error("[GET /api/admin/asociadas/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { id } = await params;

  try {
    const { nombre, apellido, email, password, telefono, ciudad, pais } = await req.json();

    const [existing] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE id = ? AND rol = 'asociada'", [id]
    );
    if (existing.length === 0) {
      return NextResponse.json({ error: "Asesora no encontrada" }, { status: 404 });
    }

    const queryParams = [nombre, apellido, email, telefono, ciudad, pais];
    let updateQuery = `
      UPDATE usuarios SET 
        nombre = COALESCE(?, nombre),
        apellido = COALESCE(?, apellido),
        email = COALESCE(?, email),
        telefono = COALESCE(?, telefono),
        ciudad = COALESCE(?, ciudad),
        pais = COALESCE(?, pais)
    `;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password = ?`;
      queryParams.push(hashedPassword);
    }

    updateQuery += ` WHERE id = ?`;
    queryParams.push(id);

    await dbAupair.query(updateQuery, queryParams);

    return NextResponse.json({ ok: true, mensaje: "Asesora actualizada correctamente" });
  } catch (err) {
    console.error("[PUT /api/admin/asociadas/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { id } = await params;

  try {
    const [existing] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE id = ? AND rol = 'asociada'", [id]
    );
    if (existing.length === 0) {
      return NextResponse.json({ error: "Asesora no encontrada" }, { status: 404 });
    }

    await dbAupair.query(
      "UPDATE usuarios SET asesora_asignada_id = NULL WHERE asesora_asignada_id = ?", [id]
    );
    await dbAupair.query("DELETE FROM reuniones WHERE asesora_id = ?", [id]);
    await dbAupair.query("DELETE FROM usuarios WHERE id = ?", [id]);

    return NextResponse.json({ ok: true, mensaje: "Asesora eliminada correctamente" });
  } catch (err) {
    console.error("[DELETE /api/admin/asociadas/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}