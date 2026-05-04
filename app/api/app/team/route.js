import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";
import bcrypt from "bcryptjs";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.estado, r.nombre_rol
       FROM usuarios u
       LEFT JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.id_empresa = ? ORDER BY u.nombre ASC`,
      [session.id_empresa]
    );
    return NextResponse.json(rows);
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { nombre, apellido, email, telefono, id_rol, password } = await req.json();
  if (!nombre || !email || !password) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  try {
    const [[role]] = await pool.query("SELECT id_rol FROM roles WHERE nombre_rol=?", [id_rol]);
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 400 });
    const hash = await bcrypt.hash(password, 12);
    const [r] = await pool.query(
      "INSERT INTO usuarios (id_empresa, id_rol, nombre, apellido, email, telefono, password_hash, estado) VALUES (?,?,?,?,?,?,?,'activo')",
      [session.id_empresa, role.id_rol, nombre, apellido, email, telefono||null, hash]
    );
    return NextResponse.json({ id_usuario: r.insertId }, { status: 201 });
  } catch(e) {
    if (e.code === "ER_DUP_ENTRY") return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}