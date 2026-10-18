// ════════════════════════════════════════════════════════════════════════
// lib/reuniones.js — La próxima reunión de la candidata (change `proxima-reunion`)
//
// Para el recuadro «Tu próxima reunión» del inicio y de «Mi proceso», a partir
// de lo que ya devuelve GET /api/dashboard/reuniones. No toca la base.
//
// La fecha llega como "YYYY-MM-DDT00:00:00.000Z" (lib/db-aupair.js usa
// `timezone: "Z"`): se toma el día tal cual y se formatea a mediodía, para que
// la zona horaria del navegador no lo corra al día anterior.
// ════════════════════════════════════════════════════════════════════════

const dia = (f) => (f ? String(f).slice(0, 10) : "");

/** Hoy en Colombia, como "YYYY-MM-DD". */
const hoy = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

/**
 * La reunión no cancelada más cercana de hoy en adelante, ya formateada, o null.
 * @param {Array<{fecha:string, hora_inicio:string, estado:string}>} reuniones
 * @returns {{fecha:string, hora:string}|null}
 */
export function proximaReunion(reuniones = []) {
  return proximasReuniones(reuniones)[0] || null;
}

/**
 * Todas las reuniones no canceladas de hoy en adelante, en orden y
 * formateadas (la candidata puede tener varias: Daniel, 2026-10-17).
 * @returns {Array<{id:number, fecha:string, hora:string, con:string}>}
 */
export function proximasReuniones(reuniones = []) {
  const desde = hoy();
  return reuniones
    .filter((x) => x.estado !== "cancelada" && dia(x.fecha) >= desde)
    .sort((a, b) => `${dia(a.fecha)} ${a.hora_inicio}`.localeCompare(`${dia(b.fecha)} ${b.hora_inicio}`))
    .map(formatear);
}

function formatear(r) {
  const fecha = new Date(`${dia(r.fecha)}T12:00:00`).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
  const [h, m] = String(r.hora_inicio || "").split(":");
  const hora = h ? new Date(2000, 0, 1, Number(h), Number(m || 0)).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" }) : "";
  const con = [r.asesora_nombre, r.asesora_apellido].filter(Boolean).join(" ");
  return { id: r.id, fecha, hora, con };
}
