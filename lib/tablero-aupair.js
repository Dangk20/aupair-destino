// ════════════════════════════════════════════════════════════════════════
// lib/tablero-aupair.js — Las candidatas, cada una en su etapa
//
// Se calcula en lote (cinco consultas, no cinco por candidata) con las mismas
// reglas que la ficha: lib/etapas-candidata.js. Lo usa el tablero del admin y
// lo usará el de la agencia, filtrado por `agenciaId`.
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";
import { etapaDe, scoreInformacion } from "@/lib/etapas-candidata";
import { noLeidosPorCandidata } from "@/lib/conversaciones-aupair";

/**
 * @param {{ agenciaId?:number, actor?:{id:number, rol:string} }} o
 *   `actor`: para contar sus mensajes sin leer en cada candidata.
 */
export async function tablero({ agenciaId = null, actor = null } = {}) {
  const [perfiles] = await dbAupair.query(
    agenciaId
      ? "SELECT u.* FROM usuarios u JOIN candidata_agencia ca ON ca.candidata_id = u.id WHERE u.rol = 'usuaria' AND ca.agencia_id = ?"
      : "SELECT * FROM usuarios WHERE rol = 'usuaria'",
    agenciaId ? [agenciaId] : []
  );
  const [abiertas] = await dbAupair.query(
    "SELECT usuario_id, COUNT(*) AS n FROM observaciones_perfil WHERE estado = 'abierta' GROUP BY usuario_id"
  );
  const [relaciones] = await dbAupair.query(
    `SELECT ca.*, CONCAT_WS(' ', ag.nombre, ag.apellido) AS agencia_nombre
     FROM candidata_agencia ca JOIN usuarios ag ON ag.id = ca.agencia_id`
  );
  const [docs] = await dbAupair.query("SELECT DISTINCT usuario_id, tipo_doc FROM documentos_usuario");
  const [ultimos] = await dbAupair.query(
    "SELECT candidata_id, MAX(created_at) AS ultimo FROM historial_candidata GROUP BY candidata_id"
  );

  const noLeidos = actor ? await noLeidosPorCandidata(actor) : new Map();

  const nAbiertas = new Map(abiertas.map((a) => [a.usuario_id, Number(a.n)]));
  const rel       = new Map(relaciones.map((r) => [r.candidata_id, r]));
  const ultimo    = new Map(ultimos.map((r) => [r.candidata_id, r.ultimo]));
  const tipos     = new Map();
  for (const d of docs) tipos.set(d.usuario_id, [...(tipos.get(d.usuario_id) || []), d.tipo_doc]);

  return perfiles.map((p) => {
    const r = rel.get(p.id) || null;
    return {
      id: p.id,
      nombre: `${p.nombre || ""} ${p.apellido || ""}`.trim(),
      ciudad: p.ciudad || null,
      telefono: p.telefono || null,
      email: p.email || null,
      foto_url: p.foto_url || null,
      fecha_nacimiento: p.fecha_nacimiento || null,
      no_leidos: noLeidos.get(p.id) || 0,
      etapa: etapaDe({ perfil: p, abiertas: nAbiertas.get(p.id) || 0, relacion: r }),
      score: scoreInformacion(p, tipos.get(p.id) || []),
      agencia: r ? r.agencia_nombre : null,
      // Desde cuándo está en la etapa: el cambio de etapa con la agencia, o el
      // último hecho del historial.
      desde: r?.etapa_desde || ultimo.get(p.id) || p.created_at,
    };
  });
}
