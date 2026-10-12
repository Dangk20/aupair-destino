// app/api/dashboard/proceso/route.js
//
// Los pasos de "Mi Destino", el inicio y los paneles laterales de la
// candidata. Salen de las etapas (lib/etapas-candidata.js), la misma fuente
// que la ficha y el tablero.
//
// Antes tenía su propia regla de "perfil completo" (media sección contaba),
// leía overrides de `proceso_usuario` —una tabla que no existe— y dejaba Visa
// y Viaje siempre bloqueados. La forma de la respuesta se conserva: la leen
// cuatro pantallas.
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { requiereSesion } from "@/lib/session-aupair";
import { posicion } from "@/lib/etapas-candidata";
import { contextoEtapa } from "@/lib/historial-aupair";

/** Los pasos que ve la candidata. Revisión agrupa "En revisión" y "Con correcciones". */
const PASOS = [
  { id: "curso",      label: "Curso",                    sublabel_base: "Educación y preparación" },
  { id: "perfil",     label: "Tu perfil",                sublabel_base: "Completa y envía tu perfil",          etapas: ["diligenciando"] },
  { id: "revision",   label: "Revisión",                 sublabel_base: "Revisión por Destino Au Pair",       etapas: ["revision", "correcciones"] },
  { id: "agencia",    label: "Evaluación de la agencia", sublabel_base: "La agencia aliada evalúa tu perfil", etapas: ["evaluacion"] },
  { id: "plan",       label: "Elección de plan",         sublabel_base: "Eliges tu acompañamiento",           etapas: ["plan"] },
  { id: "pago",       label: "Pago confirmado",          sublabel_base: "La agencia confirma tu pago",        etapas: ["pago"] },
  { id: "visa",       label: "Visa",                     sublabel_base: "Trámite de tu visa",                 etapas: ["visa"] },
  { id: "completada", label: "¡Lista!",                  sublabel_base: "Proceso completado",                 etapas: ["completada"] },
];

const LINKS = {
  curso: "/dashboard/curso", perfil: "/dashboard/perfil", revision: "/dashboard/perfil",
  agencia: "/dashboard/proceso", plan: "/dashboard/proceso", pago: "/dashboard/proceso",
  visa: "/dashboard/documentos", completada: "/dashboard/proceso",
};

function statusLabel(s) {
  return { completado: "Completado", en_revision: "En revisión", disponible: "Disponible", bloqueado: "Bloqueado" }[s] || "Bloqueado";
}

/** Estado de cada paso a partir de la etapa. */
function statusDe(paso, etapa) {
  if (etapa === "no_califica" || etapa === "no_continua") {
    // El camino se detiene donde se detuvo: lo anterior cumplido, lo demás bloqueado.
    const hasta = etapa === "no_califica" ? posicion("revision") : posicion("evaluacion");
    const p = Math.min(...paso.etapas.map(posicion));
    return p < hasta ? "completado" : "bloqueado";
  }
  const actual = posicion(etapa);
  const desde  = Math.min(...paso.etapas.map(posicion));
  const hasta  = Math.max(...paso.etapas.map(posicion));
  if (etapa === "completada" && paso.id === "completada") return "completado";
  if (actual > hasta) return "completado";
  if (actual < desde) return "bloqueado";
  // Paso actual: le toca a ella (perfil, correcciones) o está esperando a otros.
  return etapa === "diligenciando" || etapa === "correcciones" ? "disponible" : "en_revision";
}

export async function GET(req) {
  const guard = requiereSesion(req);
  if (guard.error) return guard.error;
  const userId = guard.session.id;

  try {
    const ctx = await contextoEtapa(userId);
    if (!ctx) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    let sesiones_completadas = 0, total_sesiones = 0;
    try {
      const [[a]] = await dbAupair.query("SELECT COUNT(*) AS n FROM sesiones");
      const [[b]] = await dbAupair.query(
        "SELECT COUNT(*) AS n FROM progreso_usuario WHERE id_usuario = ? AND completada = TRUE", [userId]
      );
      total_sesiones = a.n; sesiones_completadas = b.n;
    } catch (_) { /* sin curso cargado: el paso queda disponible */ }

    const curso_completo   = total_sesiones > 0 && sesiones_completadas >= total_sesiones;
    const porcentaje_curso = total_sesiones > 0 ? Math.round((sesiones_completadas / total_sesiones) * 100) : 0;

    const pasos = PASOS.map(({ etapas, ...def }) => {
      const status = def.id === "curso"
        ? (curso_completo ? "completado" : "disponible")
        : statusDe({ id: def.id, etapas }, ctx.etapa);
      return {
        ...def, status, nota: null,
        porcentaje: def.id === "curso" ? porcentaje_curso : null,
        sublabel_status: statusLabel(status),
      };
    });

    const enRevision = pasos.find((p) => p.status === "en_revision");
    const notificacion = enRevision ? {
      tipo: "en_revision", paso_id: enRevision.id,
      texto: enRevision.id === "revision"
        ? "Tu perfil está en revisión por el equipo de Destino Au Pair."
        : `Estás en «${enRevision.label}».`,
      detalle: "Te notificaremos aquí y por correo cuando tengamos novedades.",
      link: "/dashboard/proceso",
    } : null;

    const siguiente = pasos.find((p) => p.id !== "curso" && (p.status === "en_revision" || p.status === "disponible"))
                   || pasos.find((p) => p.status === "disponible");
    const proximoPaso = siguiente ? {
      id: siguiente.id,
      titulo: ctx.etapa === "correcciones" ? "El equipo te pidió corregir algunos datos."
            : siguiente.status === "en_revision" ? `Estamos en «${siguiente.label}».` : `Continúa con: ${siguiente.label}`,
      detalle: ctx.etapa === "correcciones" ? "Entra a tu perfil: verás qué corregir junto a cada dato."
             : siguiente.status === "en_revision" ? "Te avisaremos cuando haya novedades." : "Haz clic para continuar con este paso.",
      link: LINKS[siguiente.id] || "/dashboard",
      label_boton: siguiente.id === "curso" ? "Ver mi curso"
                 : ctx.etapa === "correcciones" ? "Ver mis correcciones"
                 : siguiente.status === "en_revision" ? "Ver mi proceso" : "Continuar",
    } : null;

    const recordatorios = pasos.slice(0, 3).map((p) => ({
      id: p.id,
      label: p.id === "curso" ? "Finaliza el curso" : p.label,
      sublabel: p.id === "curso" && curso_completo ? "¡Felicidades!" : statusLabel(p.status),
      estado: p.status === "completado" ? "completado" : p.status === "en_revision" ? "en_curso" : "pendiente",
    }));

    return NextResponse.json({
      pasos, notificacion, proximoPaso, recordatorios, porcentaje_curso, curso_completo,
      etapa: ctx.etapa,
      agencia: ctx.relacion ? ctx.relacion.agencia_nombre : null,
    });
  } catch (err) {
    console.error("[GET /api/dashboard/proceso]", err);
    return NextResponse.json({ error: "Error al cargar el proceso." }, { status: 500 });
  }
}
