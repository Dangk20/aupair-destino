import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";

export async function GET() {
  try {
    const [rows] = await dbAupair.query(`
      SELECT
        r.id, r.nombre, r.email, r.codigo, r.porcentaje, r.estado,
        LEFT(r.nombre, 1) AS inicial,
        COUNT(rr.id) AS registradas,
        COALESCE(SUM(rr.pago_realizado), 0) AS pagaron,
        COALESCE(SUM(rr.monto_pagado), 0) AS ingresos_raw,
        CONCAT('$', FORMAT(COALESCE(SUM(rr.monto_pagado),0), 0), ' USD') AS ingresos,
        CONCAT('$', FORMAT(COALESCE(SUM(rr.monto_pagado),0) * r.porcentaje / 100, 0), ' USD') AS comision,
        CASE WHEN r.estado = 'Pagado'
          THEN CONCAT('$', FORMAT(COALESCE(SUM(rr.monto_pagado),0) * r.porcentaje / 100, 0), ' USD')
          ELSE '$0 USD' END AS pagada,
        CASE WHEN r.estado = 'Pendiente'
          THEN CONCAT('$', FORMAT(COALESCE(SUM(rr.monto_pagado),0) * r.porcentaje / 100, 0), ' USD')
          ELSE '$0 USD' END AS pendiente
      FROM referidos r
      LEFT JOIN referido_registros rr ON rr.referido_id = r.id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);
    return NextResponse.json({ referidos: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { nombre, email, codigo, porcentaje } = await req.json();
    if (!nombre || !email || !codigo)
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    const [result] = await dbAupair.query(
      "INSERT INTO referidos (nombre, email, codigo, porcentaje) VALUES (?, ?, ?, ?)",
      [nombre, email, codigo.toUpperCase(), porcentaje || 20]
    );
    return NextResponse.json({ id: result.insertId, ok: true }, { status: 201 });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return NextResponse.json({ error: "Ese código ya existe" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}