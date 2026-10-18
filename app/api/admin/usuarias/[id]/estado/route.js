// PUT /api/admin/usuarias/[id]/estado — Desactivar o reactivar una cuenta
// (change usuarios-administracion). Desactivada: no inicia sesión, sale del
// panel en su siguiente carga y no usa ninguna sección. Sus datos, ventas e
// historial se conservan. Nadie se desactiva a sí mismo ni deja el sistema
// sin un admin activo.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { adminsActivosSin } from "@/lib/usuarios-admin";

export async function PUT(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const { activa } = await req.json().catch(() => ({}));
    if (typeof activa !== "boolean") return NextResponse.json({ error: "Falta `activa`." }, { status: 400 });

    const [[u]] = await dbAupair.query("SELECT id, rol FROM usuarios WHERE id = ?", [id]);
    if (!u) return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });

    if (!activa) {
      if (Number(u.id) === Number(guard.session.id))
        return NextResponse.json({ error: "No puedes desactivar tu propia cuenta." }, { status: 400 });
      if (u.rol === "admin" && (await adminsActivosSin(u.id)) === 0)
        return NextResponse.json({ error: "Es el único admin activo: el sistema se quedaría sin administración." }, { status: 400 });
    }

    await dbAupair.query("UPDATE usuarios SET cuenta_activa = ? WHERE id = ?", [activa ? 1 : 0, u.id]);
    return NextResponse.json({ ok: true, cuenta_activa: activa ? 1 : 0 });
  } catch (err) {
    console.error("[PUT /api/admin/usuarias/[id]/estado]", err);
    return NextResponse.json({ error: "No se pudo cambiar el estado." }, { status: 500 });
  }
}
