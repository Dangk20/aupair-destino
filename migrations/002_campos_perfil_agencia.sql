-- ════════════════════════════════════════════════════════════════════════
-- Columnas faltantes del "Perfil con la agencia" que el formulario ya pedía
-- pero no tenían dónde guardarse. Idempotente.
-- ════════════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS _dap_add_col2;
DELIMITER //
CREATE PROCEDURE _dap_add_col2(IN p_col VARCHAR(64), IN p_def TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = p_col
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `usuarios` ADD COLUMN `', p_col, '` ', p_def);
    PREPARE s FROM @ddl; EXECUTE s; DEALLOCATE PREPARE s;
  END IF;
END //
DELIMITER ;

CALL _dap_add_col2('numero_ds2019',  'VARCHAR(50) NULL');
CALL _dap_add_col2('numero_sponsor', 'VARCHAR(50) NULL');

DROP PROCEDURE IF EXISTS _dap_add_col2;
