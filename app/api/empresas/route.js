import { NextResponse } from "next/server";
import db from "@/lib/db-aupair";

export async function GET() {
  try {
    const [empresas] = await db.query(
      "SELECT id_empresa, nombre FROM empresas WHERE estado = 'activa' ORDER BY nombre ASC"
    );
    return NextResponse.json({ empresas });
  } catch (error) {
    console.error("Error fetching empresas:", error);
    return NextResponse.json({ empresas: [] }, { status: 500 });
  }
}