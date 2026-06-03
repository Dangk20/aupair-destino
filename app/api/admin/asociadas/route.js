import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import bcrypt from "bcryptjs";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    // Query simple primero
    const [asociadas] = await dbAupair.query(`
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono,
        u.ciudad,
        u.pais,
        u.codigo_referido,
        u.created_at
      FROM usuarios u
      WHERE u.rol = 'asociada'
      ORDER BY u.created_at DESC
    `);

    // Después enriquecer con JOIN
    const result = await Promise.all(asociadas.map(async (asesora) => {
      // Contar usuarias asignadas
      const [[usuarias]] = await dbAupair.query(
        `SELECT COUNT(*) as count FROM usuarios WHERE asesora_asignada_id = ? AND rol = 'usuaria'`,
        [asesora.id]
      );

      // Obtener códigos de referidos
      const [referidos] = await dbAupair.query(
        `SELECT codigo FROM referidos WHERE email = ?`,
        [asesora.email]
      );

      return {
        ...asesora,
        usuarias_asignadas: usuarias?.count || 0,
        codigos_referidos_promo: referidos.map(r => r.codigo).join(', ') || null
      };
    }));

    return NextResponse.json({ ok: true, asociadas: result });
  } catch (err) {
    console.error("[GET /api/admin/asociadas]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { nombre, apellido, email, password, telefono, ciudad, pais } = await req.json();

    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, apellido, email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const [existing] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE email = ?", [email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar código de referido único para la asesora (primeras 3 letras + 4 números aleatorios)
    const codigoReferido = (nombre.substring(0, 3) + Math.random().toString().substring(2, 6)).toUpperCase();

    const [result] = await dbAupair.query(
      `INSERT INTO usuarios 
       (nombre, apellido, email, password, rol, telefono, ciudad, pais, codigo_referido, tiene_acceso, perfil_habilitado, created_at) 
       VALUES (?, ?, ?, ?, 'asociada', ?, ?, ?, ?, 1, 1, NOW())`,
      [nombre, apellido, email, hashedPassword, telefono||null, ciudad||null, pais||null, codigoReferido]
    );

    return NextResponse.json({ ok: true, id: result.insertId, codigo_referido: codigoReferido, mensaje: "Asesora creada correctamente" });
  } catch (err) {
    console.error("[POST /api/admin/asociadas]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}