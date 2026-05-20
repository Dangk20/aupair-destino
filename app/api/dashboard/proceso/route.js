// app/api/dashboard/proceso/route.js
import { NextResponse } from "next/server";
import dbAupair from "@/lib/db-aupair";
import { getSessionFromRequest, unauthorized } from "@/lib/session-aupair";

export async function GET(req) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();
  const userId = session.id;

  // ── Progreso del curso ────────────────────────────────────────────────────
  const [[{ total_sesiones }]] = await dbAupair.query(
    "SELECT COUNT(*) AS total_sesiones FROM sesiones"
  );
  const [[{ sesiones_completadas }]] = await dbAupair.query(
    "SELECT COUNT(*) AS sesiones_completadas FROM progreso_usuario WHERE id_usuario = ? AND completada = TRUE",
    [userId]
  );
  const curso_completo = sesiones_completadas >= total_sesiones;

  // ── Estado de cada paso desde tabla proceso_usuario ────────────────────────
  // Tabla: proceso_usuario (id, usuario_id, paso VARCHAR, status ENUM('bloqueado','disponible','en_revision','completado'), updated_at)
  // Los pasos: 'curso', 'evaluacion_perfil', 'perfil_agencia', 'match', 'visa', 'viaje'
  const [pasosBD] = await dbAupair.query(
    "SELECT paso, status FROM proceso_usuario WHERE usuario_id = ?",
    [userId]
  );
  const mapaEstados = Object.fromEntries(pasosBD.map(p=>[p.paso, p.status]));

  // Definición de los pasos con su estado derivado
  const pasos = [
    { id:"curso",            label:"Curso",                 sublabel: curso_completo ? "Completado" : "En curso" },
    { id:"evaluacion_perfil",label:"Evaluación de perfil",  sublabel: null },
    { id:"perfil_agencia",   label:"Perfil con la agencia", sublabel: null },
    { id:"match",            label:"Match",                 sublabel: null },
    { id:"visa",             label:"Visa",                  sublabel: null },
    { id:"viaje",            label:"Viaje",                 sublabel: null },
  ].map(p => {
    let status = mapaEstados[p.id] || "bloqueado";
    // El curso se deriva del progreso real
    if (p.id === "curso") status = curso_completo ? "completado" : "disponible";
    return { ...p, status, sublabel: p.sublabel || statusLabel(status) };
  });

  // ── Notificación activa (primer paso en revisión o disponible) ─────────────
  const pasoActivo = pasos.find(p=>p.status==="en_revision" || (p.status==="disponible" && p.id!=="curso"));
  let notificacion = null;
  if (pasoActivo?.status === "en_revision") {
    notificacion = {
      tipo: "en_revision",
      texto: `Tu ${pasoActivo.label.toLowerCase()} está en revisión por el equipo de Destino Au Pair.`,
      detalle: "Te notificaremos aquí y por correo cuando tengamos novedades.",
      link: `/dashboard/${pasoActivo.id}`,
    };
  }

  // ── Próximo paso para el sidebar derecho ──────────────────────────────────
  const siguientePaso = pasos.find(p=>p.status==="en_revision"||p.status==="disponible");
  const proximoPaso = siguientePaso ? {
    titulo: mensajeProximoPaso(siguientePaso),
    detalle: detallePaso(siguientePaso),
    link:    `/dashboard/${siguientePaso.id}`,
    label_boton: labelBoton(siguientePaso),
  } : null;

  return NextResponse.json({ pasos, notificacion, proximoPaso });
}

function statusLabel(s) {
  return { completado:"Completado", en_revision:"En revisión", disponible:"Disponible", bloqueado:"Bloqueado" }[s] || "Bloqueado";
}
function mensajeProximoPaso(p) {
  if (p.status==="en_revision") return `Estamos revisando tu ${p.label.toLowerCase()}.`;
  return `Completa tu ${p.label.toLowerCase()}.`;
}
function detallePaso(p) {
  if (p.status==="en_revision") return "Este proceso puede tomar de 1 a 3 días hábiles.";
  return "Haz clic para continuar con este paso.";
}
function labelBoton(p) {
  if (p.id==="curso") return "Ver mi curso";
  if (p.status==="en_revision") return `Ver mi ${p.id.replace("_"," ")}`;
  return "Continuar";
}

/* ── SQL para crear la tabla si no existe ────────────────────────────────────
CREATE TABLE IF NOT EXISTS proceso_usuario (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  paso        VARCHAR(50) NOT NULL,
  status      ENUM('bloqueado','disponible','en_revision','completado') DEFAULT 'bloqueado',
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuario_paso (usuario_id, paso),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Insertar pasos por defecto cuando un usuario se registra:
INSERT INTO proceso_usuario (usuario_id, paso, status) VALUES
  (NEW_USER_ID, 'curso',             'disponible'),
  (NEW_USER_ID, 'evaluacion_perfil', 'bloqueado'),
  (NEW_USER_ID, 'perfil_agencia',    'bloqueado'),
  (NEW_USER_ID, 'match',             'bloqueado'),
  (NEW_USER_ID, 'visa',              'bloqueado'),
  (NEW_USER_ID, 'viaje',             'bloqueado');
─────────────────────────────────────────────────────────────────────────────── */