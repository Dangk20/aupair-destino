// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { enviarRecuperacionPassword } from "@/lib/notificaciones-aupair";
import crypto from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.destino-aupair.com";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

    const [[usuario]] = await dbAupair.query(
      "SELECT id, nombre FROM usuarios WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (!usuario) return NextResponse.json({ ok: true });

    const token = crypto.randomBytes(32).toString("hex");

    // ← Expiración calculada dentro de MySQL para evitar desfase de timezone
    await dbAupair.query(
      `UPDATE usuarios
       SET reset_token = ?,
           reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR)
       WHERE id = ?`,
      [token, usuario.id]
    );

    const link = `${APP_URL}/reset-password?token=${token}`;

    await enviarRecuperacionPassword({
      email,
      nombre: usuario.nombre,
      link,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password]", err.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}