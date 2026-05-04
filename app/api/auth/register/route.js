import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbAupair from "@/lib/db-aupair";
import { createToken } from "@/lib/session-aupair";

export async function POST(req) {
  try {
    const { fullName, lastName, email, password } = await req.json();

    if (!fullName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    // Verificar si el email ya existe
    const [existing] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE email = ?", [email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const [result] = await dbAupair.query(
      "INSERT INTO usuarios (nombre, apellido, email, password, tiene_acceso) VALUES (?, ?, ?, ?, FALSE)",
      [fullName, lastName, email, hashedPassword]
    );

    const newUser = {
      id: result.insertId,
      nombre: fullName,
      apellido: lastName,
      email,
      rol: "usuaria",
      tiene_acceso: false,
    };

    // Crear token y cookie
    const token = createToken(newUser);
    const response = NextResponse.json({ ok: true, redirect: "/dashboard" });
    response.cookies.set("dap_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}