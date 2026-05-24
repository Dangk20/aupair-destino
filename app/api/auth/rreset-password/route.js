// app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password)
      return NextResponse.json({ error: "Token y contraseña requeridos" }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "La contraseña debe tener mínimo 8 caracteres" }, { status: 400 });

    // Buscar usuario con token válido y no expirado
    const [[usuario]] = await dbAupair.query(
      `SELECT id, nombre, email
       FROM usuarios
       WHERE reset_token = ?
         AND reset_token_expiry > NOW()`,
      [token]
    );

    if (!usuario) {
      return NextResponse.json(
        { error: "El enlace es inválido o ya expiró. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const hash = await bcrypt.hash(password, 12);

    // Actualizar contraseña y limpiar token
    await dbAupair.query(
      `UPDATE usuarios
       SET password = ?, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = ?`,
      [hash, usuario.id]
    );

    return NextResponse.json({ ok: true, email: usuario.email });
  } catch (err) {
    console.error("[reset-password]", err.message);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}