// app/api/admin/perfiles/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereAdmin } from "@/lib/session-aupair";
import { progresoParte } from "@/lib/campos-perfil";
import { perfilPublicable } from "@/lib/perfil";

// El avance de las dos partes sale de lib/campos-perfil.js, la misma fuente
// que usan la ficha y el formulario. Este archivo llevaba su propia copia:
// dieciséis columnas escritas a mano para la evaluación y diez "secciones" de
// agencia con la regla de que media sección llena cuenta como completa. Por eso
// el listado podía decir 100% de una candidata cuya ficha decía 78%.
const calcProgresoEval    = (u) => (u ? progresoParte(1, u) : 0);
const calcProgresoAgencia = (u) => (u ? progresoParte(2, u) : 0);

function calcEstadoEval(progreso) {
  if (progreso >= 90) return "Completo";
  if (progreso >= 50) return "En revisión";
  if (progreso > 0)   return "Incompleto";
  return "Pendiente";
}

function calcEstadoAgencia(u, progreso) {
  // Si el admin ya definió un estado, usarlo
  if (u.estado_agencia && u.estado_agencia !== "En progreso") return u.estado_agencia;
  if (progreso >= 80) return "Lista para agencia";
  if (progreso >= 40) return "En progreso";
  if (progreso > 0)   return "Incompleto";
  return "Sin inicio";
}

function tiempoRelativo(fecha) {
  if (!fecha) return "—";
  const diff = Math.floor((new Date() - new Date(fecha)) / 60000);
  if (diff < 1)    return "Ahora";
  if (diff < 60)   return `Hace ${diff} min`;
  if (diff < 1440) return `Hace ${Math.floor(diff/60)} h`;
  const dias = Math.floor(diff/1440);
  return `Hace ${dias} día${dias>1?"s":""}`;
}

export async function GET(req) {
  const guard = requiereAdmin(req);
  if (guard.error) return guard.error;
  const session = guard.session;

  try {
    const { searchParams } = new URL(req.url);
    const q      = searchParams.get("q")      || "";
    const estado = searchParams.get("estado") || "";
    const ciudad = searchParams.get("ciudad") || "";

    const [rows] = await dbAupair.query(
      "SELECT * FROM usuarios WHERE rol = 'usuaria' ORDER BY created_at DESC"
    );

    const perfiles = rows.map(fila => {
      // Mismo filtro que la ficha: `delete fila.password` dejaba salir los
      // testigos de recuperación de TODAS las candidatas en una sola respuesta.
      const r = perfilPublicable(fila, "revision");

      const progresoEval    = calcProgresoEval(r);
      const progresoAgencia = calcProgresoAgencia(r);
      const estadoEval      = calcEstadoEval(progresoEval);
      const estadoAgencia   = calcEstadoAgencia(r, progresoAgencia);

      return {
        ...r,
        // Tab 1 — evaluación
        progreso:         progresoEval,
        estado:           estadoEval,
        // Tab 2 — agencia (calculado dinámicamente)
        progreso_agencia: progresoAgencia,
        estado_agencia:   estadoAgencia,
        ultima_actividad: tiempoRelativo(r.created_at),
      };
    });

    // La TABLA solo muestra perfiles ya diligenciados (con algo lleno en
    // evaluación o en agencia). Las candidatas que nunca empezaron no aparecen
    // — no hay nada que analizar. Las stats de arriba sí cuentan a todas.
    // Si el admin filtra explícitamente por un estado "vacío", se respeta.
    let filtrados = perfiles;
    const estadosVacios = ["Pendiente", "Sin inicio", "Incompleto"];
    if (!estado || !estadosVacios.includes(estado)) {
      // "Diligenciado" = la candidata ya empezó a llenar su perfil (evaluación).
      filtrados = filtrados.filter(p => p.progreso > 0);
    }

    if (q) filtrados = filtrados.filter(p =>
      `${p.nombre||""} ${p.apellido||""} ${p.email||""} ${p.ciudad||""}`.toLowerCase().includes(q.toLowerCase())
    );
    if (estado) {
      // Filtrar por estado evaluación o agencia según contexto
      filtrados = filtrados.filter(p => p.estado === estado || p.estado_agencia === estado);
    }
    if (ciudad) filtrados = filtrados.filter(p =>
      (p.ciudad||"").toLowerCase().includes(ciudad.toLowerCase())
    );

    // Stats Tab 1 — evaluación
    const stats_evaluacion = {
      total:       perfiles.length,
      completos:   perfiles.filter(p => p.estado==="Completo").length,
      en_revision: perfiles.filter(p => p.estado==="En revisión").length,
      pendientes:  perfiles.filter(p => p.estado==="Pendiente").length,
      incompletos: perfiles.filter(p => p.estado==="Incompleto").length,
    };

    // Stats Tab 2 — agencia (todos los usuarios, no solo con acceso)
    const stats_agencia = {
      total:       perfiles.length,
      listos:      perfiles.filter(p => p.estado_agencia==="Lista para agencia").length,
      en_progreso: perfiles.filter(p => p.estado_agencia==="En progreso").length,
      en_revision: perfiles.filter(p => p.estado_agencia==="En revisión").length,
      incompletos: perfiles.filter(p => p.estado_agencia==="Incompleto"||p.estado_agencia==="Sin inicio").length,
    };

    return NextResponse.json({ perfiles: filtrados, stats_evaluacion, stats_agencia });

  } catch (err) {
    console.error("[GET /api/admin/perfiles]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}