import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";

// DELETE /api/planes/proyectos/[id]
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    // Marcar documentos como eliminados
    await pool.query(
      `UPDATE documentos SET estado = 'eliminado' WHERE id_proyecto = ?`,
      [id]
    );

    // Marcar proyecto como cancelado
    await pool.query(
      `UPDATE proyectos SET estado = 'cancelado' WHERE id_proyecto = ?`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error DELETE proyecto:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/planes/proyectos/[id] — actualizar estado
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { estado, nombre, descripcion } = body;

    await pool.query(
      `UPDATE proyectos SET 
        estado = COALESCE(?, estado),
        nombre = COALESCE(?, nombre),
        descripcion = COALESCE(?, descripcion)
       WHERE id_proyecto = ?`,
      [estado || null, nombre || null, descripcion || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error PATCH proyecto:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}