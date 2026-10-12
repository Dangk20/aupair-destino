-- ════════════════════════════════════════════════════════════════════════
-- 011_moneda_cop.sql — change `divisa-cop`, tarea 1.1
--
-- R9: los montos pasan de dólares a pesos colombianos. Cada venta, comisión
-- y código guarda su moneda: lo que ya estaba se cobró en USD y así queda
-- (no se convierte con una tasa que nadie fijó); lo nuevo, en COP.
--
-- Truco para no tocar fila por fila: la columna se añade con DEFAULT 'USD'
-- (las filas existentes quedan en USD) y enseguida el default pasa a 'COP'.
-- Todo dentro de la condición «la columna no existe»: idempotente.
--
-- El precio del cupo NO se siembra: es `configuracion.precio_cupo_cop` y lo
-- fija el admin en /admin/configuracion. Sembrarlo sería inventarlo.
-- ════════════════════════════════════════════════════════════════════════

SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'ventas' AND column_name = 'moneda');
SET @sql := IF(@falta, "ALTER TABLE ventas ADD COLUMN moneda CHAR(3) NOT NULL DEFAULT 'USD' AFTER monto", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF(@falta, "ALTER TABLE ventas ALTER COLUMN moneda SET DEFAULT 'COP'", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'comisiones' AND column_name = 'moneda');
SET @sql := IF(@falta, "ALTER TABLE comisiones ADD COLUMN moneda CHAR(3) NOT NULL DEFAULT 'USD' AFTER monto_comision", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF(@falta, "ALTER TABLE comisiones ALTER COLUMN moneda SET DEFAULT 'COP'", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'codigos_promo' AND column_name = 'moneda');
SET @sql := IF(@falta, "ALTER TABLE codigos_promo ADD COLUMN moneda CHAR(3) NOT NULL DEFAULT 'USD' AFTER precio_final", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF(@falta, "ALTER TABLE codigos_promo ALTER COLUMN moneda SET DEFAULT 'COP'", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ── Cupones como porcentaje del precio del cupo ──────────────────────────
-- Decisión de Daniel (2026-10-12): un cupón es un % de descuento sobre el
-- precio configurado; si el precio cambia, todos los cupones lo siguen.
-- `precio_final` queda sólo para los cupones anteriores, de precio fijo en
-- USD, hasta que el admin les ponga un porcentaje: por eso pasa a admitir NULL.
SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'codigos_promo' AND column_name = 'descuento_porcentaje');
SET @sql := IF(@falta, "ALTER TABLE codigos_promo ADD COLUMN descuento_porcentaje DECIMAL(5,2) NULL AFTER moneda", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql := IF(@falta, "ALTER TABLE codigos_promo MODIFY precio_final DECIMAL(10,2) NULL DEFAULT NULL", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
