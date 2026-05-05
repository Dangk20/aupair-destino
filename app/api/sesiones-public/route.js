import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";

// API pública — no requiere autenticación
export async function GET() {
  try {
    const [sesiones] = await dbAupair.query(
      "SELECT id, titulo, descripcion, orden, es_gratis FROM sesiones ORDER BY orden ASC"
    );
    return NextResponse.json({ sesiones });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ sesiones: [] }, { status: 500 });
  }
}