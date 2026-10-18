// ════════════════════════════════════════════════════════════════════════
// lib/asociada-aupair.js — Qué candidatas son de cada asociada
//
// Decisión de Daniel (2026-10-13, change `candidatas-por-cupon`): las de una
// asociada son las que llegaron por SU cupón (`codigos_promo.asociada_id`),
// el mismo vínculo que genera sus comisiones. No hay asignación manual: la
// columna `usuarios.asesora_asignada_id` que usaba el proveedor nunca existió.
//
//   1. Pagó con un cupón suyo (venta no anulada)  → `pago: true`
//   2. Se registró escribiendo el código de un cupón suyo → `pago: false`
//
// El pago manda sobre el registro: quien se registró con el código de una y
// pagó con el de otra es de la segunda.
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";

/**
 * @returns {Promise<Map<number, {asociadaId:number, codigo:string, pago:boolean}>>}
 *   candidataId → de quién es y por qué cupón.
 */
export async function candidatasDeAsociadas() {
  const [registros] = await dbAupair.query(
    `SELECT u.id AS candidata_id, c.asociada_id, c.codigo
       FROM usuarios u
       JOIN codigos_promo c ON UPPER(c.codigo) = UPPER(u.codigo_referido)
      WHERE u.rol = 'usuaria' AND c.asociada_id IS NOT NULL`
  );
  // De la más vieja a la más reciente: si pagó con cupones de dos asociadas,
  // queda la última.
  const [pagos] = await dbAupair.query(
    `SELECT v.usuario_id AS candidata_id, c.asociada_id, c.codigo
       FROM ventas v
       JOIN codigos_promo c ON c.id = v.codigo_promo_id
      WHERE v.estado <> 'anulado' AND c.asociada_id IS NOT NULL
      ORDER BY v.created_at, v.id`
  );
  const mapa = new Map();
  for (const r of registros) mapa.set(r.candidata_id, { asociadaId: r.asociada_id, codigo: r.codigo, pago: false });
  for (const p of pagos)     mapa.set(p.candidata_id, { asociadaId: p.asociada_id, codigo: p.codigo, pago: true });
  return mapa;
}

/** Las candidatas de una asociada: candidataId → { codigo, pago }. */
export async function candidatasDe(asociadaId) {
  const todas = await candidatasDeAsociadas();
  return new Map([...todas].filter(([, v]) => v.asociadaId === Number(asociadaId)));
}

/** Por asociada: cuántas candidatas tiene y cuántas pagaron. */
export async function conteoPorAsociada() {
  const conteo = new Map();
  for (const { asociadaId, pago } of (await candidatasDeAsociadas()).values()) {
    const c = conteo.get(asociadaId) || { candidatas: 0, pagaron: 0 };
    c.candidatas++; if (pago) c.pagaron++;
    conteo.set(asociadaId, c);
  }
  return conteo;
}

/** De qué asociada es una candidata (la misma regla de arriba), o null. */
export async function asociadaDe(candidataId) {
  return (await candidatasDeAsociadas()).get(Number(candidataId)) || null;
}
