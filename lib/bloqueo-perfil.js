// ════════════════════════════════════════════════════════════════════════
// lib/bloqueo-perfil.js — Consultas del bloqueo del perfil enviado
//
// Las reglas están en lib/observaciones-perfil.js (sin base, compartidas con
// la ficha). Esto es lo que las rutas necesitan leer y escribir.
//
// Uso en una ruta que escribe el perfil de la candidata:
//
//   const bloqueo = await estadoBloqueo(session.id);
//   const cerrados = cambiosBloqueados(cambios, fila, bloqueo.enviadas, bloqueo.abiertas);
//   if (cerrados.length) return respuestaBloqueo(cerrados);
//   ... UPDATE ...
//   await atenderObservaciones(observacionesAtendidas(cambiados, bloqueo.abiertas));
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import {
  mensajeBloqueo, cambiosBloqueados, camposCambiados, observacionesAtendidas,
} from "@/lib/observaciones-perfil";

/** Qué partes envió la candidata y qué observaciones tiene abiertas. */
export async function estadoBloqueo(usuarioId) {
  const [[u]] = await dbAupair.query(
    "SELECT parte1_enviada_at, parte2_enviada_at FROM usuarios WHERE id = ?",
    [usuarioId]
  );
  const [abiertas] = await dbAupair.query(
    "SELECT * FROM observaciones_perfil WHERE usuario_id = ? AND estado = 'abierta'",
    [usuarioId]
  );
  return {
    enviadas: { 1: !!u?.parte1_enviada_at, 2: !!u?.parte2_enviada_at },
    abiertas,
  };
}

/** Pasa a "atendida" las observaciones indicadas (la candidata guardó su corrección). */
export async function atenderObservaciones(ids) {
  if (!ids?.length) return;
  await dbAupair.query(
    "UPDATE observaciones_perfil SET estado = 'atendida', atendida_at = NOW() WHERE id IN (?) AND estado = 'abierta'",
    [ids]
  );
}

/** 403 con los campos cerrados que la petición intentó cambiar. */
export function respuestaBloqueo(bloqueados) {
  return NextResponse.json(
    { error: mensajeBloqueo(bloqueados), bloqueados },
    { status: 403 }
  );
}

/**
 * La secuencia completa para una ruta que cambia columnas de la candidata:
 * lee su fila y su bloqueo, y decide.
 *
 *   const control = await controlarCambios(session.id, { telefono });
 *   if (control.error) return control.error;
 *   ... UPDATE ...
 *   await control.atender();
 *
 * @returns {Promise<{ error?: Response, atender: () => Promise<void> }>}
 */
export async function controlarCambios(usuarioId, cambios) {
  const [[fila]] = await dbAupair.query("SELECT * FROM usuarios WHERE id = ?", [usuarioId]);
  const bloqueo  = await estadoBloqueo(usuarioId);
  const cerrados = cambiosBloqueados(cambios, fila || {}, bloqueo.enviadas, bloqueo.abiertas);
  if (cerrados.length) return { error: respuestaBloqueo(cerrados), atender: async () => {} };
  const cambiados = camposCambiados(cambios, fila || {});
  return {
    atender: () => atenderObservaciones(observacionesAtendidas(cambiados, bloqueo.abiertas)),
  };
}

/**
 * Observaciones abiertas que reabren un documento ya cargado. Un documento
 * cargado está cerrado: quitarlo o reemplazarlo exige al menos una.
 */
export async function observacionesDeDocumento(usuarioId, tipoDoc) {
  const [filas] = await dbAupair.query(
    `SELECT id FROM observaciones_perfil
     WHERE usuario_id = ? AND tipo = 'documento' AND tipo_doc = ? AND estado = 'abierta'`,
    [usuarioId, tipoDoc]
  );
  return filas.map((f) => f.id);
}

/** 403 para un documento cargado que la candidata no puede tocar. */
export function respuestaDocumentoCerrado() {
  return NextResponse.json(
    { error: "Este documento ya fue cargado y está en revisión. Si hay que cambiarlo, el equipo te lo pedirá." },
    { status: 403 }
  );
}
