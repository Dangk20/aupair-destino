import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";

// DELETE /api/planes/documentos/[id]
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await pool.query(
      `UPDATE documentos SET estado = 'eliminado' WHERE id_documento = ?`,
      [id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/planos/documentos/[id] — actualizar nombre
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const { nombre } = await req.json();
    await pool.query(
      `UPDATE documentos SET nombre = ? WHERE id_documento = ?`,
      [nombre, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}