-- ════════════════════════════════════════════════════════════════════════
-- 010_conversaciones.sql — change `chat-candidata`, tarea 1.1
--
-- La candidata conversa con el equipo de Destino Au Pair y con su agencia; el
-- admin supervisa (R5 y R16 de la reunión del 2026-08-05).
--
--   conversaciones
--     Una por candidata y contraparte. `agencia_id NULL` = con el equipo.
--     `agencia_clave` existe sólo para el índice único: MySQL trata los NULL
--     como distintos y dejaría duplicar la conversación con el equipo. La FK
--     de la agencia no lleva CASCADE (MySQL no lo admite en la base de una
--     columna generada): como en `candidata_agencia`, no se borra una agencia
--     con conversaciones.
--
--   conversacion_mensajes
--     `tipo = 'ingreso'`: el admin entró a una conversación de agencia. Queda
--     en el hilo, visible para todos. `origen_mensaje_id` = la fila de
--     `mensajes` de la que se copió (y lo que hace idempotente la copia).
--
--   conversacion_lecturas
--     Hasta qué mensaje leyó cada persona. Con tres participantes, un solo
--     `leido` por mensaje (como en `mensajes`) no dice quién lo leyó.
--
-- Copia `mensajes` a la conversación con el equipo. NO borra `mensajes`.
-- Idempotente: se puede correr varias veces.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS conversaciones (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  candidata_id  INT NOT NULL,
  agencia_id    INT NULL,
  agencia_clave INT AS (IFNULL(agencia_id, 0)) STORED,
  iniciada_por  INT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conversacion (candidata_id, agencia_clave),
  KEY idx_conv_agencia (agencia_id),
  CONSTRAINT fk_conv_candidata FOREIGN KEY (candidata_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_agencia   FOREIGN KEY (agencia_id)   REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversacion_mensajes (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  conversacion_id   INT NOT NULL,
  autor_id          INT NULL,
  autor_rol         ENUM('usuaria','agencia','admin') NOT NULL,
  tipo              ENUM('mensaje','ingreso') NOT NULL DEFAULT 'mensaje',
  contenido         TEXT NULL,
  origen_mensaje_id INT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_origen (origen_mensaje_id),
  KEY idx_cm_conv (conversacion_id, id),
  CONSTRAINT fk_cm_conv  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  CONSTRAINT fk_cm_autor FOREIGN KEY (autor_id)        REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversacion_lecturas (
  conversacion_id INT NOT NULL,
  usuario_id      INT NOT NULL,
  ultimo_leido_id INT NOT NULL DEFAULT 0,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (conversacion_id, usuario_id),
  CONSTRAINT fk_cl_conv    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  CONSTRAINT fk_cl_usuario FOREIGN KEY (usuario_id)      REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Copia de `mensajes` ──────────────────────────────────────────────────
-- Una conversación con el equipo por cada candidata que tenía mensajes.
INSERT IGNORE INTO conversaciones (candidata_id, agencia_id, created_at)
SELECT m.usuario_id, NULL, MIN(m.created_at)
FROM mensajes m JOIN usuarios u ON u.id = m.usuario_id
GROUP BY m.usuario_id;

-- Los mensajes, con su fecha. La tabla vieja no guarda qué admin escribió.
INSERT INTO conversacion_mensajes (conversacion_id, autor_id, autor_rol, tipo, contenido, origen_mensaje_id, created_at)
SELECT c.id,
       IF(m.remitente = 'usuario', m.usuario_id, NULL),
       IF(m.remitente = 'usuario', 'usuaria', 'admin'),
       'mensaje', m.contenido, m.id, COALESCE(m.created_at, NOW())
FROM mensajes m
JOIN conversaciones c ON c.candidata_id = m.usuario_id AND c.agencia_id IS NULL
WHERE NOT EXISTS (SELECT 1 FROM conversacion_mensajes x WHERE x.origen_mensaje_id = m.id)
ORDER BY m.id;

-- La candidata leyó lo que había: sus propios mensajes y los del equipo que
-- ya figuraban como leídos. (Los admins empiezan sin lectura: lo que la
-- candidata les escribió y nadie contestó les aparece como no leído.)
INSERT INTO conversacion_lecturas (conversacion_id, usuario_id, ultimo_leido_id)
SELECT c.id, c.candidata_id, COALESCE(MAX(cm.id), 0)
FROM conversaciones c
JOIN conversacion_mensajes cm ON cm.conversacion_id = c.id
JOIN mensajes m ON m.id = cm.origen_mensaje_id
WHERE c.agencia_id IS NULL AND (m.remitente = 'usuario' OR m.leido = 1)
GROUP BY c.id, c.candidata_id
ON DUPLICATE KEY UPDATE ultimo_leido_id = GREATEST(ultimo_leido_id, VALUES(ultimo_leido_id));
