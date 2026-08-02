import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import bcrypt from "bcryptjs";

// Comisión y precio por defecto del código que nace con cada asociada.
// El admin puede ajustarlos después desde /admin/codigos-promo.
const COMISION_DEFAULT = 20;
const PRECIO_CODIGO_DEFAULT = 29;

/* ── Genera un código único en codigos_promo (4 letras del nombre + 4 dígitos) ── */
async function generarCodigoUnico(nombre) {
  const base = (nombre || "REF")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) || "REF";

  let intento = 0;
  while (intento < 10) {
    const sufijo = Math.floor(1000 + Math.random() * 9000);
    const codigo = `${base}${sufijo}`;
    const [existing] = await dbAupair.query("SELECT id FROM codigos_promo WHERE codigo = ?", [codigo]);
    if (existing.length === 0) return codigo;
    intento++;
  }
  return `${base}${Date.now().toString().slice(-5)}`;
}

/* ── Asegura el código promo de la asociada (descuento + comisión anclada) ──
   Si ya tiene un código en codigos_promo lo devuelve; si no, lo crea y lo
   guarda también en usuarios.codigo_referido para la atribución del registro. */
async function asegurarCodigoPromo({ asociadaId, nombre, apellido }) {
  const [existing] = await dbAupair.query(
    "SELECT codigo FROM codigos_promo WHERE asociada_id = ? ORDER BY id LIMIT 1",
    [asociadaId]
  );
  if (existing.length > 0) return existing[0].codigo;

  const codigo = await generarCodigoUnico(nombre);
  await dbAupair.query(
    `INSERT INTO codigos_promo (codigo, precio_final, asociada_id, comision_porcentaje, descripcion, activo)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [codigo, PRECIO_CODIGO_DEFAULT, asociadaId, COMISION_DEFAULT, `Código de ${`${nombre} ${apellido}`.trim()}`]
  );
  await dbAupair.query(
    "UPDATE usuarios SET codigo_referido = ? WHERE id = ?",
    [codigo, asociadaId]
  );
  return codigo;
}

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const [asociadas] = await dbAupair.query(`
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono,
        u.ciudad,
        u.pais,
        u.foto_url,
        u.created_at,
        r.id as referido_id,
        COALESCE(
          (SELECT cp.codigo FROM codigos_promo cp WHERE cp.asociada_id = u.id ORDER BY cp.id LIMIT 1),
          r.codigo
        ) as codigo_referido,
        (SELECT cp.comision_porcentaje FROM codigos_promo cp WHERE cp.asociada_id = u.id ORDER BY cp.id LIMIT 1) as comision_porcentaje,
        r.porcentaje,
        r.estado as estado_referido,
        COUNT(DISTINCT rr.id) as referidas_totales,
        COUNT(DISTINCT CASE WHEN rr.pago_realizado = 1 THEN rr.id END) as referidas_pagaron
      FROM usuarios u
      LEFT JOIN referidos r ON r.email = u.email
      LEFT JOIN referido_registros rr ON rr.referido_id = r.id
      WHERE u.rol = 'asociada'
      GROUP BY u.id, r.id
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({ ok: true, asociadas });
  } catch (err) {
    console.error("[GET /api/admin/asociadas]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

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

    const [result] = await dbAupair.query(
      `INSERT INTO usuarios
       (nombre, apellido, email, password, rol, telefono, ciudad, pais, tiene_acceso, perfil_habilitado, created_at)
       VALUES (?, ?, ?, ?, 'asociada', ?, ?, ?, 1, 1, NOW())`,
      [nombre, apellido, email, hashedPassword, telefono || null, ciudad || null, pais || null]
    );

    const codigo_referido = await asegurarCodigoPromo({
      asociadaId: result.insertId, nombre, apellido,
    });

    return NextResponse.json({
      ok: true,
      id: result.insertId,
      codigo_referido,
      mensaje: "Asesora creada correctamente",
    });
  } catch (err) {
    console.error("[POST /api/admin/asociadas]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
