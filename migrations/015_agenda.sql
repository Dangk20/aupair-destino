-- ════════════════════════════════════════════════════════════════════════
-- 015_agenda.sql — change `agenda-rango-bloques`, tarea 1.1
--
--   agenda_franjas        la disponibilidad que configura el equipo: un rango
--                         (hora_inicio–hora_fin) partido en bloques de
--                         `duracion_min`. Sus cupos son filas de `disponibilidad`.
--   disponibilidad.franja_id   la franja que generó el cupo. NULL = cupo suelto
--                         del modelo anterior (ya no se ofrece a las candidatas).
--   reuniones.cupo_activo el cupo mientras la reunión no esté cancelada (NULL al
--                         cancelar); único:
--                         dos reuniones activas no pueden compartir cupo aunque
--                         dos peticiones lleguen a la vez.
--
-- Idempotente.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agenda_franjas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  dueno_id      INT          NOT NULL,
  fecha         DATE         NOT NULL,
  hora_inicio   TIME         NOT NULL,
  hora_fin      TIME         NOT NULL,
  duracion_min  SMALLINT     NOT NULL,
  url_meet      VARCHAR(500) NULL,
  notas         TEXT         NULL,
  creado_por    INT          NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  KEY idx_franja_fecha (fecha),
  KEY idx_franja_dueno (dueno_id, fecha),
  CONSTRAINT fk_franja_dueno FOREIGN KEY (dueno_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'disponibilidad' AND column_name = 'franja_id');
SET @sql := IF(@falta, "ALTER TABLE disponibilidad ADD COLUMN franja_id INT NULL, ADD KEY idx_disp_franja (franja_id), ADD CONSTRAINT fk_disp_franja FOREIGN KEY (franja_id) REFERENCES agenda_franjas(id) ON DELETE CASCADE", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'reuniones' AND column_name = 'cupo_activo');
-- Columna normal y no generada: MySQL no admite una columna generada sobre
-- `disponibilidad_id`, que tiene una llave foránea en cascada. La mantiene
-- lib/agenda-aupair.js: se llena al reservar y vuelve a NULL al cancelar.
SET @sql := IF(@falta, "ALTER TABLE reuniones ADD COLUMN cupo_activo INT NULL, ADD UNIQUE KEY uq_reunion_cupo_activo (cupo_activo)", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF(@falta, "UPDATE reuniones SET cupo_activo = disponibilidad_id WHERE estado <> 'cancelada'", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
