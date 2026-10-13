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
//   transferirCupo(origenId, destinoId)    → la venta y los permisos pasan a otra cuenta (R11)
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";
import {
  avisarPagoConfirmado,
  avisarAccesoActivado,
} from "@/lib/notificaciones-aupair";
import { registrarHecho } from "@/lib/historial-aupair";

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

/**
 * El precio del cupo, en pesos (R9). Lo fija el admin en /admin/configuracion
 * (`configuracion.precio_cupo_cop`); no hay valor por defecto en el código.
 * @returns {Promise<number|null>} null = sin configurar
 */
export async function precioCupo() {
  const [[fila]] = await dbAupair.query(
    "SELECT valor FROM configuracion WHERE clave = 'precio_cupo_cop' LIMIT 1"
  );
  const n = Number(fila?.valor);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * El precio con un cupón. Un cupón es un % de descuento sobre el precio del
 * cupo (decisión de Daniel, 2026-10-12): si el precio cambia, el cupón lo
 * sigue. Los cupones anteriores, de precio fijo (`precio_final`, en USD),
 * valen lo que decían hasta que el admin les ponga un porcentaje.
 * Se redondea al peso.
 *
 * @param {object} codigo  fila de codigos_promo
 * @param {number|null} cupo  precioCupo()
 * @returns {{ monto:number, moneda:string }|null}  null = sin precio configurado
 */
export function precioConCodigo(codigo, cupo) {
  if (codigo.descuento_porcentaje !== null && codigo.descuento_porcentaje !== undefined) {
    if (!cupo) return null;
    const pct = Math.min(100, Math.max(0, Number(codigo.descuento_porcentaje)));
    return { monto: Math.round(cupo * (1 - pct / 100)), moneda: "COP" };
  }
  return { monto: Number(codigo.precio_final), moneda: codigo.moneda || "COP" };
}

/**
 * Cuánto y en qué moneda se cobra: con el cupón, o el precio del cupo en COP.
 * null = no hay precio configurado.
 */
export async function importeVenta(codigo) {
  const cupo = await precioCupo();
  if (codigo) return precioConCodigo(codigo, cupo);
  return cupo ? { monto: cupo, moneda: "COP" } : null;
}

export const SIN_PRECIO = "El precio del cupo todavía no está configurado. Configúralo en Administración › Configuración.";

/**
 * Resuelve un código de descuento contra codigos_promo.
 * Sólo devuelve códigos vivos: activos, no vencidos y con cupo disponible.
 * Retorna { id, codigo, precio_final, asociada_id, comision_porcentaje } o null.
 */
export async function resolverCodigo(codigoTexto) {
  if (!codigoTexto?.trim()) return null;
  const [rows] = await dbAupair.query(
    `SELECT id, codigo, precio_final, moneda, descuento_porcentaje, asociada_id, comision_porcentaje
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
           (venta_id, asociada_id, codigo_promo_id, monto_venta, porcentaje, monto_comision, moneda)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           estado = IF(estado = 'anulada', 'pendiente', estado)`,
        // La comisión, en la moneda de su venta.
        [ventaId, codigo.asociada_id, venta.codigo_promo_id, monto, pct, montoComision, venta.moneda || "COP"]
      );
      comision = { asociada_id: codigo.asociada_id, porcentaje: pct, monto_comision: montoComision, moneda: venta.moneda || "COP" };
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
  // R10: al historial, con el monto en su moneda.
  await registrarHecho({ candidataId: venta.usuario_id, evento: "pago_confirmado", detalle: `${venta.monto} ${venta.moneda || "COP"}` });

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
    await registrarHecho({ candidataId: venta.usuario_id, evento: "pago_anulado", detalle: `${venta.monto} ${venta.moneda || "COP"}` });
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
  // Un monto escrito por el admin es en pesos; si no, el del código o el cupo.
  const importe = monto !== undefined && monto !== null && monto !== ""
    ? { monto: Number(monto), moneda: "COP" }
    : await importeVenta(codigo);
  if (!importe) return { ok: false, error: SIN_PRECIO, sinPrecio: true };

  const [ins] = await dbAupair.query(
    `INSERT INTO ventas (usuario_id, monto, moneda, estado, codigo_promo_id, codigo_texto, tipo)
     VALUES (?, ?, ?, 'pendiente', ?, ?, ?)`,
    [
      usuarioId,
      importe.monto,
      importe.moneda,
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

/**
 * Traspasa el cupo de una cuenta a otra (R11, sin cobro): la venta confirmada
 * más reciente pasa a la cuenta nueva con su monto, moneda, código y comisión
 * intactos —no es un pago nuevo—, junto con su registro de uso del código.
 * El origen pierde los permisos de pago; el destino los recibe. Si el origen
 * tenía acceso sin venta (activaciones viejas a mano), pasan sólo los permisos.
 *
 * @returns {Promise<{ ok:true, ventaId:number|null }>}
 */
export async function transferirCupo(origenId, destinoId) {
  const [[venta]] = await dbAupair.query(
    "SELECT id, codigo_promo_id FROM ventas WHERE usuario_id = ? AND estado = 'confirmado' ORDER BY id DESC LIMIT 1",
    [origenId]
  );
  if (venta) {
    await dbAupair.query("UPDATE ventas SET usuario_id = ? WHERE id = ?", [destinoId, venta.id]);
    if (venta.codigo_promo_id) {
      await dbAupair.query(
        "UPDATE IGNORE codigos_promo_usos SET usuario_id = ? WHERE codigo_id = ? AND usuario_id = ?",
        [destinoId, venta.codigo_promo_id, origenId]
      );
    }
  }
  await apagarPermisos(origenId);
  await encenderPermisos(destinoId);
  return { ok: true, ventaId: venta?.id ?? null };
}
