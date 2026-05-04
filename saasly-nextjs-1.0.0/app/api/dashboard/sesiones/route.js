import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    // Trae todas las sesiones con el progreso de la usuaria
    const [rows] = await dbAupair.query(
      `SELECT 
        s.id,
        s.titulo,
        s.descripcion,
        s.orden,
        s.es_gratis,
        s.url_video,
        COALESCE(p.completada, FALSE) AS completada,
        p.fecha_completado
       FROM sesiones s
       LEFT JOIN progreso_usuario p 
         ON p.id_sesion = s.id AND p.id_usuario = ?
       ORDER BY s.orden ASC`,
      [session.id]
    );

    // Calcula cuál es la primera sesión disponible (la siguiente a la última completada)
    let primeraDisponible = null;
    for (const s of rows) {
      if (!s.completada) {
        // Solo puede acceder si es gratis O si tiene_acceso
        if (s.es_gratis || session.tiene_acceso) {
          primeraDisponible = s.id;
        }
        break;
      }
    }

    // Agrega el estado a cada sesión
    let encontroDisponible = false;
    const sesiones = rows.map((s) => {
      let estado = "locked";

      if (s.completada) {
        estado = "completed";
      } else if (!encontroDisponible && (s.es_gratis || session.tiene_acceso)) {
        estado = "available";
        encontroDisponible = true;
      }

      return { ...s, estado };
    });

    const completadas = sesiones.filter((s) => s.estado === "completed").length;
    const total = sesiones.length;
    const porcentaje = Math.round((completadas / total) * 100);

    return NextResponse.json({ sesiones, completadas, total, porcentaje });
  } catch (err) {
    console.error("Sesiones error:", err);
    return NextResponse.json({ error: "Error al cargar las sesiones." }, { status: 500 });
  }
}