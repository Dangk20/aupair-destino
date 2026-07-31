// app/api/dashboard/documentos/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized, forbidden } from "@/lib/session-aupair";
import {
  guardarDocumento, borrarDocumento, archivoDisponible,
} from "@/lib/almacenamiento-archivos";

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
    const [filas] = await dbAupair.query(
      `SELECT id, tipo_doc, nombre, url, tamano_kb, estado, nota_admin, created_at
       FROM documentos_usuario WHERE usuario_id = ? ORDER BY created_at DESC`,
      [session.id]
    );
    // La URL pública deja de existir: el documento se abre por la ruta
    // autenticada. `disponible` distingue el registro cuyo archivo se perdió.
    const docs = await Promise.all(filas.map(async d => ({
      ...d,
      url: `/api/documentos/${d.id}`,
      disponible: await archivoDisponible(d.url),
    })));
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

  // Sprint 0.0: cargar documentación es lo que se paga. Se valida el permiso
  // LEYÉNDOLO DE LA BD (no del JWT), para que la confirmación del pago surta
  // efecto de inmediato sin necesidad de que la candidata cierre sesión.
  const [[perm]] = await dbAupair.query(
    "SELECT acceso_documentos FROM usuarios WHERE id = ?",
    [session.id]
  );
  if (!perm || perm.acceso_documentos !== 1) return forbidden();

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

    // Guardar fuera de public/ — ver lib/almacenamiento-archivos.js
    const referencia = await guardarDocumento({
      usuarioId:      session.id,
      tipoDoc:        tipo_doc,
      nombreOriginal: file.name,
      buffer:         Buffer.from(await file.arrayBuffer()),
    });
    const tamano_kb = Math.round(file.size / 1024);

    // Si ya existe uno de este tipo, reemplazar (upsert)
    const [existing] = await dbAupair.query(
      "SELECT id, url FROM documentos_usuario WHERE usuario_id = ? AND tipo_doc = ?",
      [session.id, tipo_doc]
    );

    let docId;
    if (existing.length > 0) {
      await dbAupair.query(
        "UPDATE documentos_usuario SET nombre=?, url=?, tamano_kb=?, estado='pendiente', nota_admin=NULL, created_at=NOW() WHERE id=?",
        [nombre, referencia, tamano_kb, existing[0].id]
      );
      docId = existing[0].id;
      // El archivo reemplazado ya no lo referencia nadie.
      if (existing[0].url && existing[0].url !== referencia) {
        await borrarDocumento(existing[0].url);
      }
    } else {
      const [ins] = await dbAupair.query(
        "INSERT INTO documentos_usuario (usuario_id, tipo_doc, nombre, url, tamano_kb) VALUES (?,?,?,?,?)",
        [session.id, tipo_doc, nombre, referencia, tamano_kb]
      );
      docId = ins.insertId;
    }

    return NextResponse.json({ ok: true, id: docId, url: `/api/documentos/${docId}`, nombre });
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
    if (doc?.url) await borrarDocumento(doc.url);
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