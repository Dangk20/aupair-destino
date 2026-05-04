import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET /api/planos/documentos?id_proyecto=X
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id_proyecto = searchParams.get("id_proyecto");

    const [docs] = await pool.query(
      `SELECT d.*, u.nombre AS autor_nombre, u.apellido AS autor_apellido
       FROM documentos d
       LEFT JOIN usuarios u ON d.id_usuario_creador = u.id_usuario
       WHERE d.id_proyecto = ? AND d.estado = 'activo'
       ORDER BY d.fecha_subida DESC`,
      [id_proyecto]
    );

    return NextResponse.json({ documentos: docs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/planos/documentos — subir archivo
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file        = formData.get("file");
    const id_proyecto = formData.get("id_proyecto");
    const id_empresa  = formData.get("id_empresa") || 1;
    const id_usuario  = formData.get("id_usuario")  || 1;

    if (!file || !id_proyecto) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar archivo en /public/uploads/planos/
    const uploadDir = path.join(process.cwd(), "public", "uploads", "planos");
    await mkdir(uploadDir, { recursive: true });

    const fileName  = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
    const filePath  = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const urlArchivo = `/uploads/planos/${fileName}`;
    const tipo = file.name.split(".").pop().toLowerCase();
    const tamanio = (file.size / 1024 / 1024).toFixed(2) + " MB";

    // Insertar en DB
    const [result] = await pool.query(
      `INSERT INTO documentos 
        (id_empresa, id_proyecto, id_usuario_creador, nombre, tipo, url_archivo, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'activo')`,
      [id_empresa, id_proyecto, id_usuario, file.name, tipo, urlArchivo]
    );

    const [rows] = await pool.query(
      `SELECT d.*, u.nombre AS autor_nombre, u.apellido AS autor_apellido
       FROM documentos d
       LEFT JOIN usuarios u ON d.id_usuario_creador = u.id_usuario
       WHERE d.id_documento = ?`,
      [result.insertId]
    );

    return NextResponse.json({ documento: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error POST documento:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}