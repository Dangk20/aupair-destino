// app/api/admin/referidos/[id]/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair"

/* ── PUT — editar ── */
export async function PUT(req, { params }) {
  try {
    const { nombre, email, codigo, porcentaje } = await req.json();
    await dbAupair.query(
      "UPDATE referidos SET nombre=?, email=?, codigo=?, porcentaje=? WHERE id=?",
      [nombre, email, codigo.toUpperCase(), porcentaje, params.id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return NextResponse.json({ error: "Ese código ya existe" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ── DELETE — eliminar ── */
export async function DELETE(_, { params }) {
  try {
    await db.query("DELETE FROM referidos WHERE id=?", [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// app/api/admin/referidos/[id]/pagar/route.js
// POST — marcar como pagado
export async function POST_PAGAR(_, { params }) {
  try {
    await db.query("UPDATE referidos SET estado='Pagado' WHERE id=?", [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}