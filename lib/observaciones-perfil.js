// ════════════════════════════════════════════════════════════════════════
// lib/observaciones-perfil.js — Qué puede cambiar la candidata después de enviar
//
// El ciclo (R3): la candidata envía cada parte; desde entonces sólo puede
// cambiar lo que el admin le reabra con una observación —un campo, una
// sección o un documento—, y al guardar la corrección se vuelve a cerrar.
//
// Aquí viven las reglas, sin tocar la base: las usan las rutas que escriben el
// perfil (para rechazar) y la ficha (para pintar qué se puede corregir). Las
// consultas están en lib/bloqueo-perfil.js.
// ════════════════════════════════════════════════════════════════════════
import { PARTE1, PARTE2 } from "@/lib/campos-perfil";
import { DOCS_REQUERIDOS } from "@/lib/documentos";

const PARTES = { 1: PARTE1, 2: PARTE2 };

/**
 * Columnas que la Parte 1 captura sin declararlas en campos-perfil.js: las
 * fotos de la cédula se suben desde la sección "Información personal". Si no
 * se ubicaran, quedarían fuera del bloqueo.
 */
const NO_DECLARADOS = {
  cedula_frontal_url:   [{ parte: 1, seccion: "personal" }],
  cedula_posterior_url: [{ parte: 1, seccion: "personal" }],
};

/** En qué parte(s) y sección(es) está un campo. [] si no es del perfil. */
export function ubicacionesDeCampo(name) {
  const ubic = [];
  for (const [parte, secciones] of Object.entries(PARTES)) {
    for (const s of secciones) {
      if (s.campos.some((c) => c.name === name)) ubic.push({ parte: Number(parte), seccion: s.id });
    }
  }
  return ubic.length ? ubic : NO_DECLARADOS[name] || [];
}

/** La sección declarada, o null. */
export function seccionDe(parte, id) {
  return PARTES[parte]?.find((s) => s.id === id) || null;
}

/** La etiqueta de un campo declarado, o su nombre. */
export function etiquetaDeCampo(name) {
  for (const secciones of Object.values(PARTES)) {
    for (const s of secciones) {
      const c = s.campos.find((c) => c.name === name);
      if (c) return c.label;
    }
  }
  if (name.startsWith("cedula_")) return "Fotos de la cédula";
  return name;
}

/** Cómo se nombra el elemento de una observación, para la candidata y el admin. */
export function elementoDe(obs) {
  if (obs.tipo === "campo") return etiquetaDeCampo(obs.campo);
  if (obs.tipo === "seccion") {
    const s = seccionDe(obs.parte, obs.seccion);
    return s ? `Sección «${s.titulo}» (Parte ${obs.parte})` : `Sección ${obs.seccion}`;
  }
  const d = DOCS_REQUERIDOS.find((d) => d.tipo === obs.tipo_doc);
  return d ? `Documento «${d.label}»` : `Documento ${obs.tipo_doc}`;
}

/** ¿El elemento que describe la observación existe? Para validar al crearla. */
export function elementoValido(obs) {
  if (obs.tipo === "campo")     return ubicacionesDeCampo(obs.campo || "").length > 0;
  if (obs.tipo === "seccion")   return !!seccionDe(Number(obs.parte), obs.seccion);
  if (obs.tipo === "documento") return DOCS_REQUERIDOS.some((d) => d.tipo === obs.tipo_doc);
  return false;
}

/** ¿Esta observación abierta reabre el campo `name`? */
export function cubreCampo(obs, name) {
  if (obs.estado !== "abierta") return false;
  if (obs.tipo === "campo") return obs.campo === name;
  if (obs.tipo === "seccion") {
    return ubicacionesDeCampo(name).some((u) => u.parte === Number(obs.parte) && u.seccion === obs.seccion);
  }
  return false;
}

/** ¿Esta observación abierta reabre el documento `tipoDoc`? */
export function cubreDocumento(obs, tipoDoc) {
  return obs.estado === "abierta" && obs.tipo === "documento" && obs.tipo_doc === tipoDoc;
}

/**
 * Normaliza un valor para comparar el que llega con el guardado.
 * Vacío y null son lo mismo; una fecha (Date de mysql2 o texto ISO) se compara
 * por su día; el resto, como texto.
 */
function normal(v) {
  if (v === null || v === undefined) return "";
  // El pool lee DATE/DATETIME como UTC (`timezone: "Z"` en lib/db-aupair.js):
  // el día es el de los componentes UTC, no el de la hora local del servidor.
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const t = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(t)) return t.slice(0, 10);
  return t;
}

/** Campos de `cambios` cuyo valor difiere del guardado en `fila`. */
export function camposCambiados(cambios, fila = {}) {
  return Object.keys(cambios).filter((k) => normal(cambios[k]) !== normal(fila[k]));
}

/**
 * Campos que la petición quiere cambiar y no puede: cambian de valor,
 * pertenecen a una parte enviada y ninguna observación abierta los reabre.
 *
 * Se compara contra lo guardado porque los formularios reenvían el perfil
 * entero: sin eso, guardar la Parte 2 con la Parte 1 enviada se rechazaría
 * siempre.
 *
 * @param {object} cambios   lo que llega en la petición
 * @param {object} fila      la fila actual de `usuarios`
 * @param {{1:boolean,2:boolean}} enviadas
 * @param {Array} abiertas   observaciones abiertas de la candidata
 * @returns {Array<{name:string,label:string}>}
 */
export function cambiosBloqueados(cambios, fila, enviadas, abiertas = []) {
  return camposCambiados(cambios, fila)
    .filter((name) => {
      const ubic = ubicacionesDeCampo(name);
      if (!ubic.some((u) => enviadas[u.parte])) return false;   // parte abierta, o no es del perfil
      return !abiertas.some((o) => cubreCampo(o, name));
    })
    .map((name) => ({ name, label: etiquetaDeCampo(name) }));
}

/** Ids de las observaciones abiertas que atiende haber cambiado `cambiados`. */
export function observacionesAtendidas(cambiados, abiertas = []) {
  return abiertas
    .filter((o) => cambiados.some((name) => cubreCampo(o, name)))
    .map((o) => o.id);
}

/** Mensaje para un rechazo por campos cerrados. */
export function mensajeBloqueo(bloqueados) {
  const nombres = bloqueados.map((b) => b.label).join(", ");
  return bloqueados.length === 1
    ? `«${nombres}» ya fue enviado y no se puede cambiar. Si hay que corregirlo, el equipo te lo pedirá.`
    : `Estos datos ya fueron enviados y no se pueden cambiar: ${nombres}. Si hay que corregirlos, el equipo te lo pedirá.`;
}
