// app/api/admin/perfiles/[id]/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

/* ── GET: obtener perfil completo desde usuarios ── */
export async function GET(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { id } = await params;

    const [[u]] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [id]
    );

    if (!u) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    // Quitar password del response
    delete u.password;

    return NextResponse.json({ perfil: u });
  } catch (err) {
    console.error("[GET /api/admin/perfiles/[id]]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── PUT: actualizar perfil en usuarios ── */
export async function PUT(req, { params }) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();

    // Verificar qué columnas existen en usuarios
    const [cols] = await dbAupair.query("DESCRIBE usuarios");
    const colNames = new Set(cols.map(c => c.Field));

    // Nunca tocar estas columnas desde el admin de perfiles
    const EXCLUIR = new Set(["id","email","password","rol","created_at"]);

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