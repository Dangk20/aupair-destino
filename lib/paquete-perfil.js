// ════════════════════════════════════════════════════════════════════════
// lib/paquete-perfil.js — El perfil de una candidata, en un solo archivo
//
// Arma el ZIP que la clienta le envía a una agencia aliada: la hoja de vida en
// PDF más los documentos que cargó la candidata.
//
// Se escribe en FLUJO, no en memoria: cada documento admite hasta 10 MB y hay
// doce tipos, así que el techo teórico son 120 MB retenidos por petición en un
// VPS que también corre MySQL. Los archivos reales son mucho menores, pero el
// techo lo fija el límite de subida, no la costumbre.
// ════════════════════════════════════════════════════════════════════════

import path from "node:path";
import fs from "node:fs";
import archiver from "archiver";
import { generarCV } from "@/lib/cv-candidata";
import { DOCS_REQUERIDOS } from "@/lib/documentos";
import { resolverRuta, archivoDisponible } from "@/lib/almacenamiento-archivos";

/** Un texto apto para nombre de archivo: sin tildes, sin espacios, sin sorpresas. */
export function comoNombreDeArchivo(texto, fallback = "candidata") {
  const limpio = String(texto ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return limpio || fallback;
}

/** La etiqueta legible de un tipo de documento, o el propio tipo si no está declarado. */
function etiquetaDe(tipoDoc) {
  const d = DOCS_REQUERIDOS.find((r) => r.tipo === tipoDoc);
  return comoNombreDeArchivo(d?.label || tipoDoc, "documento");
}

/**
 * Arma el paquete de una candidata.
 *
 * @param {object} perfil  la fila de `usuarios`, ya filtrada por lib/perfil.js
 * @param {Array}  docs    filas de `documentos_usuario` con `tipo_doc` y `url`
 * @returns {{ nombreArchivo: string, stream: import('node:stream').Readable }}
 */
export async function armarPaquete(perfil, docs = []) {
  const base = comoNombreDeArchivo(`${perfil.nombre || ""}-${perfil.apellido || ""}`);
  const zip  = archiver("zip", { zlib: { level: 9 } });

  // El PDF se genera antes de empezar a escribir el ZIP: si el generador falla,
  // falla la petición entera y no una descarga a medias que el navegador ya
  // empezó a guardar.
  const pdf = await generarCV(perfil);
  zip.append(pdf, { name: `${base}-hoja-de-vida.pdf` });

  const perdidos = [];
  const usados   = new Map();   // para no repetir nombre si hay dos del mismo tipo

  for (const doc of docs) {
    const ruta = resolverRuta(doc.url);
    const hay  = ruta ? await archivoDisponible(doc.url) : false;

    if (!hay) {
      perdidos.push(`${doc.tipo_doc} (registrado el ${doc.created_at ? new Date(doc.created_at).toLocaleDateString("es-CO") : "—"})`);
      continue;
    }

    // El nombre sale del tipo, no de la columna `nombre`: en la base hay filas
    // cuyo nombre es la CADENA "null", de una carga antigua.
    //
    // La extensión sí se busca en los dos sitios. `guardarArchivo()` la toma
    // del nombre original, así que las cargas nuevas la traen en la referencia;
    // las viejas con nombre "null" se guardaron sin ninguna, y un archivo sin
    // extensión no lo abre nadie de doble clic.
    const ext = path.extname(ruta) || path.extname(String(doc.nombre ?? "")) || "";
    const etiqueta = etiquetaDe(doc.tipo_doc);
    const n = (usados.get(etiqueta) || 0) + 1;
    usados.set(etiqueta, n);
    const nombre = n === 1 ? `${etiqueta}${ext}` : `${etiqueta}-${n}${ext}`;

    zip.append(fs.createReadStream(ruta), { name: `documentos/${nombre}` });
  }

  // Un ZIP silenciosamente incompleto es peor que uno que avisa.
  if (perdidos.length) {
    zip.append(
      [
        "Documentos que no se pudieron incluir",
        "═════════════════════════════════════",
        "",
        "Estos documentos están registrados en la plataforma, pero su archivo ya",
        "no está en el servidor. Hay que pedirle a la candidata que los vuelva a",
        "cargar desde su panel.",
        "",
        ...perdidos.map((p) => `  · ${p}`),
        "",
      ].join("\n"),
      { name: "LEEME.txt" }
    );
  }

  zip.finalize();

  return { nombreArchivo: `perfil-${base}-${perfil.id}.zip`, stream: zip };
}
