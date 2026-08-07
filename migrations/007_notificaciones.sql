-- ════════════════════════════════════════════════════════════════════════
-- 007_notificaciones.sql — change `notificaciones-correo`, tarea 2.1
--
-- Registro de todo correo que la plataforma intenta enviar: a quién salió, por
-- qué evento, cuándo y con qué resultado. Cumple dos funciones:
--
--   1. Auditoría. Hoy un correo que falla sólo deja rastro en el log del
--      contenedor, y por eso nadie notó que producción llevaba desde el
--      2026-07-23 sin enviar nada (RESEND_API_KEY vacía en el .env del VPS).
--      Con esta tabla, "¿le llegó el correo a la candidata?" se responde con
--      una consulta.
--
--   2. Idempotencia. `clave_unica` es la que impide que un aviso de una sola
--      vez se repita: el módulo inserta la fila ANTES de enviar, y si choca
--      con el índice único, es que ese aviso ya salió. Mismo mecanismo que
--      `codigos_promo_usos` usa para el consumo de cupo — el hecho queda
--      representado por la fila, no por una bandera aparte.
--
--      Los avisos repetibles por diseño (reunión agendada, reunión cancelada)
--      dejan `clave_unica` en NULL. MySQL admite varios NULL en un índice
--      único, así que conviven sin tocar el esquema.
--
-- `destinatario` guarda el correo textual y no una FK a `usuarios`: un aviso
-- puede salir hacia una dirección que después cambie o se retire, y lo que
-- interesa auditar es a dónde salió de verdad. `usuario_id` es la candidata a
-- la que se REFIERE el aviso, que no siempre es quien lo recibe (el aviso de
-- registro habla de la candidata pero llega al admin).
--
-- Idempotente: se puede correr varias veces.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notificaciones (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  evento       VARCHAR(60)  NOT NULL,
  destinatario VARCHAR(190) NOT NULL,
  usuario_id   INT          NULL,
  asunto       VARCHAR(255) NOT NULL,
  estado       ENUM('enviado','fallido','omitido') NOT NULL,
  detalle      VARCHAR(500) NULL,
  clave_unica  VARCHAR(120) NULL,
  creado_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_notificacion (clave_unica),
  KEY idx_evento (evento, creado_at),
  KEY idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reversión:
--   DROP TABLE notificaciones;
