// GET /api/dashboard/eventos — Los eventos visibles que vienen (talleres,
// llamadas grupales…), para el calendario de la candidata
// (change agenda-rango-bloques). Antes la pantalla los pedía a la ruta del
// admin y recibía 403. Mismo permiso que el calendario.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requierePermiso } from "@/lib/session-aupair";
import { ahoraBogota } from "@/lib/agenda-aupair";

export async function GET(req) {
  const guard = await requierePermiso(req, "reuniones");
  if (guard.error) return guard.error;
  try {
    const { fecha } = ahoraBogota();
    const [eventos] = await dbAupair.query(
      `SELECT id, titulo, descripcion, tipo, DATE_FORMAT(fecha,'%Y-%m-%d') AS fecha,
              TIME_FORMAT(hora_inicio,'%H:%i') AS hora_inicio, TIME_FORMAT(hora_fin,'%H:%i') AS hora_fin, url_meet
         FROM eventos WHERE visible = 1 AND fecha >= ? ORDER BY fecha, hora_inicio LIMIT 50`,
      [fecha]
    );
    return NextResponse.json({ eventos });
  } catch (err) {
    console.error("[GET /api/dashboard/eventos]", err);
    return NextResponse.json({ eventos: [], error: "No se pudieron cargar los eventos." }, { status: 500 });
  }
}
