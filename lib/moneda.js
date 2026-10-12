// ════════════════════════════════════════════════════════════════════════
// lib/moneda.js — Cómo se escribe un monto. Uno solo para toda la plataforma.
//
// Desde R9 (change `divisa-cop`) se cobra en pesos colombianos, pero lo
// registrado antes se cobró en dólares y conserva su moneda: por eso el
// formateador recibe la moneda de cada monto en vez de suponerla. Antes había
// cinco `money()` locales, con "en-US" y "es-CO" mezclados y "USD" a mano.
// ════════════════════════════════════════════════════════════════════════

export const MONEDA = "COP";

/** «$ 150.000 COP» · «$35 USD». Sin monto, «—». */
export function formatoMoneda(monto, moneda = MONEDA) {
  if (monto === null || monto === undefined || monto === "") return "—";
  const n = Number(monto);
  if (!Number.isFinite(n)) return "—";
  if (moneda === "USD") {
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USD`;
  }
  return `$ ${n.toLocaleString("es-CO", { maximumFractionDigits: 0 })} ${moneda}`;
}

/**
 * Un total que puede venir en varias monedas: { COP: 300000, USD: 145 } →
 * «$ 300.000 COP · $145 USD». Los pesos primero; lo que suma cero no sale.
 */
export function formatoTotales(porMoneda = {}) {
  const partes = Object.entries(porMoneda || {})
    .filter(([, v]) => Number(v) !== 0)
    .sort(([a], [b]) => (a === MONEDA ? -1 : b === MONEDA ? 1 : a.localeCompare(b)))
    .map(([m, v]) => formatoMoneda(v, m));
  return partes.length ? partes.join(" · ") : formatoMoneda(0);
}

/** Filas `{ moneda, total }` de un GROUP BY → `{ COP: …, USD: … }`. */
export const porMoneda = (filas = [], campo = "total") =>
  Object.fromEntries(filas.map((f) => [f.moneda, Number(f[campo]) || 0]));
