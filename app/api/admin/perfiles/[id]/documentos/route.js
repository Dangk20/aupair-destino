// app/api/admin/perfiles/[id]/documentos/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { archivoDisponible, borrarDocumento } from "@/lib/almacenamiento-archivos";

/* ── GET: traer todos los documentos del usuario ── */
export async function GET(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { id } = await params;
    const [filas] = await dbAupair.query(
      `SELECT id, usuario_id, tipo_doc, nombre, url, tamano_kb, estado, nota_admin, created_at
       FROM documentos_usuario
       WHERE usuario_id = ?
       ORDER BY created_at DESC`,
      [id]
    );
    // Los documentos se abren por la ruta autenticada, no por URL pública.
    // `disponible` marca el registro cuyo archivo se perdió del almacenamiento.
    const docs = await Promise.all(filas.map(async d => ({
      ...d,
      url: `/api/documentos/${d.id}`,
      disponible: await archivoDisponible(d.url),
    })));
    return NextResponse.json({ docs });
  } catch (err) {
    console.error("[GET docs usuario]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── PUT: actualizar estado y nota_admin de un documento ── */
export async function PUT(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { id } = await params;
    const { doc_id, estado, nota_admin } = await req.json();

    if (!doc_id) return NextResponse.json({ error: "doc_id requerido" }, { status: 400 });

    const ESTADOS = ["pendiente","aprobado","rechazado"];
    if (estado && !ESTADOS.includes(estado))
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });

    const sets   = [];
    const values = [];
    if (estado !== undefined)     { sets.push("estado = ?");      values.push(estado); }
    if (nota_admin !== undefined) { sets.push("nota_admin = ?");  values.push(nota_admin || null); }
    if (sets.length === 0) return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });

    values.push(doc_id, id);
    await dbAupair.query(
      `UPDATE documentos_usuario SET ${sets.join(", ")} WHERE id = ? AND usuario_id = ?`,
      values
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PUT docs usuario]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── DELETE: eliminar un documento ── */
export async function DELETE(req, { params }) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const doc_id = searchParams.get("doc_id");

    if (!doc_id) return NextResponse.json({ error: "doc_id requerido" }, { status: 400 });

    const [[doc]] = await dbAupair.query(
      "SELECT url FROM documentos_usuario WHERE id = ? AND usuario_id = ?",
      [doc_id, id]
    );
    await dbAupair.query(
      "DELETE FROM documentos_usuario WHERE id = ? AND usuario_id = ?",
      [doc_id, id]
    );
    // El archivo deja de ser accesible por la ruta autenticada.
    if (doc?.url) await borrarDocumento(doc.url);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE docs usuario]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}