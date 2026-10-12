// ════════════════════════════════════════════════════════════════════════
// lib/etapas-candidata.js — En qué va cada candidata
//
// El recorrido, con un solo vocabulario, definido con la clienta el
// 2026-10-12. Antes había tres: el admin, el panel de la agencia y los
// perfiles de la agencia escribían su propia lista en `estado_agencia`, y cada
// pantalla contaba mal las ajenas.
//
// Las cuatro primeras etapas se CALCULAN de datos que ya existen; las de la
// agencia se GUARDAN en `candidata_agencia` y se mueven con
// lib/historial-aupair.js · moverEtapa(). Este archivo no toca la base: lo
// usan las rutas, la línea de tiempo y el tablero.
// ════════════════════════════════════════════════════════════════════════
import { parteCompleta, camposQueAplican, tieneValor } from "@/lib/campos-perfil";
import { DOCS_REQUERIDOS } from "@/lib/documentos";

/** El recorrido, en orden. `agencia: true` = la etapa se guarda y se mueve. */
export const ETAPAS = [
  { id: "diligenciando", label: "Diligenciando",           corto: "Tu perfil",
    descripcion: "Completa tu perfil para que el equipo lo pueda revisar." },
  { id: "revision",      label: "En revisión",             corto: "Revisión",
    descripcion: "El equipo de Destino Au Pair revisa tu perfil (1–3 días hábiles)." },
  { id: "correcciones",  label: "Con correcciones",        corto: "Correcciones",
    descripcion: "El equipo te pidió corregir algunos datos o documentos." },
  { id: "evaluacion",    label: "Evaluación de la agencia", corto: "Agencia", agencia: true,
    descripcion: "Tu perfil fue aprobado y lo evalúa la agencia aliada." },
  { id: "plan",          label: "Elección de plan",        corto: "Plan",     agencia: true,
    descripcion: "Eliges el acompañamiento de la agencia." },
  { id: "pago",          label: "Pago confirmado",         corto: "Pago",     agencia: true,
    descripcion: "La agencia confirmó tu pago." },
  { id: "visa",          label: "Visa",                    corto: "Visa",     agencia: true,
    descripcion: "Tramitas tu visa con el acompañamiento de la agencia." },
  { id: "completada",    label: "Completada",              corto: "¡Lista!",  agencia: true,
    descripcion: "Completaste el proceso. ¡Buen viaje!" },
];

/** Salidas del recorrido. Se muestran aparte, no como columna del camino. */
export const SALIDAS = [
  { id: "no_califica", label: "No califica",  descripcion: "Tu proceso con Destino Au Pair no continúa." },
  { id: "no_continua", label: "No continúa",  agencia: true, descripcion: "Tu proceso con la agencia no continúa." },
];

const TODAS = [...ETAPAS, ...SALIDAS];
export const etapaPorId = (id) => TODAS.find((e) => e.id === id) || null;

/** Las etapas que se guardan con la agencia (las únicas que se mueven a mano). */
export const ETAPAS_AGENCIA = TODAS.filter((e) => e.agencia).map((e) => e.id);

/**
 * Desde cuándo existe el envío explícito de la Parte 1. Quien la terminó antes
 * no tiene `parte1_enviada_at`, pero para el equipo ya está en revisión.
 */
export const ENVIO_DESDE = "2026-10-12";

function fechaISO(v) {
  if (!v) return "";
  return v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10);
}

/**
 * La etapa de una candidata, por precedencia:
 * No califica › etapa con la agencia › aprobada (Evaluación, sin agencia aún)
 * › observaciones abiertas › Parte 1 enviada › Diligenciando.
 *
 * @param {object} perfil     fila de `usuarios`
 * @param {number} abiertas   cuántas observaciones abiertas tiene
 * @param {object|null} relacion  fila de `candidata_agencia`, si hay
 * @returns {string} id de la etapa o salida
 */
export function etapaDe({ perfil = {}, abiertas = 0, relacion = null }) {
  if (perfil.decision_dap === "no_califica") return "no_califica";
  if (relacion?.etapa) return relacion.etapa;
  if (perfil.decision_dap === "aprobada" || Number(perfil.evaluacion_aprobada) === 1) return "evaluacion";
  if (abiertas > 0) return "correcciones";
  const enviada = !!perfil.parte1_enviada_at
    || (parteCompleta(1, perfil) && fechaISO(perfil.created_at) < ENVIO_DESDE);
  return enviada ? "revision" : "diligenciando";
}

/**
 * Score: porcentaje de la información diligenciada (decisión de la clienta,
 * 2026-10-12). Cuenta todos los campos que le aplican —obligatorios,
 * opcionales y condicionales cumplidos— con un valor válido, más los
 * documentos del programa cargados.
 *
 * @param {object} perfil
 * @param {Iterable<string>} tiposDoc  `tipo_doc` de los documentos cargados
 * @returns {number} 0–100
 */
export function scoreInformacion(perfil = {}, tiposDoc = []) {
  const campos = camposQueAplican(perfil);
  const llenos = campos.filter((c) =>
    tieneValor(perfil[c.name]) && !(typeof c.valida === "function" && c.valida(perfil[c.name], perfil))
  ).length;
  const cargados = new Set(tiposDoc);
  const docs = DOCS_REQUERIDOS.filter((d) => cargados.has(d.tipo)).length;
  const total = campos.length + DOCS_REQUERIDOS.length;
  return total ? Math.round(((llenos + docs) / total) * 100) : 0;
}

/** Índice de una etapa en el camino (las salidas, -1). */
export function posicion(id) {
  return ETAPAS.findIndex((e) => e.id === id);
}
