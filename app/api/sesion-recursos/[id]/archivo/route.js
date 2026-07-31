// ════════════════════════════════════════════════════════════════════════
// app/api/sesion-recursos/[id]/archivo/route.js
//
// Descarga autenticada de un recurso de sesión (el material que el equipo sube
// al curso). Mismo criterio que los documentos: nada de archivos servidos
// estáticamente desde public/ — el acceso al material es parte de lo que se
// paga, así que se verifica el permiso contra la BD, no contra el JWT.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized, forbidden } from "@/lib/session-aupair";
import { resolverRuta, tipoContenido } from "@/lib/almacenamiento-archivos";

export async function GET(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { id } = await params;
  const recursoId = Number(id);
  if (!recursoId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  try {
    const [[recurso]] = await dbAupair.query(
      "SELECT id, nombre, url FROM sesion_recursos WHERE id = ?",
      [recursoId]
    );
    if (!recurso) return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });

    // El admin siempre; la candidata necesita el permiso de recursos activo.
    if (session.rol !== "admin") {
      const [[perm]] = await dbAupair.query(
        "SELECT acceso_recursos FROM usuarios WHERE id = ?",
        [session.id]
      );
      if (!perm || perm.acceso_recursos !== 1) return forbidden();
    }

    const ruta = resolverRuta(recurso.url);
    if (!ruta) {
      return NextResponse.json(
        { error: "archivo_no_disponible", mensaje: "La referencia del archivo no es válida." },
        { status: 404 }
      );
    }

    let contenido;
    try {
      contenido = await readFile(ruta);
    } catch {
      return NextResponse.json(
        {
          error: "archivo_no_disponible",
          mensaje: "El archivo no está en el servidor. Vuelve a subirlo desde el panel.",
        },
        { status: 404 }
      );
    }

    return new NextResponse(contenido, {
      status: 200,
      headers: {
        "Content-Type": tipoContenido(recurso.url),
        "Content-Disposition": `inline; filename="${encodeURIComponent(recurso.nombre || "recurso")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/sesion-recursos/[id]/archivo]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
