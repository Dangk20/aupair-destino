// app/api/admin/usuarias/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

/* ══════════════════════════════════════════════════════════════════════════
   GET  /api/admin/usuarias
   Lista todas las usuarias con progreso, acceso y perfil
══════════════════════════════════════════════════════════════════════════ */
export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    // Total de sesiones (para calcular porcentaje sin dividir por cero)
    const [[{ totalSes }]] = await dbAupair.query(
      "SELECT COUNT(*) AS totalSes FROM sesiones"
    );
    const total = Number(totalSes) || 1; // evitar división por cero

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
        u.created_at,
        COUNT(p.id)                              AS sesiones_completadas,
        ROUND(COUNT(p.id) / ? * 100)             AS porcentaje
      FROM usuarios u
      LEFT JOIN progreso_usuario p
        ON p.id_usuario = u.id AND p.completada = TRUE
      WHERE u.rol = 'usuaria'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `, [total]);

    return NextResponse.json({ usuarias, total_sesiones: total });

  } catch (err) {
    console.error("[GET /api/admin/usuarias]", err);
    return NextResponse.json(
      { error: "Error al obtener usuarias.", detalle: err.message },
      { status: 500 }
    );
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   PUT  /api/admin/usuarias
   Actualiza campos de una usuaria (tiene_acceso, perfil_habilitado, etc.)
   Body: { id, campo, valor }
   Ejemplo: { id: 5, campo: "tiene_acceso",      valor: true  }
            { id: 5, campo: "perfil_habilitado",  valor: true  }
══════════════════════════════════════════════════════════════════════════ */
export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const body = await req.json();
    const { id, campo, valor } = body;

    if (!id || !campo) {
      return NextResponse.json({ error: "id y campo son requeridos" }, { status: 400 });
    }

    // Solo permitir campos seguros para actualizar
    const CAMPOS_PERMITIDOS = ["tiene_acceso", "perfil_habilitado"];
    if (!CAMPOS_PERMITIDOS.includes(campo)) {
      return NextResponse.json({ error: "Campo no permitido" }, { status: 400 });
    }

    await dbAupair.query(
      `UPDATE usuarios SET ${campo} = ? WHERE id = ?`,
      [valor ? 1 : 0, id]
    );

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[PUT /api/admin/usuarias]", err);
    return NextResponse.json(
      { error: "Error al actualizar.", detalle: err.message },
      { status: 500 }
    );
  }
}