// ════════════════════════════════════════════════════════════════════════
// app/api/documentos/[id]/route.js — Descarga autenticada de un documento
//
// Único camino para ver un documento de una candidata. Autoriza a la dueña y a
// los roles administrativos; cualquier otra sesión recibe 403 y una sin sesión,
// 401. Reemplaza el acceso por archivo estático bajo /uploads, que no pedía
// autenticación alguna.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized, forbidden } from "@/lib/session-aupair";
import { resolverRuta, tipoContenido } from "@/lib/almacenamiento-archivos";

const ROLES_REVISORES = ["admin"];

export async function GET(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { id } = await params;
  const docId = Number(id);
  if (!docId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  try {
    const [[doc]] = await dbAupair.query(
      "SELECT id, usuario_id, nombre, url FROM documentos_usuario WHERE id = ?",
      [docId]
    );
    if (!doc) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });

    const esDuena   = Number(doc.usuario_id) === Number(session.id);
    const esRevisor = ROLES_REVISORES.includes(session.rol);
    if (!esDuena && !esRevisor) return forbidden();

    const ruta = resolverRuta(doc.url);
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
      // El registro existe pero el archivo no está en el almacenamiento
      // (documentos perdidos en un redespliegue). Es una condición conocida,
      // no un error inesperado: la UI la muestra como "archivo no disponible".
      return NextResponse.json(
        {
          error: "archivo_no_disponible",
          mensaje: "El archivo no está disponible. Pídele a la candidata que lo vuelva a cargar.",
        },
        { status: 404 }
      );
    }

    return new NextResponse(contenido, {
      status: 200,
      headers: {
        "Content-Type": tipoContenido(doc.url),
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.nombre || "documento")}"`,
        // Documentos personales: nunca en cachés compartidas.
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/documentos/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
