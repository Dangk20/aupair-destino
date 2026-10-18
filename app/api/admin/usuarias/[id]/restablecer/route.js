// POST /api/admin/usuarias/[id]/restablecer — El admin envía el correo para
// restablecer la contraseña (change usuarios-administracion). Es el mismo
// flujo de «¿Olvidaste tu contraseña?», 1 hora de vigencia. Devuelve el link
// para que el admin lo comparta si el correo no llega.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { enviarRecuperacionPassword } from "@/lib/notificaciones-aupair";
import { linkDeContrasena } from "@/lib/usuarios-admin";

export async function POST(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const [[u]] = await dbAupair.query("SELECT id, nombre, email FROM usuarios WHERE id = ?", [id]);
    if (!u) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    const link = await linkDeContrasena(u.id, 1);
    await enviarRecuperacionPassword({ email: u.email, nombre: u.nombre, link });
    return NextResponse.json({ ok: true, link });
  } catch (err) {
    console.error("[POST /api/admin/usuarias/[id]/restablecer]", err);
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 500 });
  }
}
