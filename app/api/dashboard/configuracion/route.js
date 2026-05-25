// app/api/dashboard/configuracion/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import bcrypt from "bcryptjs";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const [[u]] = await dbAupair.query(
      `SELECT id, nombre, apellido, email, telefono, fecha_nacimiento, ciudad, pais,
              zona_horaria, formato_fecha, tema_plataforma, idioma_plataforma,
              privacidad_perfil, compartir_progreso,
              notif_email, notif_plataforma, notif_mensajes, notif_reuniones,
              foto_url, created_at
       FROM usuarios WHERE id = ?`,
      [session.id]
    );
    if (!u) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    delete u.password;
    return NextResponse.json({ config: u });
  } catch (err) {
    console.error("[GET configuracion]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const { accion } = body;

    /* ── Cambiar contraseña ── */
    if (accion === "cambiar_password") {
      const { password_actual, password_nuevo } = body;
      if (!password_actual || !password_nuevo)
        return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
      if (password_nuevo.length < 8)
        return NextResponse.json({ error: "Mínimo 8 caracteres" }, { status: 400 });

      const [[u]] = await dbAupair.query("SELECT password FROM usuarios WHERE id = ?", [session.id]);
      const ok = await bcrypt.compare(password_actual, u.password);
      if (!ok) return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 });

      const hash = await bcrypt.hash(password_nuevo, 12);
      await dbAupair.query("UPDATE usuarios SET password = ? WHERE id = ?", [hash, session.id]);
      return NextResponse.json({ ok: true });
    }

    /* ── Eliminar cuenta ── */
    if (accion === "eliminar_cuenta") {
      const { password_confirm } = body;
      const [[u]] = await dbAupair.query("SELECT password FROM usuarios WHERE id = ?", [session.id]);
      const ok = await bcrypt.compare(password_confirm, u.password);
      if (!ok) return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 400 });
      await dbAupair.query("DELETE FROM usuarios WHERE id = ?", [session.id]);
      return NextResponse.json({ ok: true, eliminado: true });
    }

    /* ── Actualizar campos generales ── */
    const CAMPOS_PERMITIDOS = [
      "nombre","apellido","telefono","fecha_nacimiento","ciudad","pais",
      "zona_horaria","formato_fecha","tema_plataforma","idioma_plataforma",
      "privacidad_perfil","compartir_progreso",
      "notif_email","notif_plataforma","notif_mensajes","notif_reuniones",
    ];

    const sets   = [];
    const values = [];

    for (const [campo, valor] of Object.entries(body)) {
      if (campo === "accion") continue;
      if (!CAMPOS_PERMITIDOS.includes(campo)) continue;
      sets.push(`${campo} = ?`);
      values.push(valor === "" ? null : valor);
    }

    if (sets.length === 0)
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });

    values.push(session.id);
    await dbAupair.query(`UPDATE usuarios SET ${sets.join(", ")} WHERE id = ?`, values);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT configuracion]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}