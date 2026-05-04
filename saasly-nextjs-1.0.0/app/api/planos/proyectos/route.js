import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";

// GET /api/planes/proyectos — listar proyectos con sus documentos
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id_empresa = searchParams.get("id_empresa") || 1;

    const [proyectos] = await pool.query(
      `SELECT p.*, 
        u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
        COUNT(d.id_documento) AS total_archivos
       FROM proyectos p
       LEFT JOIN usuarios u ON p.id_cliente = u.id_usuario
       LEFT JOIN documentos d ON d.id_proyecto = p.id_proyecto AND d.estado = 'activo'
       WHERE p.id_empresa = ? AND p.estado != 'cancelado'
       GROUP BY p.id_proyecto
       ORDER BY p.fecha_creacion DESC`,
      [id_empresa]
    );

    // Para cada proyecto, traer sus documentos
    for (const proyecto of proyectos) {
      const [docs] = await pool.query(
        `SELECT d.*, u.nombre AS autor_nombre, u.apellido AS autor_apellido
         FROM documentos d
         LEFT JOIN usuarios u ON d.id_usuario_creador = u.id_usuario
         WHERE d.id_proyecto = ? AND d.estado = 'activo'
         ORDER BY d.fecha_subida DESC`,
        [proyecto.id_proyecto]
      );
      proyecto.documentos = docs;
    }

    return NextResponse.json({ proyectos });
  } catch (error) {
    console.error("Error GET proyectos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/planes/proyectos — crear nuevo proyecto
export async function POST(req) {
  try {
    const body = await req.json();
    const { nombre, descripcion, id_empresa, id_cliente } = body;

    if (!nombre || !id_empresa) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO proyectos (id_empresa, id_cliente, nombre, descripcion, estado, progreso_porcentaje)
       VALUES (?, ?, ?, ?, 'activo', 0)`,
      [id_empresa, id_cliente || null, nombre, descripcion || null]
    );

    const [rows] = await pool.query(
      `SELECT p.*, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido
       FROM proyectos p
       LEFT JOIN usuarios u ON p.id_cliente = u.id_usuario
       WHERE p.id_proyecto = ?`,
      [result.insertId]
    );

    return NextResponse.json({ proyecto: { ...rows[0], documentos: [] } }, { status: 201 });
  } catch (error) {
    console.error("Error POST proyecto:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}