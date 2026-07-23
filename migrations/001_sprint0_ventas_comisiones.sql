-- ════════════════════════════════════════════════════════════════════════
-- Sprint 0.0 — Registro de ventas + comisiones por código
-- Idempotente: se puede correr varias veces sin romper.
--
-- Modelo:
--   codigos_promo  = código único (descuento + dueño asociada + % comisión)
--   ventas         = una fila por intención de pago (pendiente -> confirmado)  [tiene UI]
--   comisiones     = una fila por comisión generada al confirmar venta con código  [sin UI]
--
-- Legacy NO tocado: referidos, referido_registros (sistema viejo paralelo).
-- ════════════════════════════════════════════════════════════════════════

-- 1) codigos_promo: dueño (asociada) + porcentaje de comisión configurable ----
--    (columnas nuevas; MySQL 8 no soporta IF NOT EXISTS en ADD COLUMN, así que
--     se protege con un procedimiento que verifica information_schema)

DROP PROCEDURE IF EXISTS _dap_add_col;
DELIMITER //
CREATE PROCEDURE _dap_add_col(IN p_tabla VARCHAR(64), IN p_col VARCHAR(64), IN p_def TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_tabla AND COLUMN_NAME = p_col
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', p_tabla, '` ADD COLUMN `', p_col, '` ', p_def);
    PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
  END IF;
END //
DELIMITER ;

CALL _dap_add_col('codigos_promo', 'asociada_id',          'INT NULL AFTER `codigo`');
CALL _dap_add_col('codigos_promo', 'comision_porcentaje',  'DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER `precio_final`');

DROP PROCEDURE IF EXISTS _dap_add_col;

-- 2) ventas — registro real de la intención de pago (con estado) ---------------
CREATE TABLE IF NOT EXISTS `ventas` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `usuario_id`     INT NOT NULL,
  `monto`          DECIMAL(10,2) NOT NULL,
  `estado`         ENUM('pendiente','confirmado','anulado') NOT NULL DEFAULT 'pendiente',
  `codigo_promo_id` INT NULL,
  `codigo_texto`   VARCHAR(50) NULL,                 -- snapshot del código usado
  `tipo`           ENUM('normal','con_codigo') NOT NULL DEFAULT 'normal',
  `metodo`         VARCHAR(50) NULL,                 -- transferencia, etc. (declarado por la candidata)
  `referencia`     VARCHAR(120) NULL,               -- referencia de pago que declare la candidata
  `nota_admin`     TEXT NULL,
  `created_at`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmado_at`  TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ventas_usuario` (`usuario_id`),
  KEY `idx_ventas_estado`  (`estado`),
  KEY `idx_ventas_codigo`  (`codigo_promo_id`),
  CONSTRAINT `fk_ventas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ventas_codigo`  FOREIGN KEY (`codigo_promo_id`) REFERENCES `codigos_promo` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3) comisiones — generada al confirmar una venta con código (sin UI por ahora) -
CREATE TABLE IF NOT EXISTS `comisiones` (
  `id`              INT NOT NULL AUTO_INCREMENT,
  `venta_id`        INT NOT NULL,
  `asociada_id`     INT NOT NULL,
  `codigo_promo_id` INT NULL,
  `monto_venta`     DECIMAL(10,2) NOT NULL,
  `porcentaje`      DECIMAL(5,2)  NOT NULL,
  `monto_comision`  DECIMAL(10,2) NOT NULL,          -- calculado y congelado al confirmar
  `estado`          ENUM('pendiente','pagada') NOT NULL DEFAULT 'pendiente',
  `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pagada_at`       TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_comision_venta` (`venta_id`),       -- una comisión por venta, evita duplicados al re-confirmar
  KEY `idx_comisiones_asociada` (`asociada_id`),
  CONSTRAINT `fk_comisiones_venta`    FOREIGN KEY (`venta_id`)    REFERENCES `ventas` (`id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_comisiones_asociada` FOREIGN KEY (`asociada_id`) REFERENCES `usuarios` (`id`)  ON DELETE CASCADE,
  CONSTRAINT `fk_comisiones_codigo`   FOREIGN KEY (`codigo_promo_id`) REFERENCES `codigos_promo` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
