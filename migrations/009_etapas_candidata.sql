-- ════════════════════════════════════════════════════════════════════════
-- 009_etapas_candidata.sql — change `etapas-candidata`, tarea 1.1
--
-- El recorrido de la candidata con un solo vocabulario (definido con la
-- clienta el 2026-10-12):
--
--   Diligenciando → En revisión → Con correcciones → Evaluación de la agencia
--   → Elección de plan → Pago confirmado → Visa → Completada
--   salidas: No califica (Destino Au Pair) · No continúa (agencia o candidata)
--
--   usuarios.decision_dap / _at / _motivo
--     La decisión del equipo, con fecha. El motivo es interno (No califica).
--     `evaluacion_aprobada` se conserva sincronizada: la leen otras pantallas.
--
--   candidata_agencia
--     La agencia de la candidata y su etapa con ella. UNA por candidata por
--     ahora (índice único): si la clienta valida varias, se quita el índice.
--
--   historial_candidata
--     Cada hecho del recorrido con fecha y autor. Alimenta la línea de tiempo.
--     `interno = 1` no se le muestra a la candidata.
--
-- Relleno: registro y envíos con sus fechas reales; las aprobaciones previas,
-- que no tenían fecha, con la de la migración y dicho en el detalle.
--
-- Idempotente: se puede correr varias veces.
-- ════════════════════════════════════════════════════════════════════════

SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'usuarios'
                 AND column_name = 'decision_dap');
SET @sql := IF(@falta,
  "ALTER TABLE usuarios ADD COLUMN decision_dap ENUM('aprobada','no_califica') NULL, ADD COLUMN decision_dap_at DATETIME NULL, ADD COLUMN decision_dap_motivo TEXT NULL",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS candidata_agencia (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  candidata_id INT NOT NULL,
  agencia_id   INT NOT NULL,
  etapa        ENUM('evaluacion','plan','pago','visa','completada','no_continua') NOT NULL DEFAULT 'evaluacion',
  etapa_desde  DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_candidata_agencia (candidata_id),
  CONSTRAINT fk_ca_candidata FOREIGN KEY (candidata_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_ca_agencia   FOREIGN KEY (agencia_id)   REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS historial_candidata (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  candidata_id INT          NOT NULL,
  evento       VARCHAR(40)  NOT NULL,
  agencia_id   INT          NULL,
  detalle      TEXT         NULL,
  interno      TINYINT(1)   NOT NULL DEFAULT 0,
  actor_id     INT          NULL,
  actor_rol    VARCHAR(20)  NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_historial_candidata (candidata_id, created_at),
  CONSTRAINT fk_hist_candidata FOREIGN KEY (candidata_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Relleno (sólo hechos que aún no estén) ──────────────────────────────
INSERT INTO historial_candidata (candidata_id, evento, created_at)
SELECT u.id, 'registro', u.created_at FROM usuarios u
WHERE u.rol = 'usuaria' AND u.created_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM historial_candidata h WHERE h.candidata_id = u.id AND h.evento = 'registro');

INSERT INTO historial_candidata (candidata_id, evento, actor_id, actor_rol, created_at)
SELECT u.id, 'parte1_enviada', u.id, 'usuaria', u.parte1_enviada_at FROM usuarios u
WHERE u.rol = 'usuaria' AND u.parte1_enviada_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM historial_candidata h WHERE h.candidata_id = u.id AND h.evento = 'parte1_enviada');

INSERT INTO historial_candidata (candidata_id, evento, actor_id, actor_rol, created_at)
SELECT u.id, 'parte2_enviada', u.id, 'usuaria', u.parte2_enviada_at FROM usuarios u
WHERE u.rol = 'usuaria' AND u.parte2_enviada_at IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM historial_candidata h WHERE h.candidata_id = u.id AND h.evento = 'parte2_enviada');

UPDATE usuarios SET decision_dap = 'aprobada', decision_dap_at = NOW()
WHERE rol = 'usuaria' AND evaluacion_aprobada = 1 AND decision_dap IS NULL;

INSERT INTO historial_candidata (candidata_id, evento, detalle)
SELECT u.id, 'aprobada', 'Aprobada antes de que existiera el historial: la fecha es la de la migración.'
FROM usuarios u
WHERE u.rol = 'usuaria' AND u.decision_dap = 'aprobada'
  AND NOT EXISTS (SELECT 1 FROM historial_candidata h WHERE h.candidata_id = u.id AND h.evento = 'aprobada');
