// app/api/agencia/candidatas/[id]/descargar/route.js
//
// El perfil de la candidata como un solo archivo —hoja de vida en PDF y sus
// documentos— para su agencia (R13). Es el mismo paquete que arma el admin;
// lo que cambia es el filtro: modo "agencia", sin lo interno del equipo.
import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import dbAupair from "@/lib/db-aupair";
import { requiereRol } from "@/lib/session-aupair";
import { perfilPublicable } from "@/lib/perfil";
import { armarPaquete } from "@/lib/paquete-perfil";
import { candidataDeAgencia } from "@/lib/agencia-aupair";

export async function GET(req, { params }) {
  const guard = requiereRol(req, "agencia");
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    if (!(await candidataDeAgencia(guard.session.id, id))) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }
    const [[fila]] = await dbAupair.query("SELECT * FROM usuarios WHERE id = ? AND rol = 'usuaria'", [id]);
    if (!fila) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    const [docs] = await dbAupair.query(
      `SELECT id, tipo_doc, nombre, url, created_at
       FROM documentos_usuario WHERE usuario_id = ? ORDER BY tipo_doc`,
      [id]
    );
    const { nombreArchivo, stream } = await armarPaquete(perfilPublicable(fila, "agencia"), docs);
    return new NextResponse(Readable.toWeb(stream), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[GET agencia descargar]", err);
    return NextResponse.json({ error: "No se pudo armar el paquete." }, { status: 500 });
  }
}
