// ════════════════════════════════════════════════════════════════════════
// lib/ventas-aupair.js — Lógica de ventas, códigos y comisiones
//
// Dueño ÚNICO de la transición de estado de una venta. Toda ruta que active o
// retire el acceso de una candidata delega acá. Ninguna route debe encender
// permisos, contar usos de un código ni generar comisiones por su cuenta: esa
// duplicación fue justo la causa de que el contador de usos no se moviera.
//
//   confirmarVenta(ventaId)                → pendiente -> confirmado
//   anularVenta(ventaId)                   → confirmado/pendiente -> anulado
//   confirmarAccesoUsuario(usuarioId, ...) → resuelve o crea la venta y confirma
//   retirarAccesoUsuario(usuarioId)        → anula la venta viva y apaga permisos
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";
import {
  avisarPagoConfirmado,
  avisarAccesoActivado,
} from "@/lib/notificaciones-aupair";

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
 * Sólo devuelve códigos vivos: activos, no vencidos y con cupo disponible.
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

// ── Consumo y liberación de cupo ────────────────────────────────────────────
// La idempotencia se apoya en la fila de codigos_promo_usos (UNIQUE por
// codigo_id + usuario_id), no en una bandera aparte: el hecho "esta candidata
// ya consumió este código" ya está representado por ese registro.

async function consumirCodigo(codigoId, usuarioId, monto) {
  const [res] = await dbAupair.query(
    `INSERT IGNORE INTO codigos_promo_usos (codigo_id, usuario_id, monto_pagado)
     VALUES (?, ?, ?)`,
    [codigoId, usuarioId, Number(monto)]
  );
  // affectedRows = 0 ⇒ el uso ya estaba registrado; no volver a contar.
  if (res.affectedRows === 0) return false;
  await dbAupair.query(
    "UPDATE codigos_promo SET usos_actuales = usos_actuales + 1 WHERE id = ?",
    [codigoId]
  );
  return true;
}

async function liberarCodigo(codigoId, usuarioId) {
  const [res] = await dbAupair.query(
    "DELETE FROM codigos_promo_usos WHERE codigo_id = ? AND usuario_id = ?",
    [codigoId, usuarioId]
  );
  if (res.affectedRows === 0) return false;
  // GREATEST evita dejar el contador en negativo si alguien tocó la BD a mano.
  await dbAupair.query(
    "UPDATE codigos_promo SET usos_actuales = GREATEST(usos_actuales - 1, 0) WHERE id = ?",
    [codigoId]
  );
  return true;
}

async function encenderPermisos(usuarioId) {
  const setClause = PERMISOS_AL_PAGAR.map((c) => `${c} = 1`).join(", ");
  await dbAupair.query(`UPDATE usuarios SET ${setClause} WHERE id = ?`, [usuarioId]);
}

async function apagarPermisos(usuarioId) {
  const setClause = PERMISOS_AL_PAGAR.map((c) => `${c} = 0`).join(", ");
  await dbAupair.query(`UPDATE usuarios SET ${setClause} WHERE id = ?`, [usuarioId]);
}

/**
 * Confirma una venta pendiente:
 *   1. marca la venta como confirmada
 *   2. enciende los permisos de la candidata
 *   3. consume el cupo del código (si la venta trae uno)
 *   4. genera la comisión congelada si el código tiene asociada dueña y %
 *
 * Idempotente: confirmar dos veces no duplica uso ni comisión.
 *
 * @returns {{ ok:boolean, comision?:object, yaConfirmada?:boolean, error?:string }}
 */
export async function confirmarVenta(ventaId) {
  const [[venta]] = await dbAupair.query("SELECT * FROM ventas WHERE id = ?", [ventaId]);
  if (!venta) return { ok: false, error: "Venta no encontrada" };

  if (venta.estado === "confirmado") {
    // Ya estaba confirmada: reafirmar permisos es barato y cubre el caso de que
    // se hayan apagado por otra vía.
    await encenderPermisos(venta.usuario_id);
    return { ok: true, yaConfirmada: true };
  }

  await dbAupair.query(
    "UPDATE ventas SET estado = 'confirmado', confirmado_at = NOW() WHERE id = ?",
    [ventaId]
  );

  await encenderPermisos(venta.usuario_id);

  let comision = null;
  if (venta.codigo_promo_id) {
    await consumirCodigo(venta.codigo_promo_id, venta.usuario_id, venta.monto);

    const [[codigo]] = await dbAupair.query(
      "SELECT asociada_id, comision_porcentaje FROM codigos_promo WHERE id = ?",
      [venta.codigo_promo_id]
    );
    if (codigo?.asociada_id && Number(codigo.comision_porcentaje) > 0) {
      const monto = Number(venta.monto);
      const pct = Number(codigo.comision_porcentaje);
      const montoComision = Math.round(monto * pct) / 100; // 2 decimales
      // Si la venta se había anulado y se reconfirma, la comisión anulada
      // vuelve a quedar pendiente. El monto congelado no se recalcula.
      await dbAupair.query(
        `INSERT INTO comisiones
           (venta_id, asociada_id, codigo_promo_id, monto_venta, porcentaje, monto_comision)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           estado = IF(estado = 'anulada', 'pendiente', estado)`,
        [ventaId, codigo.asociada_id, venta.codigo_promo_id, monto, pct, montoComision]
      );
      comision = { asociada_id: codigo.asociada_id, porcentaje: pct, monto_comision: montoComision };
    }
  }

  // Los avisos se disparan aquí y no en las rutas: entran por este mismo punto
  // /api/admin/confirmar-pago, /api/admin/ventas/[id]/confirmar y
  // /api/admin/toggle-acceso, y la próxima ruta que confirme un pago los
  // hereda sin acordarse de nada. Sólo en la transición real: el retorno
  // temprano de `yaConfirmada` de más arriba nunca llega hasta acá.
  avisarPagoConfirmado({
    ventaId,
    usuarioId: venta.usuario_id,
    monto: venta.monto,
    codigo: venta.codigo_texto,
    comision,
  });
  avisarAccesoActivado(venta.usuario_id);

  return { ok: true, comision };
}

/**
 * Anula una venta. Si estaba confirmada revierte todo su efecto:
 * libera el cupo del código, anula la comisión y apaga los permisos.
 *
 * @returns {{ ok:boolean, cupoLiberado?:boolean, error?:string }}
 */
export async function anularVenta(ventaId) {
  const [[venta]] = await dbAupair.query("SELECT * FROM ventas WHERE id = ?", [ventaId]);
  if (!venta) return { ok: false, error: "Venta no encontrada" };
  if (venta.estado === "anulado") return { ok: true, yaAnulada: true };

  const estabaConfirmada = venta.estado === "confirmado";

  await dbAupair.query(
    "UPDATE ventas SET estado = 'anulado', confirmado_at = NULL WHERE id = ?",
    [ventaId]
  );

  let cupoLiberado = false;
  if (estabaConfirmada) {
    if (venta.codigo_promo_id) {
      cupoLiberado = await liberarCodigo(venta.codigo_promo_id, venta.usuario_id);
      await dbAupair.query(
        "UPDATE comisiones SET estado = 'anulada', pagada_at = NULL WHERE venta_id = ?",
        [ventaId]
      );
    }
    await apagarPermisos(venta.usuario_id);
  }

  return { ok: true, cupoLiberado };
}

/**
 * Confirma el acceso de una candidata sin partir de una venta concreta
 * (activación manual desde el listado de usuarias o desde confirmar-pago).
 *
 * Resuelve la venta a confirmar en este orden:
 *   1. su venta pendiente, si tiene
 *   2. su venta ya confirmada, si tiene (reafirma permisos y sale)
 *   3. si no tiene ninguna, crea una confirmada atribuyendo el código que la
 *      candidata haya aplicado en /pago (usuarios.codigo_promo_usado)
 *
 * @returns {{ ok:boolean, ventaId?:number, comision?:object, error?:string }}
 */
export async function confirmarAccesoUsuario(usuarioId, { monto } = {}) {
  const [[usuario]] = await dbAupair.query(
    "SELECT id, codigo_promo_usado FROM usuarios WHERE id = ?",
    [usuarioId]
  );
  if (!usuario) return { ok: false, error: "Usuaria no encontrada" };

  // 1) venta pendiente
  const [[pendiente]] = await dbAupair.query(
    "SELECT id FROM ventas WHERE usuario_id = ? AND estado = 'pendiente' ORDER BY id DESC LIMIT 1",
    [usuarioId]
  );
  if (pendiente) {
    const res = await confirmarVenta(pendiente.id);
    return { ...res, ventaId: pendiente.id };
  }

  // 2) venta ya confirmada
  const [[confirmada]] = await dbAupair.query(
    "SELECT id FROM ventas WHERE usuario_id = ? AND estado = 'confirmado' ORDER BY id DESC LIMIT 1",
    [usuarioId]
  );
  if (confirmada) {
    const res = await confirmarVenta(confirmada.id);
    return { ...res, ventaId: confirmada.id };
  }

  // 3) sin venta: crearla atribuyendo el código aplicado, si lo hay.
  //    resolverCodigo sólo devuelve códigos con cupo; si ya no lo tiene, la
  //    venta se registra sin código antes que bloquear la activación manual.
  const codigo = usuario.codigo_promo_usado
    ? await resolverCodigo(usuario.codigo_promo_usado)
    : null;
  const montoVenta =
    monto !== undefined && monto !== null
      ? Number(monto)
      : codigo
      ? Number(codigo.precio_final)
      : PRECIO_REGULAR;

  const [ins] = await dbAupair.query(
    `INSERT INTO ventas (usuario_id, monto, estado, codigo_promo_id, codigo_texto, tipo)
     VALUES (?, ?, 'pendiente', ?, ?, ?)`,
    [
      usuarioId,
      montoVenta,
      codigo?.id || null,
      codigo?.codigo || null,
      codigo ? "con_codigo" : "normal",
    ]
  );
  const res = await confirmarVenta(ins.insertId);
  return { ...res, ventaId: ins.insertId };
}

/**
 * Retira el acceso de una candidata: anula su venta viva (confirmada o
 * pendiente) y, con ello, libera el cupo del código y apaga sus permisos.
 * Si no tenía ninguna venta, apaga los permisos igual.
 */
export async function retirarAccesoUsuario(usuarioId) {
  const [[venta]] = await dbAupair.query(
    `SELECT id FROM ventas
      WHERE usuario_id = ? AND estado IN ('confirmado','pendiente')
      ORDER BY FIELD(estado,'confirmado','pendiente'), id DESC LIMIT 1`,
    [usuarioId]
  );
  if (venta) return await anularVenta(venta.id);

  await apagarPermisos(usuarioId);
  return { ok: true, sinVenta: true };
}
