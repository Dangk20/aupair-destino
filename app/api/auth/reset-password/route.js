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

    // ← Comparar expiración dentro de MySQL con NOW() para evitar timezone issues
    const [[usuario]] = await dbAupair.query(
      `SELECT id, nombre, email
       FROM usuarios
       WHERE reset_token = ?
         AND reset_token_expiry > NOW()`,
      [token]
    );

    if (!usuario) {
      // Debug: ver si existe el token aunque esté expirado
      const [[expirado]] = await dbAupair.query(
        "SELECT id, reset_token_expiry, NOW() as ahora FROM usuarios WHERE reset_token = ?",
        [token]
      );
      if (expirado) {
        console.error("[reset-password] Token expirado:", {
          expiry: expirado.reset_token_expiry,
          ahora: expirado.ahora,
        });
        return NextResponse.json(
          { error: "El enlace ya expiró. Solicita uno nuevo desde la página de inicio de sesión." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "El enlace es inválido. Solicita uno nuevo desde la página de inicio de sesión." },
        { status: 400 }
      );
    }

    // Hash nueva contraseña
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}