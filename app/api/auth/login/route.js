import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbAupair from "@/lib/db-aupair";
import { createToken } from "@/lib/session-aupair";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son obligatorios." }, { status: 400 });
    }

    // Sólo las columnas que se usan. Hasta el 17 oct 2026 aquí se leía
    // `SELECT *` y se escribía en el log la contraseña escrita, la fila
    // completa (hash y tokens) y el hash: venía del commit inicial del
    // proveedor anterior (change usuarios-administracion).
    const [rows] = await dbAupair.query(
      "SELECT id, nombre, apellido, email, password, rol, tiene_acceso, cuenta_activa FROM usuarios WHERE email = ?",
      [String(email).toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    }

    const user = rows[0];

    // Verificar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    }

    // Cuenta desactivada por el admin. Se dice DESPUÉS de comprobar la
    // contraseña: a quien no la sabe no se le confirma que la cuenta existe.
    if (Number(user.cuenta_activa) === 0) {
      return NextResponse.json({ error: "Tu cuenta está desactivada. Escríbenos para reactivarla." }, { status: 403 });
    }

    // Crear token
    const token = createToken({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol || "usuaria",
      tiene_acceso: user.tiene_acceso,
    });

    // Redirige según rol
    let redirect = "/dashboard";
    if (user.rol === "admin") redirect = "/admin";
    if (user.rol === "asociada") redirect = "/asociada";
    if (user.rol === "agencia") redirect = "/agencia";

    const response = NextResponse.json({ ok: true, redirect });
    response.cookies.set("dap_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}