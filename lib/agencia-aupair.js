// ════════════════════════════════════════════════════════════════════════
// lib/agencia-aupair.js — Qué candidatas son de una agencia
//
// Una agencia sólo ve y mueve a las candidatas que el equipo aprobó y le
// envió: las que tienen relación con ella en `candidata_agencia`. Toda ruta de
// la agencia sobre una candidata pasa por aquí; ajena = 404, para no confirmar
// siquiera que existe.
// ════════════════════════════════════════════════════════════════════════
import dbAupair from "@/lib/db-aupair";

/** La relación de la candidata con esta agencia, o null si no es suya. */
export async function candidataDeAgencia(agenciaId, candidataId) {
  const [[rel]] = await dbAupair.query(
    "SELECT * FROM candidata_agencia WHERE candidata_id = ? AND agencia_id = ?",
    [Number(candidataId) || 0, Number(agenciaId) || 0]
  );
  return rel || null;
}
