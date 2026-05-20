// app/api/dashboard/proceso/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

/* ── Definición fija de los 6 pasos ─────────────────────────────────────── */
const DEFINICION = [
  { id:"curso",             label:"Curso",                 sublabel_base:"Educación y preparación" },
  { id:"evaluacion_perfil", label:"Evaluación de perfil",  sublabel_base:"Revisión por Destino Au Pair" },
  { id:"perfil_agencia",    label:"Perfil con la agencia", sublabel_base:"Activación con UNO800" },
  { id:"match",             label:"Match",                 sublabel_base:"Conexión con familias" },
  { id:"visa",              label:"Visa",                  sublabel_base:"Trámite y aprobación" },
  { id:"viaje",             label:"Viaje",                 sublabel_base:"Preparación final" },
];

function statusLabel(s) {
  return { completado:"Completado", en_revision:"En revisión", disponible:"Disponible", bloqueado:"Bloqueado" }[s] || "Bloqueado";
}

function buildResponse({ pasosBD = [], sesiones_completadas = 0, total_sesiones = 0 }) {
  const curso_completo   = total_sesiones > 0 && sesiones_completadas >= total_sesiones;
  const porcentaje_curso = total_sesiones > 0 ? Math.round((sesiones_completadas / total_sesiones) * 100) : 0;
  const mapaEstados      = Object.fromEntries(pasosBD.map(p => [p.paso, { status: p.status, nota: p.nota }]));

  const pasos = DEFINICION.map(def => {
    const bd     = mapaEstados[def.id];
    let status   = bd?.status || "bloqueado";
    if (def.id === "curso") status = curso_completo ? "completado" : "disponible";
    return { ...def, status, nota: bd?.nota || null, porcentaje: def.id === "curso" ? porcentaje_curso : null, sublabel_status: statusLabel(status) };
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
    link:        ({ curso:"/dashboard/curso", evaluacion_perfil:"/dashboard/perfil", perfil_agencia:"/dashboard/perfil", match:"/dashboard/comunidad", visa:"/dashboard/documentos", viaje:"/dashboard/documentos" })[siguiente.id] || "/dashboard",
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

/* ── GET ────────────────────────────────────────────────────────────────── */
export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();
  const userId = session.id;

  // Progreso del curso — siempre intenta leer esto
  let sesiones_completadas = 0;
  let total_sesiones       = 0;
  try {
    const [[a]] = await dbAupair.query("SELECT COUNT(*) AS n FROM sesiones");
    const [[b]] = await dbAupair.query(
      "SELECT COUNT(*) AS n FROM progreso_usuario WHERE id_usuario = ? AND completada = TRUE", [userId]
    );
    total_sesiones       = a.n;
    sesiones_completadas = b.n;
  } catch (_) { /* tabla progreso_usuario no existe aún — OK */ }

  // Estados de pasos — puede no existir la tabla todavía
  let pasosBD = [];
  try {
    const [rows] = await dbAupair.query(
      "SELECT paso, status, nota FROM proceso_usuario WHERE usuario_id = ?", [userId]
    );
    pasosBD = rows;
  } catch (_) { /* tabla proceso_usuario no existe — devolver defaults */ }

  return NextResponse.json(buildResponse({ pasosBD, sesiones_completadas, total_sesiones }));
}

/* ── PUT (solo admin) ───────────────────────────────────────────────────── */
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

/* ── SQL (ejecutar 1 vez cuando quieras activar el sistema de pasos) ──────
CREATE TABLE IF NOT EXISTS proceso_usuario (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT         NOT NULL,
  paso        VARCHAR(50) NOT NULL,
  status      ENUM('bloqueado','disponible','en_revision','completado') NOT NULL DEFAULT 'bloqueado',
  nota        TEXT        NULL,
  updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuario_paso (usuario_id, paso),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
────────────────────────────────────────────────────────────────────────── */