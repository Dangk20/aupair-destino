// app/api/admin/usuarios/[id]/cambiar-rol/route.js
//
// Cambia el rol de una cuenta (change usuarios-administracion). Ya no crea
// una fila en la tabla heredada `referidos` al pasar a asociada: las
// asociadas atribuyen ventas con códigos promo. Nadie cambia su propio rol ni
// deja el sistema sin un admin activo.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { ROLES, adminsActivosSin } from "@/lib/usuarios-admin";

export async function PUT(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const { nuevoRol } = await req.json().catch(() => ({}));
    if (!ROLES.includes(nuevoRol)) return NextResponse.json({ error: "Rol no válido." }, { status: 400 });

    const [[u]] = await dbAupair.query("SELECT id, rol FROM usuarios WHERE id = ?", [id]);
    if (!u) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    if (u.rol === nuevoRol) return NextResponse.json({ ok: true, mensaje: "Ya tenía ese rol." });

    if (Number(u.id) === Number(guard.session.id))
      return NextResponse.json({ error: "No puedes cambiar tu propio rol." }, { status: 400 });
    if (u.rol === "admin" && (await adminsActivosSin(u.id)) === 0)
      return NextResponse.json({ error: "Es el único admin activo: el sistema se quedaría sin administración." }, { status: 400 });

    await dbAupair.query("UPDATE usuarios SET rol = ? WHERE id = ?", [nuevoRol, u.id]);
    return NextResponse.json({ ok: true, mensaje: "Rol actualizado. Aplica en su próximo inicio de sesión." });
  } catch (err) {
    console.error("[PUT /api/admin/usuarios/[id]/cambiar-rol]", err);
    return NextResponse.json({ error: "No se pudo cambiar el rol." }, { status: 500 });
  }
}
