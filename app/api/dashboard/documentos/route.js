// app/api/dashboard/documentos/route.js
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

/* ── Documentos requeridos del programa ──────────────────────────────────── */
export const DOCS_REQUERIDOS = [
  { tipo:"pasaporte",           label:"Pasaporte",                  emoji:"🛂", formatos:"PDF, JPG, PNG", requerido:true  },
  { tipo:"cedula",              label:"Cédula de identidad",        emoji:"🪪", formatos:"PDF, JPG, PNG", requerido:true  },
  { tipo:"foto_perfil",         label:"Foto de perfil reciente",    emoji:"📸", formatos:"JPG, PNG",      requerido:true  },
  { tipo:"primeros_auxilios",   label:"Certificado primeros auxilios",emoji:"🏥",formatos:"PDF",          requerido:true  },
  { tipo:"titulo_bachillerato", label:"Título / diploma bachillerato",emoji:"🎓",formatos:"PDF, JPG",     requerido:true  },
  { tipo:"antecedentes",        label:"Antecedentes judiciales",    emoji:"📋", formatos:"PDF",           requerido:true  },
  { tipo:"registro_civil",      label:"Registro civil de nacimiento",emoji:"📄",formatos:"PDF, JPG",      requerido:true  },
  { tipo:"certificado_medico",  label:"Certificado médico",         emoji:"⚕️", formatos:"PDF",           requerido:true  },
  { tipo:"carta_recomendacion", label:"Carta de recomendación",     emoji:"💌", formatos:"PDF",           requerido:false },
  { tipo:"titulo_universitario",label:"Título universitario",       emoji:"🎓", formatos:"PDF, JPG",      requerido:false },
  { tipo:"certificado_idioma",  label:"Certificado de idioma",      emoji:"🌎", formatos:"PDF",           requerido:false },
  { tipo:"foto_experiencia",    label:"Fotos con niños",            emoji:"👶", formatos:"JPG, PNG",      requerido:false },
];

/* ── GET: documentos subidos por la usuaria ──────────────────────────────── */
export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const [docs] = await dbAupair.query(
      `SELECT id, tipo_doc, nombre, url, tamano_kb, estado, nota_admin, created_at
       FROM documentos_usuario WHERE usuario_id = ? ORDER BY created_at DESC`,
      [session.id]
    );
    return NextResponse.json({ docs, docs_requeridos: DOCS_REQUERIDOS });
  } catch (err) {
    // Tabla no existe aún
    return NextResponse.json({ docs: [], docs_requeridos: DOCS_REQUERIDOS });
  }
}

/* ── POST: subir un documento ────────────────────────────────────────────── */
export async function POST(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const formData = await req.formData();
    const file     = formData.get("file");
    const tipo_doc = formData.get("tipo_doc");
    const nombre   = formData.get("nombre") || file?.name || "Documento";

    if (!file || !tipo_doc)
      return NextResponse.json({ error: "file y tipo_doc son requeridos" }, { status: 400 });

    // Validar tipo
    const TIPOS_OK = ["application/pdf","image/jpeg","image/png","image/jpg"];
    if (!TIPOS_OK.includes(file.type))
      return NextResponse.json({ error: "Solo se permiten PDF, JPG o PNG" }, { status: 400 });

    if (file.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: "El archivo no puede superar 10 MB" }, { status: 400 });

    // Guardar en disco
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documentos", String(session.id));
    await mkdir(uploadDir, { recursive: true });
    const ext      = path.extname(file.name).toLowerCase();
    const filename = `${tipo_doc}_${Date.now()}${ext}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, Buffer.from(await file.arrayBuffer()));

    const url       = `/uploads/documentos/${session.id}/${filename}`;
    const tamano_kb = Math.round(file.size / 1024);

    // Si ya existe uno de este tipo, reemplazar (upsert)
    const [existing] = await dbAupair.query(
      "SELECT id FROM documentos_usuario WHERE usuario_id = ? AND tipo_doc = ?",
      [session.id, tipo_doc]
    );

    if (existing.length > 0) {
      await dbAupair.query(
        "UPDATE documentos_usuario SET nombre=?, url=?, tamano_kb=?, estado='pendiente', nota_admin=NULL, created_at=NOW() WHERE id=?",
        [nombre, url, tamano_kb, existing[0].id]
      );
    } else {
      await dbAupair.query(
        "INSERT INTO documentos_usuario (usuario_id, tipo_doc, nombre, url, tamano_kb) VALUES (?,?,?,?,?)",
        [session.id, tipo_doc, nombre, url, tamano_kb]
      );
    }

    return NextResponse.json({ ok: true, url, nombre });
  } catch (err) {
    console.error("[POST documentos]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── DELETE: eliminar un documento ──────────────────────────────────────── */
export async function DELETE(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  try {
    const [[doc]] = await dbAupair.query(
      "SELECT url FROM documentos_usuario WHERE id = ? AND usuario_id = ?",
      [id, session.id]
    );
    if (doc?.url) {
      const { unlink } = await import("fs/promises");
      await unlink(path.join(process.cwd(), "public", doc.url)).catch(() => {});
    }
    await dbAupair.query("DELETE FROM documentos_usuario WHERE id = ? AND usuario_id = ?", [id, session.id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── SQL ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documentos_usuario (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo_doc   VARCHAR(100) NOT NULL,
  nombre     VARCHAR(255) NOT NULL,
  url        VARCHAR(500) NOT NULL,
  tamano_kb  INT DEFAULT 0,
  estado     ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  nota_admin TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
───────────────────────────────────────────────────────────────────────── */