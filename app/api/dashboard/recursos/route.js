// app/api/dashboard/recursos/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

/* ── GET: recursos disponibles para la estudiante ────────────────────────── */
export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const categoria = searchParams.get("categoria") || "todos";
  const busqueda  = searchParams.get("q") || "";
  const limit     = parseInt(searchParams.get("limit") || "50");

  try {
    let sql = `
      SELECT id, titulo, descripcion, categoria, tipo, url, tamano_kb, icono_emoji, created_at
      FROM recursos WHERE activo = 1
    `;
    const params = [];

    if (categoria !== "todos") { sql += " AND categoria = ?"; params.push(categoria); }
    if (busqueda) { sql += " AND (titulo LIKE ? OR descripcion LIKE ?)"; params.push(`%${busqueda}%`, `%${busqueda}%`); }
    sql += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const [recursos] = await dbAupair.query(sql, params);
    return NextResponse.json({ recursos });
  } catch {
    // Tabla no existe aún → devolver recursos de ejemplo
    return NextResponse.json({ recursos: [] });
  }
}

/* ── SQL ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recursos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  titulo      VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria   VARCHAR(50)  DEFAULT 'general',
  tipo        ENUM('pdf','video','link','plantilla','podcast','checklist','ebook') DEFAULT 'pdf',
  url         VARCHAR(500) NOT NULL,
  tamano_kb   INT          DEFAULT 0,
  icono_emoji VARCHAR(10),
  activo      TINYINT(1)   DEFAULT 1,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Recursos de ejemplo para empezar:
INSERT INTO recursos (titulo, descripcion, categoria, tipo, url, tamano_kb, icono_emoji) VALUES
('Guía completa del programa Au Pair',   'Todo lo que necesitas saber: responsabilidades, beneficios, duración.',  'guias',      'pdf',  '/uploads/recursos/guia-programa.pdf',      2400, '📚'),
('Requisitos para aplicar',              'Conoce todos los requisitos y cómo presentar tus documentos.',           'requisitos', 'pdf',  '/uploads/recursos/requisitos.pdf',         1100, '📋'),
('Guía para elegir a tu familia',        'Consejos para encontrar la familia ideal y tener una entrevista exitosa.','familias',  'pdf',  '/uploads/recursos/guia-familia.pdf',       1800, '👨‍👩‍👧'),
('Viaje, visa y llegada',                'Información sobre tu visa, seguro médico y qué esperar al llegar.',      'viaje',      'pdf',  '/uploads/recursos/viaje-visa.pdf',         2000, '✈️'),
('Cultura y adaptación',                 'Tips para adaptarte a tu nuevo país y aprender el idioma.',              'cultura',    'pdf',  '/uploads/recursos/cultura.pdf',            1600, '🌍'),
('Dinero, pagos y beneficios',           'Todo sobre tu estipendio, días libres, vacaciones y beneficios.',        'guias',      'pdf',  '/uploads/recursos/dinero-beneficios.pdf',  1300, '💵'),
('Preguntas frecuentes',                 'Resuelve las dudas más comunes de futuras au pairs.',                    'guias',      'pdf',  '/uploads/recursos/faq.pdf',                1000, '❓'),
('Checklist de documentos',              'Lista completa de documentos que necesitas para aplicar.',               'requisitos', 'checklist','/uploads/recursos/checklist.pdf',      500,  '☑️'),
('Plantilla carta de presentación',      'Modelo editable para presentarte ante familias.',                        'plantillas', 'plantilla','/uploads/recursos/carta-presentacion.pdf',400,'📝');
───────────────────────────────────────────────────────────────────────── */