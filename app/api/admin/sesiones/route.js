// app/api/admin/sesiones/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  const [sesiones] = await dbAupair.query(
    "SELECT * FROM sesiones ORDER BY orden ASC"
  );
  return NextResponse.json({ sesiones });
}

export async function POST(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const {
      titulo, descripcion,
      video_drive_id, video_youtube_id,
      es_gratis = 0, duracion_min,
      modulo, estado = "Publicada",
    } = await req.json();

    if (!titulo?.trim())
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });

    // Calcular siguiente orden
    const [[{ maxOrden }]] = await dbAupair.query(
      "SELECT COALESCE(MAX(orden), 0) AS maxOrden FROM sesiones"
    );

    const [r] = await dbAupair.query(`
      INSERT INTO sesiones
        (titulo, descripcion, video_drive_id, video_youtube_id,
         es_gratis, duracion_min, modulo, estado, orden)
      VALUES (?,?,?,?,?,?,?,?,?)
    `, [
      titulo.trim(),
      descripcion || null,
      video_drive_id || null,
      video_youtube_id || null,
      es_gratis ? 1 : 0,
      duracion_min || null,
      modulo || null,
      estado,
      maxOrden + 1,
    ]);

    return NextResponse.json({ ok: true, id: r.insertId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const {
      id, titulo, descripcion,
      video_drive_id, video_youtube_id,
      es_gratis, duracion_min,
      modulo, estado, orden,
    } = await req.json();

    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    await dbAupair.query(`
      UPDATE sesiones SET
        titulo          = ?,
        descripcion     = ?,
        video_drive_id  = ?,
        video_youtube_id= ?,
        es_gratis       = ?,
        duracion_min    = ?,
        modulo          = ?,
        estado          = ?
        ${orden !== undefined ? ", orden = ?" : ""}
      WHERE id = ?
    `, [
      titulo,
      descripcion || null,
      video_drive_id  || null,
      video_youtube_id || null,
      es_gratis ? 1 : 0,
      duracion_min || null,
      modulo || null,
      estado || "Publicada",
      ...(orden !== undefined ? [orden] : []),
      id,
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    // Borrar progreso y la sesión
    await dbAupair.query("DELETE FROM progreso_usuario WHERE id_sesion = ?", [id]);
    await dbAupair.query("DELETE FROM sesiones WHERE id = ?", [id]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ══ SQL necesario ══════════════════════════════════════════════════════════

ALTER TABLE sesiones
  ADD COLUMN IF NOT EXISTS video_drive_id   VARCHAR(200) NULL,
  ADD COLUMN IF NOT EXISTS video_youtube_id VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS es_gratis        TINYINT(1)   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duracion_min     INT          NULL;

-- Migrar url_video existente:
UPDATE sesiones
SET video_youtube_id = SUBSTRING_INDEX(SUBSTRING_INDEX(url_video,'v=','-1'),'&',1)
WHERE url_video LIKE '%youtube%' AND url_video IS NOT NULL;

═══════════════════════════════════════════════════════════════════════════ */