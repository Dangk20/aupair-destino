// ════════════════════════════════════════════════════════════════════════
// lib/historial-aupair.js — El recorrido de la candidata, en la base
//
// Tres cosas, y este archivo es su dueño único:
//
//   registrarHecho()   cada hecho del recorrido, con fecha y autor. Nunca
//                      lanza: un fallo del historial no tumba la operación que
//                      lo originó (la misma garantía que el correo).
//   moverEtapa()       la etapa de la candidata con su agencia. Lo usa el admin
//                      y lo usará la agencia: ninguna ruta escribe
//                      `candidata_agencia.etapa` por su cuenta.
//   contextoEtapa()    lo que hace falta para calcular la etapa y el score.
//
// Las reglas puras están en lib/etapas-candidata.js.
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";
import { ETAPAS_AGENCIA, etapaDe, scoreInformacion, etapaPorId } from "@/lib/etapas-candidata";

/** Qué dice cada hecho. `etapa` = a qué etapa lleva, para la línea de tiempo. */
export const HECHOS = {
  registro:        { texto: "Se registró en Destino Au Pair", etapa: "diligenciando" },
  parte1_enviada:  { texto: "Envió la Parte 1 de su perfil", etapa: "revision" },
  parte2_enviada:  { texto: "Envió la Parte 2 de su perfil" },
  correcciones:    { texto: "El equipo le pidió correcciones", etapa: "correcciones" },
  aprobada:        { texto: "Aprobada por Destino Au Pair", etapa: "evaluacion" },
  no_califica:     { texto: "No califica para el programa", etapa: "no_califica" },
  decision_revertida: { texto: "El equipo retomó la revisión de su perfil", etapa: "revision" },
  agencia_asignada:{ texto: "Se asignó la agencia", etapa: "evaluacion" },
  etapa:           { texto: "Cambió de etapa" },
};

/**
 * Registra un hecho. Nunca lanza.
 * @param {{ candidataId:number, evento:string, agenciaId?:number, detalle?:string,
 *           interno?:boolean, actor?:{id:number, rol:string} }} h
 */
export async function registrarHecho({ candidataId, evento, agenciaId = null, detalle = null, interno = false, actor = null }) {
  try {
    await dbAupair.query(
      `INSERT INTO historial_candidata (candidata_id, evento, agencia_id, detalle, interno, actor_id, actor_rol)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [candidataId, evento, agenciaId, detalle, interno ? 1 : 0, actor?.id ?? null, actor?.rol ?? null]
    );
  } catch (err) {
    console.error("[historial] no se pudo registrar", evento, candidataId, err.message);
  }
}

/**
 * El historial de una candidata, en orden. `paraCandidata` quita lo interno y
 * el autor: la candidata ve qué pasó y cuándo, no quién del equipo lo hizo.
 */
export async function historialDe(candidataId, { paraCandidata = false } = {}) {
  const [filas] = await dbAupair.query(
    `SELECT h.id, h.evento, h.detalle, h.interno, h.created_at, h.actor_rol,
            CONCAT_WS(' ', a.nombre, a.apellido) AS actor_nombre,
            CONCAT_WS(' ', ag.nombre, ag.apellido) AS agencia_nombre
     FROM historial_candidata h
     LEFT JOIN usuarios a  ON a.id  = h.actor_id
     LEFT JOIN usuarios ag ON ag.id = h.agencia_id
     WHERE h.candidata_id = ? ${paraCandidata ? "AND h.interno = 0" : ""}
     ORDER BY h.created_at ASC, h.id ASC`,
    [candidataId]
  );
  return filas.map((f) => {
    const base = HECHOS[f.evento] || { texto: f.evento };
    // Un cambio de etapa se nombra por la etapa a la que llegó (va en `detalle`).
    const etapa = f.evento === "etapa" ? f.detalle : base.etapa || null;
    const texto = f.evento === "etapa" ? `Pasó a «${etapaPorId(f.detalle)?.label || f.detalle}»` : base.texto;
    const hecho = { id: f.id, evento: f.evento, texto, etapa, fecha: f.created_at, agencia: f.agencia_nombre || null };
    if (paraCandidata) return hecho;
    return { ...hecho, detalle: f.evento === "etapa" ? null : f.detalle, interno: !!f.interno,
             actor: f.actor_nombre || null, actor_rol: f.actor_rol || null };
  });
}

/** Perfil, observaciones abiertas, relación con la agencia y documentos de una candidata. */
export async function contextoEtapa(candidataId) {
  const [[perfil]] = await dbAupair.query("SELECT * FROM usuarios WHERE id = ?", [candidataId]);
  if (!perfil) return null;
  const [[{ abiertas }]] = await dbAupair.query(
    "SELECT COUNT(*) AS abiertas FROM observaciones_perfil WHERE usuario_id = ? AND estado = 'abierta'",
    [candidataId]
  );
  const [[relacion]] = await dbAupair.query(
    `SELECT ca.*, CONCAT_WS(' ', ag.nombre, ag.apellido) AS agencia_nombre
     FROM candidata_agencia ca JOIN usuarios ag ON ag.id = ca.agencia_id
     WHERE ca.candidata_id = ?`,
    [candidataId]
  );
  const [docs] = await dbAupair.query(
    "SELECT DISTINCT tipo_doc FROM documentos_usuario WHERE usuario_id = ?", [candidataId]
  );
  const etapa = etapaDe({ perfil, abiertas: Number(abiertas), relacion: relacion || null });
  return {
    perfil, relacion: relacion || null, abiertas: Number(abiertas), etapa,
    score: scoreInformacion(perfil, docs.map((d) => d.tipo_doc)),
  };
}

/**
 * Mueve la etapa de la candidata con su agencia. Sólo etapas de la agencia, y
 * sólo si ya tiene agencia. Registra el hecho.
 * @returns {Promise<{ ok:boolean, error?:string, status?:number }>}
 */
export async function moverEtapa({ candidataId, etapa, actor, agenciaId = null }) {
  if (!ETAPAS_AGENCIA.includes(etapa)) {
    return { ok: false, status: 400, error: "Esa etapa no se mueve a mano: se calcula de los datos." };
  }
  const [[rel]] = await dbAupair.query(
    "SELECT * FROM candidata_agencia WHERE candidata_id = ?", [candidataId]
  );
  if (!rel) return { ok: false, status: 409, error: "La candidata todavía no tiene agencia." };
  // La agencia sólo mueve a sus candidatas (lo exige su ruta; aquí, por si acaso).
  if (agenciaId && rel.agencia_id !== agenciaId) return { ok: false, status: 403, error: "No es candidata de esta agencia." };
  if (rel.etapa === etapa) return { ok: true };

  await dbAupair.query(
    "UPDATE candidata_agencia SET etapa = ?, etapa_desde = NOW() WHERE candidata_id = ?",
    [etapa, candidataId]
  );
  await registrarHecho({ candidataId, evento: "etapa", detalle: etapa, agenciaId: rel.agencia_id, actor });
  return { ok: true };
}
