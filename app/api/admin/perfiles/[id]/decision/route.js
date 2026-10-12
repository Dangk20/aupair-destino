// app/api/admin/perfiles/[id]/decision/route.js
//
// La decisión del equipo sobre una candidata. Dueña única de
// `usuarios.decision_dap` y de `evaluacion_aprobada` (que se mantiene en
// sincronía porque la leen otras pantallas). Reemplaza a
// /api/admin/aprobar-evaluacion.
//
//   { accion: "aprobar", agencia_id }  Parte 1 completa; crea la relación con
//                                      la agencia en "Evaluación de la agencia"
//   { accion: "no_califica", motivo }  motivo obligatorio e interno
//   { accion: "revertir" }             vuelve a quedar sin decisión
//
// "Pedir correcciones" no pasa por aquí: son las observaciones.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { parteCompleta, faltantesDeParte, invalidosDeParte } from "@/lib/campos-perfil";
import { avisarEvaluacionAprobada } from "@/lib/notificaciones-aupair";
import { registrarHecho } from "@/lib/historial-aupair";

export async function PUT(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const actor = { id: guard.session.id, rol: "admin" };

  try {
    const { id } = await params;
    const candidataId = Number(id);
    const { accion, agencia_id, motivo } = await req.json().catch(() => ({}));

    const [[u]] = await dbAupair.query("SELECT * FROM usuarios WHERE id = ? AND rol = 'usuaria'", [candidataId]);
    if (!u) return NextResponse.json({ error: "Candidata no encontrada" }, { status: 404 });

    if (accion === "aprobar") {
      // Un perfil a medias no se aprueba (misma regla que tenía aprobar-evaluacion).
      if (!parteCompleta(1, u)) {
        const invalidos = invalidosDeParte(1, u);
        return NextResponse.json({
          error: invalidos.length
            ? `No se puede aprobar: ${invalidos[0].label} — ${invalidos[0].error}`
            : "No se puede aprobar un perfil incompleto.",
          faltantes: faltantesDeParte(1, u).map((c) => c.label),
        }, { status: 400 });
      }
      const [[agencia]] = await dbAupair.query(
        "SELECT id, CONCAT_WS(' ', nombre, apellido) AS nombre FROM usuarios WHERE id = ? AND rol = 'agencia'",
        [Number(agencia_id) || 0]
      );
      if (!agencia) return NextResponse.json({ error: "Elige la agencia a la que va la candidata." }, { status: 400 });

      await dbAupair.query(
        `UPDATE usuarios SET decision_dap = 'aprobada', decision_dap_at = NOW(),
                decision_dap_motivo = NULL, evaluacion_aprobada = 1 WHERE id = ?`,
        [candidataId]
      );
      // Una agencia por candidata (índice único). Si ya tenía una, se cambia.
      await dbAupair.query(
        `INSERT INTO candidata_agencia (candidata_id, agencia_id, etapa)
         VALUES (?, ?, 'evaluacion')
         ON DUPLICATE KEY UPDATE agencia_id = VALUES(agencia_id), etapa = 'evaluacion', etapa_desde = NOW()`,
        [candidataId, agencia.id]
      );
      await registrarHecho({ candidataId, evento: "aprobada", agenciaId: agencia.id, actor });
      avisarEvaluacionAprobada(candidataId);
      return NextResponse.json({ ok: true, mensaje: `Aprobada y enviada a ${agencia.nombre}` });
    }

    if (accion === "no_califica") {
      const texto = String(motivo || "").trim();
      if (!texto) return NextResponse.json({ error: "Escribe el motivo: queda en el historial interno." }, { status: 400 });
      await dbAupair.query(
        `UPDATE usuarios SET decision_dap = 'no_califica', decision_dap_at = NOW(),
                decision_dap_motivo = ?, evaluacion_aprobada = 0 WHERE id = ?`,
        [texto, candidataId]
      );
      // El motivo es interno: el hecho público dice sólo que no califica, y el
      // motivo va en un hecho aparte marcado interno.
      await registrarHecho({ candidataId, evento: "no_califica", actor });
      await registrarHecho({ candidataId, evento: "no_califica", detalle: texto, interno: true, actor });
      return NextResponse.json({ ok: true, mensaje: "Marcada como No califica" });
    }

    if (accion === "revertir") {
      const [[rel]] = await dbAupair.query("SELECT etapa FROM candidata_agencia WHERE candidata_id = ?", [candidataId]);
      // Si ya avanzó con la agencia, deshacer la aprobación borraría ese
      // recorrido: se cierra moviéndola a "No continúa".
      if (rel && rel.etapa !== "evaluacion") {
        return NextResponse.json({
          error: "La candidata ya avanzó con la agencia. Para cerrar su proceso, muévela a «No continúa».",
        }, { status: 409 });
      }
      await dbAupair.query("DELETE FROM candidata_agencia WHERE candidata_id = ?", [candidataId]);
      await dbAupair.query(
        `UPDATE usuarios SET decision_dap = NULL, decision_dap_at = NULL,
                decision_dap_motivo = NULL, evaluacion_aprobada = 0 WHERE id = ?`,
        [candidataId]
      );
      // Visible: si vio "No califica" o "Aprobada", tiene que ver que se deshizo.
      await registrarHecho({ candidataId, evento: "decision_revertida", actor });
      return NextResponse.json({ ok: true, mensaje: "Decisión revertida" });
    }

    return NextResponse.json({ error: "accion debe ser aprobar, no_califica o revertir" }, { status: 400 });
  } catch (err) {
    console.error("[PUT decision]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
