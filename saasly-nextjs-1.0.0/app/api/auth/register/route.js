import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { fullName, lastName, companyName, nit, phone, country, city, email, password } = await req.json();

    // Validar campos requeridos
    if (!fullName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Full name, last name, email and password are required." }, { status: 400 });
    }

    // Verificar si el email ya existe
    const [existing] = await db.query("SELECT id_usuario FROM usuarios WHERE email = ?", [email]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    // Obtener rol por defecto: 'Admin Empresa'
    const [roles] = await db.query("SELECT id_rol FROM roles WHERE nombre_rol = 'Admin Empresa' LIMIT 1");
    if (roles.length === 0) {
      return NextResponse.json({ error: "Default role not found. Please seed the roles table." }, { status: 500 });
    }
    const id_rol = roles[0].id_rol;

    // Obtener plan activo más barato (free o trial)
    const [planes] = await db.query("SELECT id FROM planes WHERE estado = 'activo' ORDER BY precio_mensual ASC LIMIT 1");
    const id_plan = planes.length > 0 ? planes[0].id : null;

    // Crear empresa
    const direccion = [city, country].filter(Boolean).join(", ") || null;
    const [empresaResult] = await db.query(
      `INSERT INTO empresas (nombre, nit, email, telefono, direccion, id_plan, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'activa')`,
      [companyName || `${fullName} ${lastName}'s Company`, nit || null, email, phone || null, direccion, id_plan]
    );
    const id_empresa = empresaResult.insertId;

    // Crear suscripción si hay plan
    if (id_plan) {
      const today = new Date().toISOString().split("T")[0];
      const fechaFin = new Date();
      fechaFin.setFullYear(fechaFin.getFullYear() + 1);
      await db.query(
        `INSERT INTO suscripciones (id_empresa, id_plan, fecha_inicio, fecha_fin, estado)
         VALUES (?, ?, ?, ?, 'activa')`,
        [id_empresa, id_plan, today, fechaFin.toISOString().split("T")[0]]
      );
    }

    // Encriptar contraseña
    const password_hash = await bcrypt.hash(password, 12);

    // Crear usuario
    await db.query(
      `INSERT INTO usuarios (id_empresa, id_rol, nombre, apellido, email, password_hash, telefono, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [id_empresa, id_rol, fullName, lastName, email, password_hash, phone || null]
    );

    return NextResponse.json({ message: "Account created successfully." }, { status: 201 });

  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}