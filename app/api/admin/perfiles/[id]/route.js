// app/api/admin/perfiles/[id]/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { perfilPublicable } from "@/lib/perfil";
import { validarCambios } from "@/lib/campos-perfil";

/* ── GET: obtener perfil completo desde usuarios ── */
export async function GET(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { id } = await params;

    const [[u]] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [id]
    );

    if (!u) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    // `delete u.password` no bastaba: el `SELECT *` seguía devolviendo al
    // navegador `reset_token` y `reset_token_expiry`, de modo que quien
    // pudiera leer la respuesta de una candidata con recuperación en curso
    // podía cambiarle la contraseña. En modo "revision" el admin sí conserva
    // la valoración interna (`score_dap`, `notas_agencia`…), que necesita.
    return NextResponse.json({ perfil: perfilPublicable(u, "revision") });
  } catch (err) {
    console.error("[GET /api/admin/perfiles/[id]]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── PUT: actualizar perfil en usuarios ── */
export async function PUT(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { id } = await params;
    const body = await req.json();

    // Verificar qué columnas existen en usuarios
    const [cols] = await dbAupair.query("DESCRIBE usuarios");
    const colNames = new Set(cols.map(c => c.Field));

    // Nunca tocar estas columnas desde el admin de perfiles.
    //
    // `evaluacion_aprobada` está aquí porque aprobar a una candidata es un acto
    // con nombre propio y un solo dueño: PUT /api/admin/perfiles/[id]/decision, que
    // además comprueba que el perfil esté completo. Aceptarla también aquí la
    // dejaba con dos dueños, y editar la estatura podía aprobar un perfil sin
    // que nada lo dijera. Es la misma regla que rige las ventas en
    // lib/ventas-aupair.js.
    const EXCLUIR = new Set([
      "id","email","password","rol","created_at","evaluacion_aprobada",
      // El envío de cada parte es un acto de la candidata (perfil/enviar).
      "parte1_enviada_at","parte2_enviada_at",
      // La decisión del equipo tiene su propia ruta (.../decision), que además
      // crea la relación con la agencia y deja el hecho en el historial.
      "decision_dap","decision_dap_at","decision_dap_motivo",
      // Ya no se escriben desde la ficha: la etapa y el score se calculan.
      "estado_agencia","calificacion_dap","score_dap",
    ]);

    // Mismas reglas de valor que el formulario de la candidata: el admin
    // tampoco puede dejar una fecha de nacimiento imposible en la base.
    const [[actual]] = await dbAupair.query("SELECT created_at FROM usuarios WHERE id = ?", [id]);
    const invalidos = validarCambios(body, actual || {});
    if (invalidos.length) {
      return NextResponse.json(
        { error: `${invalidos[0].label}: ${invalidos[0].error}`, invalidos },
        { status: 400 }
      );
    }

    const sets   = [];
    const values = [];

    for (const [campo, valor] of Object.entries(body)) {
      if (EXCLUIR.has(campo)) continue;
      if (!colNames.has(campo)) continue;
      // foto_url sólo admite un data-URI de imagen o una URL. Sin esto se
      // guardaba cualquier texto (llegó a quedar "data:img" en producción) y
      // el <img> reventaba con ERR_INVALID_URL.
      if (campo === "foto_url" && valor) {
        const v = String(valor);
        const valida = v.startsWith("data:image/") || /^https?:\/\//.test(v);
        if (!valida) continue;
      }
      sets.push(`${campo} = ?`);
      values.push(valor === "" ? null : valor);
    }

    if (sets.length === 0)
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });

    values.push(id);
    await dbAupair.query(
      `UPDATE usuarios SET ${sets.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT /api/admin/perfiles/[id]]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}