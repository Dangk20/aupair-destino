// app/api/admin/usuarias/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const [[{ totalSes }]] = await dbAupair.query(
      "SELECT COUNT(*) AS totalSes FROM sesiones"
    );
    const total = Number(totalSes) || 1;

    const [usuarias] = await dbAupair.query(`
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.foto_url,
        u.ciudad,
        u.pais,
        u.tiene_acceso,
        u.perfil_habilitado,
        u.acceso_documentos,
        u.acceso_recursos,
        u.acceso_reuniones,
        u.acceso_mensajes,
        u.acceso_comunidad,
        u.created_at,
        u.codigo_referido,
        COUNT(p.id)                                        AS sesiones_completadas,
        ROUND(COUNT(p.id) / ? * 100)                       AS porcentaje,
        rr.monto_pagado,
        ROUND(rr.monto_pagado * ref.porcentaje / 100, 0)   AS comision_generada,
        ref.nombre                                         AS referente_nombre,
        ref.email                                          AS referente_email
      FROM usuarios u
      LEFT JOIN progreso_usuario p
        ON p.id_usuario = u.id AND p.completada = TRUE
      LEFT JOIN referido_registros rr
        ON rr.usuario_id = u.id AND rr.pago_realizado = 1
      LEFT JOIN referidos ref
        ON ref.id = rr.referido_id
      WHERE u.rol = 'usuaria'
      GROUP BY u.id, rr.monto_pagado, ref.porcentaje, ref.nombre, ref.email
      ORDER BY u.created_at DESC
    `, [total]);

    return NextResponse.json({ usuarias, total_sesiones: total });
  } catch (err) {
    console.error("[GET /api/admin/usuarias]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const body = await req.json();
    const { id, campo, valor } = body;

    if (!id || !campo)
      return NextResponse.json({ error: "id y campo son requeridos" }, { status: 400 });

    const CAMPOS_PERMITIDOS = [
      "tiene_acceso", "perfil_habilitado",
      "acceso_documentos", "acceso_recursos",
      "acceso_reuniones", "acceso_mensajes", "acceso_comunidad",
    ];
    if (!CAMPOS_PERMITIDOS.includes(campo))
      return NextResponse.json({ error: "Campo no permitido" }, { status: 400 });

    await dbAupair.query(
      `UPDATE usuarios SET ${campo} = ? WHERE id = ?`,
      [valor ? 1 : 0, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/admin/usuarias]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}