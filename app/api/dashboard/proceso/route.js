// app/api/dashboard/proceso/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

const DEFINICION = [
  { id:"curso",             label:"Curso",                 sublabel_base:"Educación y preparación" },
  { id:"cuentanos_de_ti",   label:"Cuéntanos de ti",       sublabel_base:"Completa tu perfil" },
  { id:"evaluacion_perfil", label:"Evaluación de perfil",  sublabel_base:"Revisión por Destino Au Pair" },
  { id:"perfil_agencia",    label:"Perfil con la agencia", sublabel_base:"Activación con la agencia" },
  { id:"match",             label:"Match",                 sublabel_base:"Conexión con familias" },
  { id:"visa",              label:"Visa",                  sublabel_base:"Trámite y aprobación" },
  { id:"viaje",             label:"Viaje",                 sublabel_base:"Preparación final" },
];

function statusLabel(s) {
  return { completado:"Completado", en_revision:"En revisión", disponible:"Disponible", bloqueado:"Bloqueado" }[s] || "Bloqueado";
}

/* ── Status 100% automático a partir de datos reales del usuario ───────── */
function calcularAutoStatus({ id, usuario, evalStatusFinal, agenciaStatusFinal }) {
  switch (id) {
    case "cuentanos_de_ti": {
      // La candidata completa su perfil (Parte 1 + Parte 2). Se desbloquea al pagar.
      if (!usuario.perfil_habilitado)     return "bloqueado";
      if (!usuario.perfil_total_completo) return "disponible"; // en curso hasta completar AMBAS partes
      return "completado";
    }
    case "evaluacion_perfil": {
      // Revisión del equipo — solo después de que la candidata completó su perfil (ambas partes).
      if (!usuario.perfil_habilitado)     return "bloqueado";
      if (!usuario.perfil_total_completo) return "bloqueado";
      if (!usuario.evaluacion_aprobada)   return "en_revision";
      return "completado";
    }
    case "perfil_agencia": {
      if (evalStatusFinal !== "completado") return "bloqueado";
      if (!usuario.estado_agencia) return "disponible";
      if (usuario.estado_agencia === "Perfil en activación") return "completado";
      return "en_revision"; // En evaluación / Pago pendiente / En ajustes / No califica
    }
    case "match": {
      return agenciaStatusFinal === "completado" ? "disponible" : "bloqueado";
    }
    case "visa":
    case "viaje":
      return "bloqueado"; // sin dato automático todavía — requiere override del admin
    default:
      return "bloqueado";
  }
}

function buildResponse({ usuario, pasosBD = [], sesiones_completadas = 0, total_sesiones = 0 }) {
  const curso_completo   = total_sesiones > 0 && sesiones_completadas >= total_sesiones;
  const porcentaje_curso = total_sesiones > 0 ? Math.round((sesiones_completadas / total_sesiones) * 100) : 0;
  const mapaOverrides    = Object.fromEntries(pasosBD.map(p => [p.paso, { status: p.status, nota: p.nota }]));

  let evalStatusFinal    = null;
  let agenciaStatusFinal = null;

  const pasos = DEFINICION.map(def => {
    const override = mapaOverrides[def.id];
    let status;

    if (def.id === "curso") {
      status = curso_completo ? "completado" : "disponible";
    } else {
      const auto = calcularAutoStatus({ id: def.id, usuario, evalStatusFinal, agenciaStatusFinal });
      status = override?.status || auto;
    }

    if (def.id === "evaluacion_perfil") evalStatusFinal    = status;
    if (def.id === "perfil_agencia")    agenciaStatusFinal = status;

    return {
      ...def,
      status,
      nota: override?.nota || null,
      porcentaje: def.id === "curso" ? porcentaje_curso : null,
      sublabel_status: statusLabel(status),
    };
  });

  const enRevision  = pasos.find(p => p.status === "en_revision");
  const notificacion = enRevision ? {
    tipo:    "en_revision",
    paso_id: enRevision.id,
    texto:   `Tu ${enRevision.label.toLowerCase()} está en revisión por el equipo de Destino Au Pair.`,
    detalle: "Te notificaremos aquí y por correo cuando tengamos novedades.",
    link:    `/dashboard/${enRevision.id.replace(/_/g,"-")}`,
  } : null;

  const siguiente   = pasos.find(p => p.status === "en_revision" || p.status === "disponible");
  const proximoPaso = siguiente ? {
    id:          siguiente.id,
    titulo:      siguiente.status === "en_revision" ? `Estamos revisando tu ${siguiente.label.toLowerCase()}.` : `Continúa con: ${siguiente.label}`,
    detalle:     siguiente.status === "en_revision" ? "Este proceso puede tomar de 1 a 3 días hábiles." : "Haz clic para continuar con este paso.",
    link:        ({ curso:"/dashboard/curso", cuentanos_de_ti:"/dashboard/perfil", evaluacion_perfil:"/dashboard/perfil", perfil_agencia:"/dashboard/perfil", match:"/dashboard/comunidad", visa:"/dashboard/documentos", viaje:"/dashboard/documentos" })[siguiente.id] || "/dashboard",
    label_boton: siguiente.id === "curso" ? "Ver mi curso" : siguiente.status === "en_revision" ? `Ver mi ${siguiente.label.toLowerCase()}` : "Continuar",
  } : null;

  const recordatorios = pasos.slice(0, 3).map(p => ({
    id:      p.id,
    label:   p.id === "curso" ? "Finaliza el curso" : p.label,
    sublabel: p.id === "curso" && curso_completo ? "¡Felicidades!" : p.status === "en_revision" ? "En revisión" : p.status === "completado" ? "¡Completado!" : p.status === "disponible" ? "Disponible" : "Pendiente aprobación",
    estado:  p.status === "completado" ? "completado" : p.status === "en_revision" ? "en_curso" : "pendiente",
  }));

  return { pasos, notificacion, proximoPaso, recordatorios, porcentaje_curso, curso_completo };
}

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();
  const userId = session.id;

  const [[usuario]] = await dbAupair.query(
    `SELECT perfil_habilitado, perfil_completo, evaluacion_aprobada, estado_agencia,
            estatura, peso, nacionalidad, tiene_pasaporte, horas_childcare, tipo_licencia,
            bio, hobbies, por_que_au_pair, dieta_especial,
            referencia_1_nombre, referencia_1_email, referencia_2_nombre, referencia_2_email,
            foto_url, exp_ninos_externos, horas_exp_ninos, situacion_actual,
            carrera_graduada, licencia_conduccion, enfermedad_medicamentos
     FROM usuarios WHERE id = ?`,
    [userId]
  );

  // Parte 2 del perfil (perfil con la agencia) — misma regla que el frontend.
  if (usuario) {
    const SEC_AG = [
      ["estatura","peso","nacionalidad","tiene_pasaporte"],
      ["exp_ninos_externos","horas_exp_ninos","horas_childcare"],
      ["situacion_actual","carrera_graduada"],
      ["licencia_conduccion","tipo_licencia"],
      ["bio","hobbies"],
      ["por_que_au_pair"],
      ["enfermedad_medicamentos","dieta_especial"],
      ["referencia_1_nombre","referencia_1_email"],
      ["foto_url"],
    ];
    const secOk = SEC_AG.filter(cs =>
      cs.filter(c => usuario[c] && String(usuario[c]).trim() !== "" && usuario[c] !== "0").length >= Math.ceil(cs.length/2)
    ).length;
    usuario.perfil_agencia_completo = secOk === SEC_AG.length ? 1 : 0;
    // "Cuéntanos de ti" abarca ambas partes.
    usuario.perfil_total_completo = (usuario.perfil_completo && usuario.perfil_agencia_completo) ? 1 : 0;
  }

  let sesiones_completadas = 0;
  let total_sesiones       = 0;
  try {
    const [[a]] = await dbAupair.query("SELECT COUNT(*) AS n FROM sesiones");
    const [[b]] = await dbAupair.query(
      "SELECT COUNT(*) AS n FROM progreso_usuario WHERE id_usuario = ? AND completada = TRUE", [userId]
    );
    total_sesiones       = a.n;
    sesiones_completadas = b.n;
  } catch (_) {}

  let pasosBD = [];
  try {
    const [rows] = await dbAupair.query(
      "SELECT paso, status, nota FROM proceso_usuario WHERE usuario_id = ?", [userId]
    );
    pasosBD = rows;
  } catch (_) {}

  return NextResponse.json(buildResponse({
    usuario: usuario || {},
    pasosBD,
    sesiones_completadas,
    total_sesiones,
  }));
}

export async function PUT(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.rol !== "admin") return unauthorized();

  const { usuario_id, paso, status, nota } = await req.json();
  if (!usuario_id || !paso || !status)
    return NextResponse.json({ error: "usuario_id, paso y status son requeridos" }, { status: 400 });

  try {
    await dbAupair.query(`
      INSERT INTO proceso_usuario (usuario_id, paso, status, nota)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status), nota = VALUES(nota)
    `, [usuario_id, paso, status, nota || null]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}