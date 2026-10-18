-- ════════════════════════════════════════════════════════════════════════
-- 016_agenda_semanal.sql — change `agenda-rango-bloques` (horario semanal)
--
-- Como Google Calendar (Daniel, 17 oct 2026): el horario semanal se repite
-- sin fecha de fin y un día puntual se puede ajustar aparte.
--
--   agenda_horario      el horario semanal de cada persona del equipo: la
--                       duración de la cita y los rangos por día de la semana
--                       (JSON {"1":[["09:00","12:00"]], …}, 0 = domingo). El
--                       sistema mantiene abiertos los cupos de los próximos 60
--                       días (lib/agenda-aupair.js · sincronizar).
--   agenda_excepciones  días que NO siguen el horario semanal: se configuraron
--                       a mano (sus franjas son las de ese día, o ninguna).
--   agenda_franjas.origen  'semanal' = la generó el horario; 'dia' = a mano.
--
-- Idempotente.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agenda_horario (
  dueno_id      INT          NOT NULL PRIMARY KEY,
  duracion_min  SMALLINT     NOT NULL,
  plan          JSON         NOT NULL,
  url_meet      VARCHAR(500) NULL,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_horario_dueno FOREIGN KEY (dueno_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS agenda_excepciones (
  dueno_id  INT  NOT NULL,
  fecha     DATE NOT NULL,
  PRIMARY KEY (dueno_id, fecha),
  CONSTRAINT fk_excepcion_dueno FOREIGN KEY (dueno_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'agenda_franjas' AND column_name = 'origen');
SET @sql := IF(@falta, "ALTER TABLE agenda_franjas ADD COLUMN origen ENUM('semanal','dia') NOT NULL DEFAULT 'dia'", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
