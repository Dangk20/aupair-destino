// app/api/agencia/candidatas/[id]/documentos/route.js
// Los documentos de una candidata, para su agencia: sólo lectura. Cada uno se
// abre por /api/documentos/[id], que también verifica la relación.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereRol } from "@/lib/session-aupair";
import { candidataDeAgencia } from "@/lib/agencia-aupair";
import { archivoDisponible } from "@/lib/almacenamiento-archivos";

export async function GET(req, { params }) {
  const guard = requiereRol(req, "agencia");
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    if (!(await candidataDeAgencia(guard.session.id, id))) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }
    const [filas] = await dbAupair.query(
      `SELECT id, tipo_doc, nombre, url, tamano_kb, estado, created_at
       FROM documentos_usuario WHERE usuario_id = ? ORDER BY created_at DESC`,
      [id]
    );
    const docs = await Promise.all(filas.map(async (d) => ({
      ...d, url: `/api/documentos/${d.id}`, disponible: await archivoDisponible(d.url),
    })));
    return NextResponse.json({ docs });
  } catch (err) {
    console.error("[GET agencia documentos]", err);
    return NextResponse.json({ error: "No se pudieron cargar los documentos." }, { status: 500 });
  }
}
