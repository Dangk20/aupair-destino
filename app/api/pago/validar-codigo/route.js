// app/api/pago/validar-codigo/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair"; // ← único cambio

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const codigo = searchParams.get("codigo")?.toUpperCase();

  if (!codigo) return NextResponse.json({ valido: false });

  const [rows] = await dbAupair.query( // ← y aquí
    "SELECT id, nombre FROM referidos WHERE codigo = ?", [codigo]
  );

  if (rows.length === 0) {
    return NextResponse.json({ valido: false, mensaje: "Código no válido" });
  }

  return NextResponse.json({
    valido: true,
    referente: rows[0].nombre,
    precioFinal: 29,
  });
}