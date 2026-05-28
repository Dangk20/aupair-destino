import { NextResponse } from "next/server";        // ← falta
import dbAupair from "@/lib/db-aupair";  

export async function GET() {
  try {
    const [referentes] = await dbAupair.query(`
      SELECT
        r.id, r.nombre, r.email, r.codigo, r.porcentaje, r.estado,
        COUNT(DISTINCT rr.usuario_id) AS registradas,
        COUNT(DISTINCT CASE WHEN rr.pago_realizado = 1 THEN rr.usuario_id END) AS pagaron,
        COALESCE(SUM(CASE WHEN rr.pago_realizado = 1 THEN rr.monto_pagado ELSE 0 END), 0) AS ingresos_generados,
        COALESCE(SUM(CASE WHEN rr.pago_realizado = 1 THEN rr.monto_pagado * r.porcentaje / 100 ELSE 0 END), 0) AS comision_generada,
        CASE WHEN r.estado = 'Pagado'
          THEN COALESCE(SUM(CASE WHEN rr.pago_realizado = 1 THEN rr.monto_pagado * r.porcentaje / 100 ELSE 0 END), 0)
          ELSE 0 END AS comision_pagada
      FROM referidos r
      LEFT JOIN referido_registros rr ON rr.referido_id = r.id
      GROUP BY r.id
      ORDER BY ingresos_generados DESC
    `);

    const [[totales]] = await dbAupair.query(`
      SELECT
        SUM(registradas) AS total_registradas, SUM(pagaron) AS total_pagaron,
        SUM(ingresos) AS total_ingresos, SUM(comision) AS total_comision,
        SUM(comision_pagada) AS total_pagada
      FROM (
        SELECT
          COUNT(DISTINCT rr.usuario_id) AS registradas,
          COUNT(DISTINCT CASE WHEN rr.pago_realizado=1 THEN rr.usuario_id END) AS pagaron,
          COALESCE(SUM(CASE WHEN rr.pago_realizado=1 THEN rr.monto_pagado ELSE 0 END),0) AS ingresos,
          COALESCE(SUM(CASE WHEN rr.pago_realizado=1 THEN rr.monto_pagado * r.porcentaje/100 ELSE 0 END),0) AS comision,
          CASE WHEN r.estado='Pagado'
            THEN COALESCE(SUM(CASE WHEN rr.pago_realizado=1 THEN rr.monto_pagado * r.porcentaje/100 ELSE 0 END),0)
            ELSE 0 END AS comision_pagada
        FROM referidos r
        LEFT JOIN referido_registros rr ON rr.referido_id = r.id
        GROUP BY r.id
      ) t
    `);

    // ── Mapear campos para la página ──────────────────────────────────────
    const fmt = (n) => `$${Number(n||0).toLocaleString("es-CO")} USD`;

    const referidos = referentes.map(r => ({
      ...r,
      inicial:      r.nombre?.[0]?.toUpperCase() || "?",
      registradas:  Number(r.registradas),
      pagaron:      Number(r.pagaron),
      ingresos:     fmt(r.ingresos_generados),
      comision:     fmt(r.comision_generada),
      pagada:       fmt(r.comision_pagada),
      pendiente:    fmt(Math.max(Number(r.comision_generada) - Number(r.comision_pagada), 0)),
      ingresos_num:  Number(r.ingresos_generados),
      comision_num:  Number(r.comision_generada),
      pagada_num:    Number(r.comision_pagada),
      pendiente_num: Math.max(Number(r.comision_generada) - Number(r.comision_pagada), 0),
    }));

    // ← Este es el único return, al final
    return NextResponse.json({ referidos, totales: totales || {} });

  } catch (err) {
    console.error("[GET /api/admin/referidos]", err.message);
    return NextResponse.json({ referentes: [], totales: {}, error: err.message });
  }
}
export async function POST(req) {
  try {
    const { nombre, email, codigo, porcentaje } = await req.json();

    if (!nombre || !codigo)
      return NextResponse.json({ error: "Nombre y código son requeridos" }, { status: 400 });

    const [res] = await dbAupair.query(
      "INSERT INTO referidos (nombre, email, codigo, porcentaje, estado) VALUES (?, ?, ?, ?, 'Pendiente')",
      [nombre, email || null, codigo.toUpperCase(), porcentaje || 10]
    );

    return NextResponse.json({ ok: true, id: res.insertId });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return NextResponse.json({ error: "Ese código ya existe" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}