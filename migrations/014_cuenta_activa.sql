-- ════════════════════════════════════════════════════════════════════════
-- 014_cuenta_activa.sql — change `usuarios-administracion`, tarea 1.1
--
-- El admin puede desactivar una cuenta: no inicia sesión, `/api/auth/me` la
-- saca del panel y `requierePermiso` le niega las secciones. 1 = activa (todas
-- las cuentas existentes quedan activas).
--
-- Idempotente.
-- ════════════════════════════════════════════════════════════════════════

SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'usuarios' AND column_name = 'cuenta_activa');
SET @sql := IF(@falta, "ALTER TABLE usuarios ADD COLUMN cuenta_activa TINYINT(1) NOT NULL DEFAULT 1", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
