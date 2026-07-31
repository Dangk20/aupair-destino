// app/api/admin/referidos/inscripciones/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function GET(req) {
  // Ruta de administración: exige sesión con rol admin.
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  const { searchParams } = new URL(req.url);
  const page  = parseInt(searchParams.get("page")  || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const q     = searchParams.get("q") || "";
  const offset = (page - 1) * limit;

  try {
    // Total para paginación
    const [[{ total }]] = await dbAupair.query(`
      SELECT COUNT(*) AS total FROM usuarios u WHERE u.rol = 'usuaria'
      ${q ? "AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.email LIKE ? OR u.codigo_referido LIKE ?)" : ""}
    `, q ? [`%${q}%`,`%${q}%`,`%${q}%`,`%${q}%`] : []);

    const [rows] = await dbAupair.query(`
      SELECT
        u.id,
        CONCAT(u.nombre, ' ', u.apellido)                    AS estudiante,
        u.nombre,
        u.apellido,
        u.email,
        u.foto_url,
        u.created_at                                         AS fecha_registro,
        u.tiene_acceso,
        u.codigo_referido,
        r.id                                                 AS referido_id,
        r.nombre                                             AS referido_por,
        LEFT(r.nombre, 1)                                    AS referido_inicial,
        r.porcentaje,
        rr.monto_pagado,
        rr.pago_realizado,
        COALESCE(rr.monto_pagado * r.porcentaje / 100, 0)   AS comision_generada,
        r.estado                                             AS estado_comision
      FROM usuarios u
      LEFT JOIN referidos r  ON r.codigo = u.codigo_referido
      LEFT JOIN referido_registros rr ON rr.usuario_id = u.id AND rr.referido_id = r.id
      WHERE u.rol = 'usuaria'
      ${q ? "AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.email LIKE ? OR u.codigo_referido LIKE ?)" : ""}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, q
      ? [`%${q}%`,`%${q}%`,`%${q}%`,`%${q}%`, limit, offset]
      : [limit, offset]
    );

    const inscripciones = rows.map(r => ({
      id:               r.id,
      estudiante:       r.estudiante,
      nombre:           r.nombre,
      apellido:         r.apellido,
      email:            r.email,
      foto_url:         r.foto_url,
      fecha_registro:   r.fecha_registro
        ? new Date(r.fecha_registro).toLocaleDateString("es-CO", { day:"2-digit", month:"2-digit", year:"numeric" })
        : "—",
      tiene_acceso:     r.tiene_acceso,
      estado_pago:      r.tiene_acceso ? "Pagada" : (r.codigo_referido ? "Registrada" : "Registrada"),
      codigo_utilizado: r.codigo_referido || null,
      referido_por:     r.referido_por   || "Directo / Orgánico",
      referido_inicial: r.referido_inicial || "—",
      porcentaje:       r.porcentaje || 0,
      paquete:          "Programa 12 semanas",
      monto_pagado:     r.monto_pagado > 0 ? `$${Number(r.monto_pagado).toLocaleString("en")} USD` : "$0 USD",
      comision_generada: r.comision_generada > 0
        ? `$${Number(r.comision_generada).toFixed(0)} USD`
        : "$0 USD",
      estado_comision:  r.estado_comision || (r.codigo_referido ? "Pendiente" : "N/A"),
    }));

    return NextResponse.json({
      inscripciones,
      total: Number(total),
      paginas: Math.ceil(Number(total) / limit),
      pagina: page,
    });
  } catch (err) {
    console.error("[GET inscripciones]", err.message);
    return NextResponse.json({ inscripciones:[], total:0, paginas:1, error:err.message });
  }
}