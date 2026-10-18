// app/api/admin/usuarias/route.js — Usuarios: las cuentas (change usuarios-administracion)
//
// GET  sólo datos de la cuenta: quién es, su rol, si está activa y qué
//      secciones tiene. Pagos, códigos y progreso viven en Ventas, Códigos
//      promo y Candidatas. Antes cruzaba las tablas heredadas de referidos y
//      repetía filas (por eso «Todos» no cuadraba con «Usuarios totales»).
// POST crea una cuenta con su rol. La persona recibe un correo para crear su
//      contraseña: el admin nunca la conoce.
//
// El PUT que encendía `tiene_acceso` directo se retiró: el acceso pagado sólo
// se da por Ventas (lib/ventas-aupair.js).
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { enviarInvitacionCuenta } from "@/lib/notificaciones-aupair";
import { ROLES, linkDeContrasena, correoValido } from "@/lib/usuarios-admin";

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const [usuarias] = await dbAupair.query(`
      SELECT id, nombre, apellido, email, telefono, foto_url, ciudad, pais, rol,
             cuenta_activa, tiene_acceso, perfil_habilitado,
             acceso_documentos, acceso_recursos, acceso_reuniones, acceso_mensajes, acceso_comunidad,
             created_at
      FROM usuarios
      ORDER BY created_at DESC, id DESC
    `);
    return NextResponse.json({ usuarias });
  } catch (err) {
    console.error("[GET /api/admin/usuarias]", err);
    return NextResponse.json({ error: "No se pudieron cargar los usuarios." }, { status: 500 });
  }
}

export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const b = await req.json().catch(() => ({}));
    const nombre   = String(b.nombre || "").trim();
    const apellido = String(b.apellido || "").trim();
    const email    = String(b.email || "").trim().toLowerCase();
    const telefono = String(b.telefono || "").trim() || null;
    const rol      = String(b.rol || "usuaria");

    if (!nombre) return NextResponse.json({ error: "Escribe el nombre." }, { status: 400 });
    if (!correoValido(email)) return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
    if (!ROLES.includes(rol)) return NextResponse.json({ error: "Rol no válido." }, { status: 400 });

    const [[existe]] = await dbAupair.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existe) return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });

    // Una contraseña que nadie conoce: la persona pone la suya con el link.
    const hash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
    const [r] = await dbAupair.query(
      `INSERT INTO usuarios (nombre, apellido, email, telefono, password, rol, cuenta_activa, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
      [nombre, apellido, email, telefono, hash, rol]
    );

    const link = await linkDeContrasena(r.insertId, 72);
    await enviarInvitacionCuenta({ email, nombre, link, rol });
    return NextResponse.json({ ok: true, id: r.insertId, link });
  } catch (err) {
    console.error("[POST /api/admin/usuarias]", err);
    return NextResponse.json({ error: "No se pudo crear la cuenta." }, { status: 500 });
  }
}
