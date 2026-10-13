-- ════════════════════════════════════════════════════════════════════════
-- 013_transferencias_cupo.sql — change `transferir-cupo`, tarea 1.1
--
-- R11: Destino Au Pair no reembolsa; la candidata puede vender su cupo. El
-- admin invita a un correo y quien se registre con ese link hereda el cupo.
--
--   transferencias_cupo
--     token_hash  SHA-256 del token del link: la base no guarda el token.
--     estado      pendiente | usada | cancelada. Vencida = pendiente con
--                 `vence_at` pasada (no hace falta un proceso que la cambie).
--     venta_id    la venta que se traspasó (NULL si el acceso no tenía venta).
--
-- Idempotente.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS transferencias_cupo (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  origen_id   INT          NOT NULL,
  email       VARCHAR(255) NOT NULL,
  token_hash  CHAR(64)     NOT NULL,
  estado      ENUM('pendiente','usada','cancelada') NOT NULL DEFAULT 'pendiente',
  destino_id  INT          NULL,
  venta_id    INT          NULL,
  creada_por  INT          NULL,
  vence_at    DATETIME     NOT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  usada_at    DATETIME     NULL,
  UNIQUE KEY uq_transferencia_token (token_hash),
  INDEX idx_transferencia_origen (origen_id, estado),
  CONSTRAINT fk_transf_origen  FOREIGN KEY (origen_id)  REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_transf_destino FOREIGN KEY (destino_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
