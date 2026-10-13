// ════════════════════════════════════════════════════════════════════════
// lib/transferencias-aupair.js — Transferir un cupo pagado (R11)
//
// Destino Au Pair no reembolsa: la candidata puede vender su cupo. El admin
// invita a un correo; quien se registre con ese link hereda el cupo y la
// cuenta de origen pierde el acceso (sigue pudiendo entrar). La cuenta nueva
// arranca de cero: sólo hereda el cupo. Sin cobro. El link vence a los 30 días.
//
//   invitar()     crea la invitación, o la reenvía con un link nuevo
//   cancelar()    deja sin efecto la pendiente
//   pendienteDe() la invitación viva de una cuenta, para la pantalla
//   validar()     ¿sirve este token? (registro por invitación)
//   usar()        reclama el token y traspasa el cupo a la cuenta nueva
//
// El traspaso de la venta y de los permisos es de lib/ventas-aupair.js
// (`transferirCupo`), dueño único del acceso pagado.
// ════════════════════════════════════════════════════════════════════════
import crypto from "crypto";
import dbAupair from "@/lib/db-aupair";
import { transferirCupo } from "@/lib/ventas-aupair";
import { enviarInvitacionCupo } from "@/lib/notificaciones-aupair";
import { registrarHecho } from "@/lib/historial-aupair";

export const DIAS_VIGENCIA = 30;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.destino-aupair.com";

const hash = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");
const nombre = (u) => [u?.nombre, u?.apellido].filter(Boolean).join(" ") || u?.email || null;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** La invitación pendiente y vigente de una cuenta, o null. */
export async function pendienteDe(origenId) {
  const [[t]] = await dbAupair.query(
    `SELECT id, email, vence_at, created_at FROM transferencias_cupo
      WHERE origen_id = ? AND estado = 'pendiente' AND vence_at > NOW()
      ORDER BY id DESC LIMIT 1`,
    [origenId]
  );
  return t || null;
}

/**
 * Invita a `email` a recibir el cupo de `origenId`. Si ya hay una pendiente
 * al mismo correo, la reenvía con un link nuevo (el anterior deja de servir) y
 * 30 días más. Devuelve el link para que el admin pueda copiarlo.
 *
 * @returns {Promise<{ok:true, link:string, vence:Date, reenviada:boolean} | {ok:false, status:number, error:string}>}
 */
export async function invitar({ origenId, email, actor }) {
  const correo = String(email || "").trim().toLowerCase();
  if (!EMAIL.test(correo)) return { ok: false, status: 400, error: "Escribe un correo válido." };

  const [[origen]] = await dbAupair.query(
    "SELECT id, nombre, apellido, email, rol, tiene_acceso FROM usuarios WHERE id = ?", [origenId]
  );
  if (!origen || origen.rol !== "usuaria") return { ok: false, status: 404, error: "Candidata no encontrada." };
  if (!Number(origen.tiene_acceso)) return { ok: false, status: 409, error: "Esta cuenta no tiene un cupo pago que transferir." };

  const [[existe]] = await dbAupair.query("SELECT id FROM usuarios WHERE LOWER(email) = ?", [correo]);
  if (existe) return { ok: false, status: 409, error: "Ese correo ya tiene una cuenta. El cupo sólo se transfiere a una persona nueva." };

  const viva = await pendienteDe(origenId);
  if (viva && viva.email !== correo) {
    return { ok: false, status: 409, error: `Ya hay una transferencia pendiente a ${viva.email}. Cancélala antes de invitar a otro correo.` };
  }

  const token = crypto.randomBytes(32).toString("hex");
  if (viva) {
    await dbAupair.query(
      `UPDATE transferencias_cupo SET token_hash = ?, vence_at = DATE_ADD(NOW(), INTERVAL ${DIAS_VIGENCIA} DAY) WHERE id = ?`,
      [hash(token), viva.id]
    );
  } else {
    // Las vencidas sin usar se cierran para que no queden dos «pendientes».
    await dbAupair.query(
      "UPDATE transferencias_cupo SET estado = 'cancelada' WHERE origen_id = ? AND estado = 'pendiente'", [origenId]
    );
    await dbAupair.query(
      `INSERT INTO transferencias_cupo (origen_id, email, token_hash, creada_por, vence_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ${DIAS_VIGENCIA} DAY))`,
      [origenId, correo, hash(token), actor?.id ?? null]
    );
  }
  const t = await pendienteDe(origenId);
  const link = `${APP_URL}/register?invitacion=${token}`;
  await enviarInvitacionCupo({ email: correo, link, vence: t.vence_at });
  await registrarHecho({
    candidataId: origenId, evento: "invitacion_cupo", interno: true, actor,
    detalle: `${viva ? "Reenviada" : "Enviada"} a ${correo}`,
  });
  return { ok: true, link, vence: t.vence_at, reenviada: !!viva };
}

/** Cancela la invitación pendiente de una cuenta. */
export async function cancelar({ origenId, actor }) {
  const [res] = await dbAupair.query(
    "UPDATE transferencias_cupo SET estado = 'cancelada' WHERE origen_id = ? AND estado = 'pendiente'", [origenId]
  );
  if (!res.affectedRows) return { ok: false, status: 404, error: "No hay una transferencia pendiente." };
  await registrarHecho({ candidataId: origenId, evento: "invitacion_cancelada", interno: true, actor });
  return { ok: true };
}

/**
 * ¿Sirve este token? No revela quién transfiere: sólo el correo invitado.
 * @returns {Promise<{ok:true, id:number, email:string, vence:Date, origenId:number} | {ok:false, error:string}>}
 */
export async function validar(token) {
  if (!token || !/^[0-9a-f]{64}$/.test(String(token))) return { ok: false, error: "Esta invitación no es válida." };
  const [[t]] = await dbAupair.query(
    "SELECT id, origen_id, email, estado, vence_at, vence_at > NOW() AS vigente FROM transferencias_cupo WHERE token_hash = ?",
    [hash(token)]
  );
  if (!t) return { ok: false, error: "Esta invitación no es válida. Si te reenviaron el correo, usa el link más reciente." };
  if (t.estado === "usada") return { ok: false, error: "Esta invitación ya se usó. Si ya creaste tu cuenta, ingresa con tu correo." };
  if (t.estado === "cancelada") return { ok: false, error: "Esta invitación fue cancelada." };
  if (!Number(t.vigente)) return { ok: false, error: "Esta invitación venció. Pide a Destino Au Pair que te la reenvíe." };
  return { ok: true, id: t.id, email: t.email, vence: t.vence_at, origenId: t.origen_id };
}

/**
 * Reclama el token (una sola vez, aunque lleguen dos envíos a la vez) y
 * ejecuta `crearCuenta()`, que devuelve el id de la cuenta nueva. Luego
 * traspasa el cupo y lo escribe en el historial de las dos cuentas. Si crear
 * la cuenta falla, la invitación vuelve a quedar pendiente.
 */
export async function usar(token, crearCuenta) {
  const v = await validar(token);
  if (!v.ok) return { ok: false, status: 410, error: v.error };

  const [claim] = await dbAupair.query(
    "UPDATE transferencias_cupo SET estado = 'usada', usada_at = NOW() WHERE id = ? AND estado = 'pendiente' AND vence_at > NOW()",
    [v.id]
  );
  if (!claim.affectedRows) return { ok: false, status: 410, error: "Esta invitación ya no es válida." };

  let destinoId;
  try {
    destinoId = await crearCuenta(v.email);
  } catch (err) {
    await dbAupair.query("UPDATE transferencias_cupo SET estado = 'pendiente', usada_at = NULL WHERE id = ?", [v.id]);
    throw err;
  }

  const { ventaId } = await transferirCupo(v.origenId, destinoId);
  await dbAupair.query("UPDATE transferencias_cupo SET destino_id = ?, venta_id = ? WHERE id = ?", [destinoId, ventaId, v.id]);

  const [[origen]]  = await dbAupair.query("SELECT nombre, apellido, email FROM usuarios WHERE id = ?", [v.origenId]);
  const [[destino]] = await dbAupair.query("SELECT nombre, apellido, email FROM usuarios WHERE id = ?", [destinoId]);
  await registrarHecho({ candidataId: v.origenId, evento: "cupo_transferido", detalle: nombre(destino), referencia: `transferencia:${v.id}` });
  await registrarHecho({ candidataId: destinoId, evento: "cupo_heredado", detalle: nombre(origen), referencia: `transferencia:${v.id}` });
  return { ok: true, destinoId };
}
