// app/api/admin/perfiles/[id]/observaciones/route.js
//
// El admin abre a corrección un campo, una sección o un documento de una
// candidata escribiendo una observación. Guardarla basta: la candidata puede
// editar ese elemento de inmediato (lib/observaciones-perfil.js decide qué
// cubre cada una). Cerrar o retirar no reabre nada.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { elementoValido } from "@/lib/observaciones-perfil";
import { avisarObservaciones } from "@/lib/notificaciones-aupair";
import { registrarHecho } from "@/lib/historial-aupair";

/* ── GET: todas las observaciones de la candidata ── */
export async function GET(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const [observaciones] = await dbAupair.query(
      `SELECT * FROM observaciones_perfil WHERE usuario_id = ? ORDER BY created_at DESC`,
      [id]
    );
    return NextResponse.json({ observaciones });
  } catch (err) {
    console.error("[GET observaciones]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── POST: nueva observación { tipo, parte?, seccion?, campo?, tipo_doc?, texto } ── */
export async function POST(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { id } = await params;
    const b = await req.json().catch(() => ({}));
    const obs = {
      tipo:     b.tipo,
      parte:    b.tipo === "seccion" ? Number(b.parte) : null,
      seccion:  b.tipo === "seccion" ? b.seccion : null,
      campo:    b.tipo === "campo" ? b.campo : null,
      tipo_doc: b.tipo === "documento" ? b.tipo_doc : null,
      texto:    String(b.texto || "").trim(),
    };
    if (!obs.texto) {
      return NextResponse.json({ error: "Escribe la observación: es lo que la candidata va a leer." }, { status: 400 });
    }
    if (!elementoValido(obs)) {
      return NextResponse.json({ error: "El elemento a observar no existe." }, { status: 400 });
    }

    const [[candidata]] = await dbAupair.query(
      "SELECT id FROM usuarios WHERE id = ? AND rol = 'usuaria'", [id]
    );
    if (!candidata) return NextResponse.json({ error: "Candidata no encontrada" }, { status: 404 });

    const [r] = await dbAupair.query(
      `INSERT INTO observaciones_perfil (usuario_id, tipo, parte, seccion, campo, tipo_doc, texto, creada_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, obs.tipo, obs.parte, obs.seccion, obs.campo, obs.tipo_doc, obs.texto, session.id]
    );

    avisarObservaciones(Number(id));

    // Un hecho por tanda: varias observaciones el mismo día son una sola
    // "le pidieron correcciones" en su línea de tiempo.
    const [[yaHoy]] = await dbAupair.query(
      `SELECT id FROM historial_candidata
       WHERE candidata_id = ? AND evento = 'correcciones' AND DATE(created_at) = CURDATE() LIMIT 1`,
      [id]
    );
    if (!yaHoy) {
      await registrarHecho({ candidataId: Number(id), evento: "correcciones", actor: { id: session.id, rol: "admin" } });
    }

    const [[creada]] = await dbAupair.query("SELECT * FROM observaciones_perfil WHERE id = ?", [r.insertId]);
    return NextResponse.json({ ok: true, observacion: creada });
  } catch (err) {
    console.error("[POST observaciones]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── PATCH: { id, accion: "cerrar" | "retirar" } ──
   Cerrar: el admin da por buena una corrección atendida.
   Retirar: deshace una observación que aún no se atendió. En los dos casos la
   observación queda "cerrada" y el elemento vuelve a estar cerrado. */
export async function PATCH(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const { id: obsId, accion } = await req.json().catch(() => ({}));
    const desde = accion === "cerrar" ? "atendida" : accion === "retirar" ? "abierta" : null;
    if (!desde || !obsId) {
      return NextResponse.json({ error: "accion debe ser cerrar o retirar, con id" }, { status: 400 });
    }
    const [r] = await dbAupair.query(
      `UPDATE observaciones_perfil SET estado = 'cerrada', cerrada_at = NOW()
       WHERE id = ? AND usuario_id = ? AND estado = ?`,
      [obsId, id, desde]
    );
    if (!r.affectedRows) {
      return NextResponse.json({ error: `La observación no está ${desde}.` }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH observaciones]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
