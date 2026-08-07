// app/api/admin/aprobar-evaluacion/route.js
//
// Dueño único de `usuarios.evaluacion_aprobada`. Ninguna otra ruta la escribe:
// `PUT /api/admin/perfiles/[id]` la excluye a propósito, para que aprobar sea
// un acto con nombre y no un efecto colateral de editar la estatura.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { parteCompleta, faltantesDeParte } from "@/lib/campos-perfil";
import { avisarEvaluacionAprobada } from "@/lib/notificaciones-aupair";

export async function PUT(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { usuario_id, aprobada } = await req.json();
    if (!usuario_id) {
      return NextResponse.json({ error: "usuario_id es requerido" }, { status: 400 });
    }

    const [[u]] = await dbAupair.query("SELECT * FROM usuarios WHERE id = ?", [usuario_id]);
    if (!u) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    // Un perfil a medias no se aprueba. Hasta ahora esto sólo lo impedía el
    // botón del listado, y un botón es una pista para pintar, nunca una
    // autorización: la ruta aceptaba aprobar cualquier perfil. Se comprueba
    // contra la fila guardada con lib/campos-perfil.js, la misma fuente que
    // usan la ficha y el formulario.
    if (aprobada && !parteCompleta(1, u)) {
      return NextResponse.json({
        error: "No se puede aprobar un perfil incompleto.",
        faltantes: faltantesDeParte(1, u).map((c) => c.label),
      }, { status: 400 });
    }

    await dbAupair.query(
      "UPDATE usuarios SET evaluacion_aprobada = ? WHERE id = ?",
      [aprobada ? 1 : 0, usuario_id]
    );

    // Sólo se avisa al aprobar. Retirar la aprobación es una corrección
    // interna del equipo y no tiene por qué llegarle a la candidata como
    // "tu evaluación ya no está aprobada".
    if (aprobada) avisarEvaluacionAprobada(usuario_id);

    return NextResponse.json({
      ok: true,
      evaluacion_aprobada: aprobada ? 1 : 0,
      mensaje: aprobada ? "Evaluación aprobada" : "Aprobación removida",
    });
  } catch (err) {
    console.error("[PUT /api/admin/aprobar-evaluacion]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
