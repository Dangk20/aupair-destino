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

    // Buscar usuario
    const [rows] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE email = ?", [email]
    );
// AGREGAR ESTO TEMPORALMENTE
console.log("Usuarios encontrados:", rows.length);
console.log("Usuario:", rows[0]);
console.log("Password ingresada:", password);
console.log("Hash en BD:", rows[0]?.password);


    if (rows.length === 0) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    }

    const user = rows[0];

    // Verificar contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
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