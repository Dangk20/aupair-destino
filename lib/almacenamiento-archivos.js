// ════════════════════════════════════════════════════════════════════════
// lib/almacenamiento-archivos.js — Dónde viven los archivos subidos y cómo se leen
//
// Cubre los documentos de las candidatas y los recursos que el equipo sube a
// las sesiones. Ninguno va en public/. Dos razones:
//   1. Seguridad: bajo public/ el pasaporte o la cédula de una candidata quedan
//      accesibles a cualquiera con el enlace (middleware.js salta toda ruta con
//      punto, así que nunca pide sesión).
//   2. Producción: el servidor standalone de Next resuelve los estáticos de
//      public/ a partir del build, así que los archivos escritos en runtime
//      devuelven 404 — que es exactamente lo que pasó en el VPS.
//
// Se guardan en UPLOADS_DIR (por defecto <cwd>/data/uploads), montado como
// volumen en producción, y se sirven por /api/documentos/[id], que exige sesión.
//
// La columna `url` de cada tabla guarda una REFERENCIA RELATIVA dentro de esa
// raíz: `documentos/<usuario_id>/<archivo>` o `recursos/<archivo>`.
// ════════════════════════════════════════════════════════════════════════
import path from "path";
import { mkdir, writeFile, unlink, access } from "fs/promises";
import { constants } from "fs";

/** Raíz del almacenamiento de archivos. */
export function raizAlmacenamiento() {
  return process.env.UPLOADS_DIR || path.join(process.cwd(), "data", "uploads");
}

/**
 * Normaliza lo que venga guardado en documentos_usuario.url a una referencia
 * relativa. Acepta el formato viejo (`/uploads/documentos/15/x.pdf`) para que
 * los registros previos a la migración sigan resolviéndose.
 * Devuelve null si la referencia es inutilizable.
 */
export function normalizarReferencia(url) {
  if (!url || typeof url !== "string") return null;
  let ref = url.trim();
  if (!ref) return null;

  // Formato viejo: /uploads/documentos/... o uploads/documentos/...
  ref = ref.replace(/^\/+/, "");
  if (ref.startsWith("uploads/")) ref = ref.slice("uploads/".length);

  // Un data-URI o una URL externa no son archivos de este almacenamiento.
  if (/^[a-z]+:/i.test(ref)) return null;

  return ref;
}

/**
 * Resuelve una referencia a ruta absoluta dentro del almacenamiento.
 * Devuelve null si la ruta resuelta se sale de la raíz (defensa contra `..`
 * o rutas absolutas inyectadas en la referencia).
 */
export function resolverRuta(referencia) {
  const ref = normalizarReferencia(referencia);
  if (!ref) return null;

  const raiz = path.resolve(raizAlmacenamiento());
  const destino = path.resolve(raiz, ref);

  if (destino !== raiz && !destino.startsWith(raiz + path.sep)) return null;
  return destino;
}

/** ¿El archivo de esta referencia existe y es legible? */
export async function archivoDisponible(referencia) {
  const ruta = resolverRuta(referencia);
  if (!ruta) return false;
  try {
    await access(ruta, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Guarda un archivo y devuelve su referencia relativa.
 * @param {string[]} carpeta  segmentos bajo la raíz (ej. ["documentos","15"])
 * @param {string}   prefijo  prefijo del nombre (tipo de documento, marca, …)
 * @returns {Promise<string>} referencia relativa
 */
export async function guardarArchivo({ carpeta, prefijo, nombreOriginal, buffer }) {
  const ext = path.extname(nombreOriginal || "").toLowerCase();
  const base = String(prefijo || "archivo").replace(/[^a-zA-Z0-9._-]/g, "_");
  const archivo = `${base}_${Date.now()}${ext}`;
  const referencia = path.posix.join(...carpeta.map(String), archivo);

  const destino = resolverRuta(referencia);
  if (!destino) throw new Error("Referencia de archivo inválida");

  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, buffer);

  return referencia;
}

/** Guarda el documento de una candidata. */
export async function guardarDocumento({ usuarioId, tipoDoc, nombreOriginal, buffer }) {
  return guardarArchivo({
    carpeta: ["documentos", usuarioId],
    prefijo: tipoDoc,
    nombreOriginal,
    buffer,
  });
}

/** Borra un archivo. No falla si ya no está. */
export async function borrarArchivo(referencia) {
  const ruta = resolverRuta(referencia);
  if (!ruta) return;
  await unlink(ruta).catch(() => {});
}

/** Alias por legibilidad en las rutas de documentos. */
export const borrarDocumento = borrarArchivo;

/** Tipo de contenido a partir de la extensión (sólo los formatos aceptados). */
export function tipoContenido(referencia) {
  const ext = path.extname(referencia || "").toLowerCase();
  switch (ext) {
    case ".pdf":  return "application/pdf";
    case ".png":  return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".doc":  return "application/msword";
    case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:      return "application/octet-stream";
  }
}
