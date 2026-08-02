// ════════════════════════════════════════════════════════════════════════
// app/api/admin/toggle-acceso/route.js
//
// El admin activa o retira el acceso de una candidata desde el listado de
// usuarias. Activar acceso ES confirmar su pago: delega en lib/ventas-aupair.js
// para que el efecto sea idéntico al del módulo de ventas (permisos + consumo
// del cupo del código + comisión). Antes esta ruta contaba los usos por su
// cuenta leyendo usuarios.codigo_promo_usado, y esa lógica paralela era la que
// dejaba el contador desalineado.
//
// Lo único propio que conserva es el registro legacy de referidos
// (referido_registros), que alimenta el módulo /admin/referidos.
// ════════════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { confirmarAccesoUsuario, retirarAccesoUsuario } from "@/lib/ventas-aupair";

const SECCIONES = [
  "tiene_acceso","perfil_habilitado","acceso_documentos",
  "acceso_recursos","acceso_reuniones","acceso_mensajes","acceso_comunidad",
];

/* ── Registro legacy de referidos (módulo /admin/referidos) ─────────────── */
async function registrarPagoReferido(usuarioId, monto) {
  const [[usuario]] = await dbAupair.query(
    "SELECT codigo_referido FROM usuarios WHERE id = ?", [usuarioId]
  );

  let referidoId = null;
  if (usuario?.codigo_referido) {
    const [[ref]] = await dbAupair.query(
      "SELECT id FROM referidos WHERE codigo = ?", [usuario.codigo_referido]
    ).catch(() => [[null]]);
    referidoId = ref?.id || null;
  }

  const [[registro]] = await dbAupair.query(
    "SELECT id FROM referido_registros WHERE usuario_id = ?", [usuarioId]
  ).catch(() => [[null]]);

  if (registro) {
    await dbAupair.query(
      `UPDATE referido_registros
          SET pago_realizado = 1, monto_pagado = ?, referido_id = COALESCE(referido_id, ?)
        WHERE id = ?`,
      [Number(monto), referidoId, registro.id]
    ).catch(() => {});
  } else {
    await dbAupair.query(
      `INSERT INTO referido_registros (usuario_id, referido_id, monto_pagado, pago_realizado)
       VALUES (?,?,?,1)`,
      [usuarioId, referidoId, Number(monto)]
    ).catch(() => {});
  }
}

export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { id, tiene_acceso, monto = 35, seccion, valor } = await req.json();
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    // ── Toggle de una sección puntual (no toca ventas ni códigos) ──────────
    if (seccion && seccion !== "tiene_acceso" && valor !== undefined) {
      if (!SECCIONES.includes(seccion))
        return NextResponse.json({ error: "Sección no permitida" }, { status: 400 });
      await dbAupair.query(`UPDATE usuarios SET ${seccion} = ? WHERE id = ?`, [valor ? 1 : 0, id]);
      return NextResponse.json({ ok: true, [seccion]: valor ? 1 : 0 });
    }

    // ── Acceso completo = confirmar / anular la venta de la candidata ──────
    const activar = valor !== undefined ? valor : tiene_acceso;
    const usuarioId = Number(id);

    let result;
    if (activar) {
      result = await confirmarAccesoUsuario(usuarioId, { monto });
      if (!result.ok) return NextResponse.json(result, { status: 404 });
      await registrarPagoReferido(usuarioId, monto);
    } else {
      result = await retirarAccesoUsuario(usuarioId);
      await dbAupair.query(
        "UPDATE referido_registros SET pago_realizado = 0, monto_pagado = 0 WHERE usuario_id = ?",
        [usuarioId]
      ).catch(() => {});
    }

    const [[updated]] = await dbAupair.query(
      "SELECT tiene_acceso FROM usuarios WHERE id = ?", [usuarioId]
    );
    return NextResponse.json({
      ok: true,
      tiene_acceso: updated?.tiene_acceso ?? (activar ? 1 : 0),
      venta_id: result?.ventaId ?? null,
      comision: result?.comision ?? null,
      cupo_liberado: result?.cupoLiberado ?? false,
    });

  } catch (err) {
    console.error("[toggle-acceso POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── PUT: ajustar el monto pagado del registro legacy de referidos ───────── */
export async function PUT(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { usuario_id, monto } = await req.json();
    if (!usuario_id || monto === undefined || monto === null)
      return NextResponse.json({ error: "usuario_id y monto requeridos" }, { status: 400 });

    await registrarPagoReferido(Number(usuario_id), monto);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[toggle-acceso PUT]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
