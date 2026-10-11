// ════════════════════════════════════════════════════════════════════════
// app/api/sesion-recursos/[id]/archivo/route.js
//
// Descarga autenticada de un recurso de sesión (el material que el equipo sube
// al curso). Mismo criterio que los documentos: nada de archivos servidos
// estáticamente desde public/.
//
// Quién descarga: quien puede ver el video de esa sesión (decisión de la
// clienta, R7). Antes exigía `acceso_recursos`, un permiso pagado, mientras
// los videos son gratis: la candidata veía la clase y recibía 403 al pedir su
// guía. El desbloqueo se calcula contra la BD con lib/curso-aupair.js, la
// misma regla que pinta el curso.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized, forbidden } from "@/lib/session-aupair";
import { resolverRuta, tipoContenido } from "@/lib/almacenamiento-archivos";
import { sesionVisible } from "@/lib/curso-aupair";
import path from "path";

/** "Guía de entrevista" + ".pdf", sin duplicar la extensión si ya la trae. */
function nombreDescarga(recurso) {
  const ext  = path.extname(recurso.url || "").toLowerCase();
  const base = (recurso.nombre || "recurso").trim();
  return ext && !base.toLowerCase().endsWith(ext) ? base + ext : base;
}

export async function GET(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { id } = await params;
  const recursoId = Number(id);
  if (!recursoId) return NextResponse.json({ error: "id inválido" }, { status: 400 });

  try {
    const [[recurso]] = await dbAupair.query(
      "SELECT id, sesion_id, nombre, url FROM sesion_recursos WHERE id = ?",
      [recursoId]
    );
    if (!recurso) return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 });

    // El admin siempre; las demás, si la sesión está desbloqueada para ellas.
    if (!(await sesionVisible(recurso.sesion_id, session))) return forbidden();

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
        // Adjunto: es material para guardar, no para abrir en la pestaña. El
        // nombre es el que le puso el admin, con la extensión del archivo.
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nombreDescarga(recurso))}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[GET /api/sesion-recursos/[id]/archivo]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
