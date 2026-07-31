-- ════════════════════════════════════════════════════════════════════════
-- Cierre Sprint 0.0 — Conteo real de usos de códigos promo
--
-- 1) UNIQUE (codigo_id, usuario_id) en codigos_promo_usos: la idempotencia del
--    conteo deja de depender del orden de ejecución del código y la garantiza
--    la base de datos.
-- 2) comisiones.estado admite 'anulada', para revertir al anular una venta.
--
-- Idempotente: se puede correr varias veces.
-- ════════════════════════════════════════════════════════════════════════

-- 1) Limpiar duplicados previos antes de crear el único ------------------------
--    (conserva la fila más antigua de cada par codigo_id + usuario_id)
DELETE u FROM codigos_promo_usos u
JOIN (
  SELECT codigo_id, usuario_id, MIN(id) AS conservar
  FROM codigos_promo_usos
  GROUP BY codigo_id, usuario_id
  HAVING COUNT(*) > 1
) d ON d.codigo_id = u.codigo_id AND d.usuario_id = u.usuario_id
WHERE u.id > d.conservar;

-- 2) Índice único (protegido: MySQL 8 no soporta IF NOT EXISTS en ADD INDEX) ---
DROP PROCEDURE IF EXISTS _dap_add_uq_uso;
DELIMITER //
CREATE PROCEDURE _dap_add_uq_uso()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'codigos_promo_usos'
      AND INDEX_NAME = 'uq_uso_codigo_usuario'
  ) THEN
    ALTER TABLE `codigos_promo_usos`
      ADD UNIQUE KEY `uq_uso_codigo_usuario` (`codigo_id`, `usuario_id`);
  END IF;
END //
DELIMITER ;
CALL _dap_add_uq_uso();
DROP PROCEDURE IF EXISTS _dap_add_uq_uso;

-- 3) comisiones.estado: agregar 'anulada' -------------------------------------
ALTER TABLE `comisiones`
  MODIFY COLUMN `estado` ENUM('pendiente','pagada','anulada')
  NOT NULL DEFAULT 'pendiente';

-- 4) Backfill: registrar el uso de las ventas YA confirmadas con código -------
--    Hay ventas confirmadas que generaron comisión pero nunca registraron el
--    uso, porque el conteo se agregó después de confirmarlas. Sin este paso,
--    reconciliar el contador contra la tabla de usos borraría esos usos reales.
INSERT IGNORE INTO codigos_promo_usos (codigo_id, usuario_id, monto_pagado, usado_en)
SELECT v.codigo_promo_id, v.usuario_id, v.monto, COALESCE(v.confirmado_at, v.created_at)
  FROM ventas v
 WHERE v.estado = 'confirmado'
   AND v.codigo_promo_id IS NOT NULL;

-- 5) Reconciliar usos_actuales con el conteo real de codigos_promo_usos --------
UPDATE codigos_promo c
SET c.usos_actuales = (
  SELECT COUNT(*) FROM codigos_promo_usos u WHERE u.codigo_id = c.id
);
