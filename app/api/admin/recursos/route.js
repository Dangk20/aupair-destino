// app/api/admin/recursos/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { guardarArchivo, borrarArchivo, archivoDisponible } from "@/lib/almacenamiento-archivos";
import path from "path";

// ── GET /api/admin/recursos?sesion_id=X ──────────────────────────────────────
export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { searchParams } = new URL(req.url);
  const sesion_id = searchParams.get("sesion_id");
  if (!sesion_id) return NextResponse.json({ error: "sesion_id requerido" }, { status: 400 });

  const [filas] = await dbAupair.query(
    `SELECT id, nombre, tipo, url, tamano_kb, created_at
     FROM sesion_recursos
     WHERE sesion_id = ?
     ORDER BY created_at DESC`,
    [sesion_id]
  );

  // Igual que los documentos: el archivo se abre por ruta autenticada y se
  // informa si el archivo sigue en el almacenamiento.
  const recursos = await Promise.all(filas.map(async r => ({
    ...r,
    url: `/api/sesion-recursos/${r.id}/archivo`,
    disponible: await archivoDisponible(r.url),
  })));

  return NextResponse.json({ recursos });
}

// ── POST /api/admin/recursos  (multipart/form-data) ──────────────────────────
// Body: sesion_id, nombre (opcional), file
export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

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

  // Guardar fuera de public/ — ver lib/almacenamiento-archivos.js
  const buffer     = Buffer.from(await file.arrayBuffer());
  const referencia = await guardarArchivo({
    carpeta:        ["recursos"],
    prefijo:        path.basename(file.name, ext),
    nombreOriginal: file.name,
    buffer,
  });
  const tamano_kb  = Math.round(buffer.length / 1024);

  // Guardar en BD (la columna url guarda la referencia, no una URL pública)
  const [result] = await dbAupair.query(
    `INSERT INTO sesion_recursos (sesion_id, nombre, tipo, url, tamano_kb)
     VALUES (?, ?, ?, ?, ?)`,
    [sesion_id, nombre, tipo, referencia, tamano_kb]
  );

  return NextResponse.json({
    ok: true,
    recurso: {
      id: result.insertId, nombre, tipo, tamano_kb,
      url: `/api/sesion-recursos/${result.insertId}/archivo`,
      disponible: true,
    },
  });
}

// ── DELETE /api/admin/recursos?id=X ──────────────────────────────────────────
export async function DELETE(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  // Obtener ruta del archivo para borrarlo del disco
  const [[recurso]] = await dbAupair.query(
    "SELECT url FROM sesion_recursos WHERE id = ?", [id]
  );
  if (recurso?.url) await borrarArchivo(recurso.url);

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