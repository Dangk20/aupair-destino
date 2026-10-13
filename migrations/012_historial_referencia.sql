-- ════════════════════════════════════════════════════════════════════════
-- 012_historial_referencia.sql — change `historial-usuario`, tarea 1.1
--
-- R10: el historial registra también el curso, los documentos y el pago.
--
--   historial_candidata.referencia
--     Identifica un hecho que sólo puede ocurrir una vez (`sesion:7`,
--     `curso`, `relleno:doc:12`). Con el índice único, registrar dos veces lo
--     mismo no duplica: `registrarHecho()` usa INSERT IGNORE. Los hechos
--     repetibles van con NULL, que el índice no cuenta.
--
-- Relleno con la fecha real de lo que ya pasó:
--   · sesiones completadas (`progreso_usuario.fecha_completado`; sin fecha,
--     se omiten: no se inventa)
--   · curso terminado (la última sesión completada, si completó todas)
--   · documentos vigentes (`documentos_usuario.created_at`)
--   · ventas confirmadas (`ventas.confirmado_at`)
--
-- Idempotente: se puede correr varias veces.
-- ════════════════════════════════════════════════════════════════════════

SET @falta := (SELECT COUNT(*) = 0 FROM information_schema.columns
               WHERE table_schema = DATABASE() AND table_name = 'historial_candidata'
                 AND column_name = 'referencia');
SET @sql := IF(@falta,
  "ALTER TABLE historial_candidata ADD COLUMN referencia VARCHAR(80) NULL AFTER detalle, ADD UNIQUE KEY uq_historial_referencia (candidata_id, evento, referencia)",
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Sesiones completadas
INSERT IGNORE INTO historial_candidata (candidata_id, evento, detalle, referencia, actor_id, actor_rol, created_at)
SELECT p.id_usuario, 'sesion_completada', s.titulo, CONCAT('sesion:', s.id), p.id_usuario, 'usuaria', p.fecha_completado
FROM progreso_usuario p
JOIN sesiones s ON s.id = p.id_sesion
JOIN usuarios u ON u.id = p.id_usuario AND u.rol = 'usuaria'
WHERE p.completada = 1 AND p.fecha_completado IS NOT NULL;

-- Curso terminado: completó todas las sesiones que hay hoy
INSERT IGNORE INTO historial_candidata (candidata_id, evento, referencia, actor_id, actor_rol, created_at)
SELECT p.id_usuario, 'curso_completado', 'curso', p.id_usuario, 'usuaria', MAX(p.fecha_completado)
FROM progreso_usuario p
JOIN usuarios u ON u.id = p.id_usuario AND u.rol = 'usuaria'
WHERE p.completada = 1 AND p.fecha_completado IS NOT NULL
GROUP BY p.id_usuario
HAVING COUNT(DISTINCT p.id_sesion) >= (SELECT COUNT(*) FROM sesiones) AND (SELECT COUNT(*) FROM sesiones) > 0;

-- Documentos vigentes
INSERT IGNORE INTO historial_candidata (candidata_id, evento, detalle, referencia, actor_id, actor_rol, created_at)
SELECT d.usuario_id, 'documento_cargado', d.tipo_doc, CONCAT('relleno:doc:', d.id), d.usuario_id, 'usuaria', d.created_at
FROM documentos_usuario d
JOIN usuarios u ON u.id = d.usuario_id AND u.rol = 'usuaria'
WHERE d.created_at IS NOT NULL;

-- Ventas confirmadas
INSERT IGNORE INTO historial_candidata (candidata_id, evento, detalle, referencia, created_at)
SELECT v.usuario_id, 'pago_confirmado', CONCAT(v.monto, ' ', v.moneda), CONCAT('relleno:venta:', v.id), v.confirmado_at
FROM ventas v
JOIN usuarios u ON u.id = v.usuario_id AND u.rol = 'usuaria'
WHERE v.estado = 'confirmado' AND v.confirmado_at IS NOT NULL;
