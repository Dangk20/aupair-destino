import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const { nombre, email, codigo, porcentaje } = await req.json();
    await dbAupair.query(
      "UPDATE referidos SET nombre=?, email=?, codigo=?, porcentaje=? WHERE id=?",
      [nombre, email, codigo.toUpperCase(), porcentaje, id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return NextResponse.json({ error: "Ese código ya existe" }, { status: 409 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  const { id } = await params;
  try {
    await dbAupair.query("DELETE FROM referidos WHERE id=?", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}