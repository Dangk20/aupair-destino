// app/api/codigos-promo/validar/route.js
// Ruta pública — valida un código antes de pagar
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { precioCupo, precioConCodigo, SIN_PRECIO } from "@/lib/ventas-aupair";

export async function POST(req) {
  const { codigo } = await req.json();
  if (!codigo) return NextResponse.json({ error: "Falta código" }, { status: 400 });

  const [rows] = await dbAupair.query(`
    SELECT * FROM codigos_promo
    WHERE codigo = ? AND activo = 1
  `, [codigo.toUpperCase().trim()]);

  if (!rows.length)
    return NextResponse.json({ error: "Código no válido o inactivo" }, { status: 404 });

  const c = rows[0];

  // Verificar expiración
  if (c.fecha_expiracion && new Date(c.fecha_expiracion) < new Date())
    return NextResponse.json({ error: "Este código ha expirado" }, { status: 400 });

  // Verificar usos máximos
  if (c.usos_max !== null && c.usos_actuales >= c.usos_max)
    return NextResponse.json({ error: "Este código ya alcanzó su límite de usos" }, { status: 400 });

  // El precio con el cupón sale del precio del cupo configurado (R9).
  const precio = precioConCodigo(c, await precioCupo());
  if (!precio) return NextResponse.json({ error: SIN_PRECIO }, { status: 409 });

  return NextResponse.json({
    ok: true,
    codigo: c.codigo,
    precio_final: precio.monto,
    moneda: precio.moneda,
    descuento_porcentaje: c.descuento_porcentaje,
    descripcion: c.descripcion,
    usos_restantes: c.usos_max ? c.usos_max - c.usos_actuales : null,
  });
}