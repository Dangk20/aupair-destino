import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Buscar usuario con su rol y empresa
    const [rows] = await db.query(
      `SELECT u.*, r.nombre_rol, e.nombre AS nombre_empresa
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id_rol
       LEFT JOIN empresas e ON u.id_empresa = e.id_empresa
       WHERE u.email = ? AND u.estado = 'activo'
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = rows[0];

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.nombre_rol,
        id_empresa: user.id_empresa,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Guardar sesión en tabla sesiones
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const dispositivo = req.headers.get("user-agent") || "unknown";

    await db.query(
      `INSERT INTO sesiones (id_usuario, token, ip, dispositivo, fecha_expiracion)
       VALUES (?, ?, ?, ?, ?)`,
      [user.id_usuario, token, ip, dispositivo.substring(0, 255), fechaExpiracion]
    );

    // Actualizar ultimo_login
    await db.query("UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = ?", [user.id_usuario]);

    // Respuesta con cookie
    const response = NextResponse.json({
      message: "Login successful.",
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.nombre_rol,
        empresa: user.nombre_empresa,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}