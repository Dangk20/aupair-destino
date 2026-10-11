// ════════════════════════════════════════════════════════════════════════
// lib/curso-aupair.js — Qué sesiones del curso puede ver cada usuaria
//
// La regla vivía dentro de GET /api/dashboard/sesiones. Ahora la necesita
// también la descarga de recursos —quien ve el video baja su material—, y
// copiarla sería tener dos definiciones de "desbloqueada" que tarde o temprano
// dicen cosas distintas.
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";

// Sprint 0.0: los videos son GRATIS (imán de captación). El curso ya no se
// paga; el pago desbloquea documentación/acompañamiento, no las sesiones.
// El desbloqueo secuencial (una sesión abre la siguiente) se mantiene.
export const CURSO_LIBRE = true;

/** Sesiones con el progreso de la usuaria, en el orden del curso. */
export async function sesionesConProgreso(usuarioId) {
  const [filas] = await dbAupair.query(
    `SELECT
       s.id, s.titulo, s.descripcion, s.orden, s.es_gratis,
       s.url_video, s.video_drive_id, s.video_youtube_id,
       COALESCE(p.completada, FALSE) AS completada,
       p.fecha_completado
     FROM sesiones s
     LEFT JOIN progreso_usuario p
       ON p.id_sesion = s.id AND p.id_usuario = ?
     ORDER BY s.orden ASC`,
    [usuarioId]
  );
  return filas;
}

/**
 * Estado de cada sesión: "completed", "available" (la siguiente a la última
 * completada) o "locked".
 */
export function estadosDeSesiones(filas, session) {
  let encontroDisponible = false;
  return filas.map((s) => {
    let estado = "locked";
    if (s.completada) {
      estado = "completed";
    } else if (!encontroDisponible && (s.es_gratis || session.tiene_acceso || CURSO_LIBRE)) {
      estado = "available";
      encontroDisponible = true;
    }
    return { ...s, estado };
  });
}

/** ¿La usuaria puede ver esta sesión? El admin, siempre. */
export async function sesionVisible(sesionId, session) {
  if (session.rol === "admin") return true;
  const filas = await sesionesConProgreso(session.id);
  const sesion = estadosDeSesiones(filas, session).find((s) => s.id === Number(sesionId));
  return !!sesion && sesion.estado !== "locked";
}
