// ════════════════════════════════════════════════════════════════════════
// lib/ventas-aupair.js — Lógica de ventas y comisiones (Sprint 0.0)
//
// Fuente única de: qué permisos enciende un pago, cómo se resuelve un código,
// y cómo se confirma una venta (acceso + comisión). Que viva acá y no
// duplicado en cada route.
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";

// Permisos que se habilitan al confirmar el pago (decidido con la clienta).
// Pago = desbloqueo completo del acompañamiento.
export const PERMISOS_AL_PAGAR = [
  "tiene_acceso",
  "acceso_documentos",
  "acceso_mensajes",
  "acceso_comunidad",
  "acceso_reuniones",
  "acceso_recursos",
  "perfil_habilitado",
];

export const PRECIO_REGULAR = 35;

/**
 * Resuelve un código de descuento contra codigos_promo.
 * Retorna { id, codigo, precio_final, asociada_id, comision_porcentaje } o null.
 */
export async function resolverCodigo(codigoTexto) {
  if (!codigoTexto?.trim()) return null;
  const [rows] = await dbAupair.query(
    `SELECT id, codigo, precio_final, asociada_id, comision_porcentaje
       FROM codigos_promo
      WHERE codigo = ? AND activo = 1
        AND (fecha_expiracion IS NULL OR fecha_expiracion >= CURDATE())
        AND (usos_max IS NULL OR usos_actuales < usos_max)
      LIMIT 1`,
    [codigoTexto.toUpperCase().trim()]
  );
  return rows[0] || null;
}

/**
 * Confirma una venta pendiente (uso administrativo):
 *   1. marca la venta como confirmada
 *   2. enciende los permisos de la candidata
 *   3. si la venta trae código con asociada + %, genera la comisión (congelada)
 *
 * Idempotente: si la venta ya está confirmada no duplica comisión
 * (la tabla comisiones tiene UNIQUE por venta_id).
 *
 * @returns {{ ok:boolean, comision?:object, error?:string }}
 */
export async function confirmarVenta(ventaId) {
  const [[venta]] = await dbAupair.query(
    "SELECT * FROM ventas WHERE id = ?",
    [ventaId]
  );
  if (!venta) return { ok: false, error: "Venta no encontrada" };
  if (venta.estado === "confirmado") return { ok: true, yaConfirmada: true };

  // 1) confirmar la venta
  await dbAupair.query(
    "UPDATE ventas SET estado = 'confirmado', confirmado_at = NOW() WHERE id = ?",
    [ventaId]
  );

  // 2) encender permisos de la candidata
  const setClause = PERMISOS_AL_PAGAR.map((c) => `${c} = 1`).join(", ");
  await dbAupair.query(
    `UPDATE usuarios SET ${setClause} WHERE id = ?`,
    [venta.usuario_id]
  );

  // 3) comisión, sólo si hay código con asociada y porcentaje > 0
  let comision = null;
  if (venta.codigo_promo_id) {
    const [[codigo]] = await dbAupair.query(
      "SELECT asociada_id, comision_porcentaje FROM codigos_promo WHERE id = ?",
      [venta.codigo_promo_id]
    );
    if (codigo?.asociada_id && Number(codigo.comision_porcentaje) > 0) {
      const monto = Number(venta.monto);
      const pct = Number(codigo.comision_porcentaje);
      const montoComision = Math.round(monto * pct) / 100; // 2 decimales
      // INSERT ... ON DUPLICATE evita romper si ya existía (UNIQUE venta_id)
      await dbAupair.query(
        `INSERT INTO comisiones
           (venta_id, asociada_id, codigo_promo_id, monto_venta, porcentaje, monto_comision)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id = id`,
        [ventaId, codigo.asociada_id, venta.codigo_promo_id, monto, pct, montoComision]
      );
      comision = { asociada_id: codigo.asociada_id, porcentaje: pct, monto_comision: montoComision };
    }
  }

  return { ok: true, comision };
}
