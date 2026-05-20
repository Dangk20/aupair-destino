// app/api/admin/recursos/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// ── GET /api/admin/recursos?sesion_id=X ──────────────────────────────────────
export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { searchParams } = new URL(req.url);
  const sesion_id = searchParams.get("sesion_id");
  if (!sesion_id) return NextResponse.json({ error: "sesion_id requerido" }, { status: 400 });

  const [recursos] = await dbAupair.query(
    `SELECT id, nombre, tipo, url, tamano_kb, created_at
     FROM sesion_recursos
     WHERE sesion_id = ?
     ORDER BY created_at DESC`,
    [sesion_id]
  );

  return NextResponse.json({ recursos });
}

// ── POST /api/admin/recursos  (multipart/form-data) ──────────────────────────
// Body: sesion_id, nombre (opcional), file
export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const formData  = await req.formData();
  const sesion_id = formData.get("sesion_id");
  const file      = formData.get("file");          // File object
  const nombre    = formData.get("nombre") || file?.name || "Archivo";

  if (!sesion_id || !file) {
    return NextResponse.json({ error: "sesion_id y file son requeridos" }, { status: 400 });
  }

  // Detectar tipo por extensión
  const ext       = path.extname(file.name).toLowerCase();
  const tipoMap   = { ".pdf": "pdf", ".doc": "docx", ".docx": "docx" };
  const tipo      = tipoMap[ext] || "otro";

  // Guardar archivo en /public/uploads/recursos/
  const uploadDir = path.join(process.cwd(), "public", "uploads", "recursos");
  await mkdir(uploadDir, { recursive: true });

  const timestamp  = Date.now();
  const safeNombre = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename   = `${timestamp}_${safeNombre}`;
  const filepath   = path.join(uploadDir, filename);
  const buffer     = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const url        = `/uploads/recursos/${filename}`;
  const tamano_kb  = Math.round(buffer.length / 1024);

  // Guardar en BD
  const [result] = await dbAupair.query(
    `INSERT INTO sesion_recursos (sesion_id, nombre, tipo, url, tamano_kb)
     VALUES (?, ?, ?, ?, ?)`,
    [sesion_id, nombre, tipo, url, tamano_kb]
  );

  return NextResponse.json({
    ok: true,
    recurso: { id: result.insertId, nombre, tipo, url, tamano_kb },
  });
}

// ── DELETE /api/admin/recursos?id=X ──────────────────────────────────────────
export async function DELETE(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  // Obtener ruta del archivo para borrarlo del disco
  const [[recurso]] = await dbAupair.query(
    "SELECT url FROM sesion_recursos WHERE id = ?", [id]
  );
  if (recurso?.url) {
    const { unlink } = await import("fs/promises");
    const abs = path.join(process.cwd(), "public", recurso.url);
    await unlink(abs).catch(() => {}); // si ya no existe, ignorar
  }

  await dbAupair.query("DELETE FROM sesion_recursos WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}

/* ─── SQL para crear la tabla si no existe ────────────────────────────────────
CREATE TABLE IF NOT EXISTS sesion_recursos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  sesion_id  INT          NOT NULL,
  nombre     VARCHAR(255) NOT NULL,
  tipo       ENUM('pdf','docx','otro') NOT NULL DEFAULT 'otro',
  url        VARCHAR(500) NOT NULL,
  tamano_kb  INT          DEFAULT 0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sesion_id) REFERENCES sesiones(id) ON DELETE CASCADE
);
─────────────────────────────────────────────────────────────────────────────── */