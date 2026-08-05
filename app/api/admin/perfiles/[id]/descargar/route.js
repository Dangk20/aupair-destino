// app/api/admin/perfiles/[id]/descargar/route.js
//
// Entrega el perfil de una candidata como un solo archivo: su hoja de vida en
// PDF más los documentos que cargó.
//
// Este paquete contiene datos clínicos y de historial migratorio de una persona
// real. Es lo acordado —la agencia los evalúa—, y por eso la ruta exige admin
// sin excepción y no existe forma de obtenerla sin sesión: ni enlace público,
// ni token de un solo uso, ni nada adivinable.
import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { perfilPublicable } from "@/lib/perfil";
import { armarPaquete } from "@/lib/paquete-perfil";

export async function GET(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { id } = await params;

    const [[fila]] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE id = ? AND rol = 'usuaria'",
      [id]
    );
    if (!fila) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    // El mismo filtro de siempre. Aquí importa el doble: lo que quede en el
    // objeto es lo que puede acabar impreso en un PDF que sale de la
    // plataforma. `perfilPublicable` quita credenciales y testigos; la
    // valoración interna no está declarada en campos-perfil.js, así que el
    // generador no la recorre.
    const perfil = perfilPublicable(fila, "revision");

    const [docs] = await dbAupair.query(
      `SELECT id, tipo_doc, nombre, url, created_at
       FROM documentos_usuario WHERE usuario_id = ? ORDER BY tipo_doc`,
      [id]
    );

    const { nombreArchivo, stream } = await armarPaquete(perfil, docs);

    return new NextResponse(Readable.toWeb(stream), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/perfiles/[id]/descargar]", err);
    return NextResponse.json({ error: "No se pudo armar el paquete." }, { status: 500 });
  }
}
