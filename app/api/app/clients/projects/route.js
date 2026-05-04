import { NextResponse } from "next/server";
import pool from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  const id_cliente = session.id; // id_usuario of the client
  try {
    const [projects] = await pool.query(
      `SELECT p.*,
        JSON_ARRAYAGG(
          IF(d.id_documento IS NOT NULL,
            JSON_OBJECT('id_documento',d.id_documento,'nombre',d.nombre,
              'url_archivo',d.url_archivo,'version_actual',d.version_actual,
              'fecha_subida',d.fecha_subida,'estado',d.estado), NULL)
        ) as documentos
       FROM proyectos p
       LEFT JOIN documentos d ON d.id_proyecto = p.id_proyecto
       WHERE p.id_cliente = ?
       GROUP BY p.id_proyecto
       ORDER BY p.fecha_creacion DESC`,
      [id_cliente]
    );
    const parsed = projects.map(p => ({
      ...p,
      documentos: (() => { try { const a = typeof p.documentos==="string"?JSON.parse(p.documentos):p.documentos; return (a||[]).filter(Boolean); } catch { return []; } })(),
    }));
    return NextResponse.json(parsed);
  } catch(e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}