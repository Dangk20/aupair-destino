import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";
import { archivoDisponible } from "@/lib/almacenamiento-archivos";
// Qué sesión está desbloqueada para quién se decide en un solo sitio: lo usa
// también la descarga de recursos. Ver lib/curso-aupair.js.
import { sesionesConProgreso, estadosDeSesiones } from "@/lib/curso-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    const filas    = await sesionesConProgreso(session.id);
    const estados  = estadosDeSesiones(filas, session);

    // Recursos descargables de cada sesión (R7). Sólo de las que la usuaria
    // puede ver: los de una sesión bloqueada no salen de aquí.
    const visibles = estados.filter((s) => s.estado !== "locked").map((s) => s.id);
    const porSesion = new Map();
    if (visibles.length) {
      const [recursos] = await dbAupair.query(
        `SELECT id, sesion_id, nombre, tipo, url, tamano_kb
         FROM sesion_recursos WHERE sesion_id IN (?) ORDER BY created_at ASC`,
        [visibles]
      );
      for (const r of recursos) {
        const lista = porSesion.get(r.sesion_id) || [];
        lista.push({
          id: r.id, nombre: r.nombre, tipo: r.tipo, tamano_kb: r.tamano_kb,
          url: `/api/sesion-recursos/${r.id}/archivo`,
          disponible: await archivoDisponible(r.url),
        });
        porSesion.set(r.sesion_id, lista);
      }
    }
    const sesiones = estados.map((s) => ({ ...s, recursos: porSesion.get(s.id) || [] }));

    const completadas = sesiones.filter((s) => s.estado === "completed").length;
    const total = sesiones.length;
    // Sin sesiones el progreso es 0, no NaN.
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return NextResponse.json({ sesiones, completadas, total, porcentaje });
  } catch (err) {
    console.error("Sesiones error:", err);
    return NextResponse.json({ error: "Error al cargar las sesiones." }, { status: 500 });
  }
}