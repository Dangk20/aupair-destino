// app/api/admin/toggle-acceso/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

const SECCIONES = [
  "tiene_acceso","perfil_habilitado","acceso_documentos",
  "acceso_recursos","acceso_reuniones","acceso_mensajes","acceso_comunidad",
];

export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { id, tiene_acceso, monto = 35, seccion, valor } = await req.json();
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    // Toggle sección específica
    if (seccion && seccion !== "tiene_acceso" && valor !== undefined) {
      if (!SECCIONES.includes(seccion))
        return NextResponse.json({ error: "Sección no permitida" }, { status: 400 });
      await dbAupair.query(`UPDATE usuarios SET ${seccion} = ? WHERE id = ?`, [valor?1:0, id]);
      return NextResponse.json({ ok: true, [seccion]: valor?1:0 });
    }

    // Toggle acceso completo
    const activar = valor !== undefined ? valor : tiene_acceso;
    await dbAupair.query("UPDATE usuarios SET tiene_acceso = ? WHERE id = ?", [activar?1:0, id]);

    if (activar) {
      const [[usuario]] = await dbAupair.query(
        "SELECT codigo_referido, codigo_promo_usado FROM usuarios WHERE id = ?", [id]
      );

      // ── Referido ──────────────────────────────────────
      let referidoId = null;
      if (usuario?.codigo_referido) {
        const [[ref]] = await dbAupair.query(
          "SELECT id FROM referidos WHERE codigo = ?", [usuario.codigo_referido]
        ).catch(()=>[[null]]);
        referidoId = ref?.id || null;
      }

      const [[registro]] = await dbAupair.query(
        "SELECT id FROM referido_registros WHERE usuario_id = ?", [id]
      ).catch(()=>[[null]]);

      if (registro) {
      await dbAupair.query(
      `UPDATE referido_registros SET pago_realizado=1, monto_pagado=?, referido_id=COALESCE(referido_id,?) WHERE id=?`,
      [Number(monto), referidoId, registro.id]
      );
      } else {
       await dbAupair.query(
      `INSERT INTO referido_registros (usuario_id, referido_id, monto_pagado, pago_realizado) VALUES (?,?,?,1)`,
      [id, referidoId, Number(monto)]
      );
    }

      // ── Código promo ───────────────────────────────────
      if (usuario?.codigo_promo_usado) {
        const [[promo]] = await dbAupair.query(
          "SELECT id FROM codigos_promo WHERE codigo = ?", [usuario.codigo_promo_usado]
        ).catch(()=>[[null]]);

        if (promo) {
          // Verificar que no se haya registrado ya
          const [[yaUso]] = await dbAupair.query(
            "SELECT id FROM codigos_promo_usos WHERE codigo_id=? AND usuario_id=?",
            [promo.id, id]
          ).catch(()=>[[null]]);

          if (!yaUso) {
            await dbAupair.query(
              "INSERT INTO codigos_promo_usos (codigo_id, usuario_id, monto_pagado) VALUES (?,?,?)",
              [promo.id, id, Number(monto)]
            ).catch(()=>{});
            await dbAupair.query(
              "UPDATE codigos_promo SET usos_actuales = usos_actuales + 1 WHERE id=?",
              [promo.id]
            ).catch(()=>{});
          }
        }
      }

    } else {
      // Desactivar → revertir pago referido
      await dbAupair.query(
        "UPDATE referido_registros SET pago_realizado=0, monto_pagado=0 WHERE usuario_id=?", [id]
      ).catch(()=>{});
    }

    const [[updated]] = await dbAupair.query(
      "SELECT tiene_acceso FROM usuarios WHERE id = ?", [id]
    );
    return NextResponse.json({ ok: true, tiene_acceso: updated.tiene_acceso });

  } catch (err) {
    console.error("[toggle-acceso POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { usuario_id, monto } = await req.json();
    if (!usuario_id || monto === undefined || monto === null)
      return NextResponse.json({ error: "usuario_id y monto requeridos" }, { status: 400 });

    const [[existing]] = await dbAupair.query(
      "SELECT id FROM referido_registros WHERE usuario_id = ?", [usuario_id]
    );

    if (existing) {
      await dbAupair.query(
        "UPDATE referido_registros SET monto_pagado = ?, pago_realizado = 1 WHERE usuario_id = ?",
        [Number(monto), usuario_id]
      );
    } else {
      const [[usuario]] = await dbAupair.query(
        "SELECT codigo_referido FROM usuarios WHERE id = ?", [usuario_id]
      );
      let referidoId = null;
      if (usuario?.codigo_referido) {
        const [[ref]] = await dbAupair.query(
          "SELECT id FROM referidos WHERE codigo = ?", [usuario.codigo_referido]
        ).catch(()=>[[null]]);
        referidoId = ref?.id || null;
      }
      await dbAupair.query(
        "INSERT INTO referido_registros (usuario_id, referido_id, monto_pagado, pago_realizado) VALUES (?,?,?,1)",
        [usuario_id, referidoId, Number(monto)]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[toggle-acceso PUT]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}