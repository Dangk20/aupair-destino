-- ════════════════════════════════════════════════════════════════════════
-- 008_observaciones_perfil.sql — change `bloqueo-y-observaciones-perfil`, tarea 1.1
--
-- El ciclo de revisión del perfil (R3, reunión del 2026-08-05): la candidata
-- envía cada parte, y desde ese momento sólo puede cambiar lo que el admin le
-- reabra con una observación — un campo, una sección o un documento.
--
--   usuarios.parte1_enviada_at / parte2_enviada_at
--     Cuándo envió cada parte. NULL = no enviada: la parte sigue editable.
--     Los perfiles terminados antes de este cambio quedan en NULL a propósito:
--     cerrarlos de golpe impediría corregir a las candidatas que figuran
--     incompletas por los campos que se volvieron obligatorios.
--
--   observaciones_perfil
--     Una fila por observación. `abierta` deja editable su elemento; cuando la
--     candidata guarda la corrección pasa a `atendida` y el elemento se vuelve
--     a cerrar; el admin la deja en `cerrada` al darla por buena (o al
--     retirarla sin que se atendiera).
--     El elemento se identifica por `tipo` y sus columnas: campo → `campo`
--     (nombre de columna en usuarios); seccion → `parte` + `seccion` (los ids
--     de sección se repiten entre partes); documento → `tipo_doc`.
--
-- Idempotente: se puede correr varias veces.
-- ════════════════════════════════════════════════════════════════════════

SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'usuarios'
                 AND column_name = 'parte1_enviada_at');
SET @sql := IF(@falta,
  'ALTER TABLE usuarios ADD COLUMN parte1_enviada_at DATETIME NULL, ADD COLUMN parte2_enviada_at DATETIME NULL',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS observaciones_perfil (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT          NOT NULL,
  tipo        ENUM('campo','seccion','documento') NOT NULL,
  parte       TINYINT      NULL,
  seccion     VARCHAR(40)  NULL,
  campo       VARCHAR(64)  NULL,
  tipo_doc    VARCHAR(40)  NULL,
  texto       TEXT         NOT NULL,
  estado      ENUM('abierta','atendida','cerrada') NOT NULL DEFAULT 'abierta',
  creada_por  INT          NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  atendida_at DATETIME     NULL,
  cerrada_at  DATETIME     NULL,
  INDEX idx_obs_usuario_estado (usuario_id, estado),
  CONSTRAINT fk_obs_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
