import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import bcrypt from "bcryptjs";
import { tablero } from "@/lib/tablero-aupair";
import { perfilPublicable } from "@/lib/perfil";

export async function GET(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { id } = await params;

  try {
    const [asociadas] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE id = ? AND rol = 'asociada'",
      [id]
    );

    if (asociadas.length === 0) {
      return NextResponse.json({ error: "Asesora no encontrada" }, { status: 404 });
    }

    // Sus candidatas: las que llegaron por su cupón (change `candidatas-por-cupon`).
    const candidatas = await tablero({ asociadaId: Number(id), actor: { id: Number(session.id), rol: "admin" } });
    const [codigos] = await dbAupair.query(
      "SELECT id, codigo, activo FROM codigos_promo WHERE asociada_id = ? ORDER BY id", [id]
    );

    return NextResponse.json({
      ok: true,
      asociada: perfilPublicable(asociadas[0], "revision"),
      candidatas,
      codigos,
    });
  } catch (err) {
    console.error("[GET /api/admin/asociadas/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

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
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { id } = await params;

  try {
    const [existing] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE id = ? AND rol = 'asociada'", [id]
    );
    if (existing.length === 0) {
      return NextResponse.json({ error: "Asesora no encontrada" }, { status: 404 });
    }

    // Sus cupones siguen sirviendo como descuento, pero ya no generan comisión
    // a nadie: si no, apuntarían a un usuario que no existe.
    await dbAupair.query("UPDATE codigos_promo SET asociada_id = NULL WHERE asociada_id = ?", [id]);
    // Sus horarios y las reuniones agendadas en ellos se van con ella. La
    // reunión no tiene `asesora_id` (eso es de `disponibilidad`): el borrado
    // viejo apuntaba a una columna inexistente y nunca dejó borrar a nadie.
    await dbAupair.query(
      "DELETE r FROM reuniones r JOIN disponibilidad d ON d.id = r.disponibilidad_id WHERE d.asesora_id = ?", [id]
    );
    await dbAupair.query("DELETE FROM disponibilidad WHERE asesora_id = ?", [id]);
    await dbAupair.query("DELETE FROM usuarios WHERE id = ?", [id]);

    return NextResponse.json({ ok: true, mensaje: "Asesora eliminada correctamente" });
  } catch (err) {
    console.error("[DELETE /api/admin/asociadas/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}