// app/api/admin/usuarias/[id]/route.js — Editar los datos de una cuenta.
//
// Sólo nombre, apellido, correo y teléfono (change usuarios-administracion).
// Antes aceptaba también `tiene_acceso` y `perfil_habilitado`: encender el
// acceso pagado es de Ventas, y las secciones van por toggle-acceso.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { correoValido } from "@/lib/usuarios-admin";

export async function PUT(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const b = await req.json().catch(() => ({}));
    const sets = [], valores = [];

    if (b.nombre !== undefined) {
      if (!String(b.nombre).trim()) return NextResponse.json({ error: "El nombre no puede quedar vacío." }, { status: 400 });
      sets.push("nombre = ?"); valores.push(String(b.nombre).trim());
    }
    if (b.apellido !== undefined) { sets.push("apellido = ?"); valores.push(String(b.apellido).trim()); }
    if (b.telefono !== undefined) { sets.push("telefono = ?"); valores.push(String(b.telefono).trim() || null); }
    if (b.email !== undefined) {
      const email = String(b.email).trim().toLowerCase();
      if (!correoValido(email)) return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
      const [[otro]] = await dbAupair.query("SELECT id FROM usuarios WHERE email = ? AND id <> ?", [email, id]);
      if (otro) return NextResponse.json({ error: "Ese correo ya es de otra cuenta." }, { status: 409 });
      sets.push("email = ?"); valores.push(email);
    }
    if (!sets.length) return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });

    valores.push(id);
    const [r] = await dbAupair.query(`UPDATE usuarios SET ${sets.join(", ")} WHERE id = ?`, valores);
    if (!r.affectedRows) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/admin/usuarias/[id]]", err);
    return NextResponse.json({ error: "No se pudo actualizar." }, { status: 500 });
  }
}
