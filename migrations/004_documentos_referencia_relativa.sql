-- ════════════════════════════════════════════════════════════════════════
-- Cierre Sprint 0.0 — Documentos fuera de public/
--
-- documentos_usuario.url deja de ser una URL pública (/uploads/documentos/...)
-- y pasa a ser una REFERENCIA RELATIVA dentro del almacenamiento de datos:
--   documentos/<usuario_id>/<archivo>
--
-- Los archivos se sirven ahora por /api/documentos/<id>, que exige sesión.
--
-- IMPORTANTE: esta migración va acompañada del movimiento de los archivos
-- (ver deploy/MIGRAR-DOCUMENTOS.md). Si se corre sin mover los archivos, los
-- documentos aparecerán como "archivo no disponible" hasta completarlo.
--
-- Idempotente: se puede correr varias veces.
-- ════════════════════════════════════════════════════════════════════════

-- Quitar el prefijo de URL pública, en cualquiera de sus formas.
UPDATE documentos_usuario
   SET url = SUBSTRING(url, LENGTH('/uploads/') + 1)
 WHERE url LIKE '/uploads/%';

UPDATE documentos_usuario
   SET url = SUBSTRING(url, LENGTH('uploads/') + 1)
 WHERE url LIKE 'uploads/%';

-- Mismo tratamiento para los recursos de sesión, que compartían el problema:
-- se subían a public/uploads/recursos y se servían como estáticos.
UPDATE sesion_recursos
   SET url = SUBSTRING(url, LENGTH('/uploads/') + 1)
 WHERE url LIKE '/uploads/%';

UPDATE sesion_recursos
   SET url = SUBSTRING(url, LENGTH('uploads/') + 1)
 WHERE url LIKE 'uploads/%';

-- Verificación: no debe quedar ninguna fila con prefijo de URL pública.
SELECT
  (SELECT COUNT(*) FROM documentos_usuario
    WHERE url LIKE '/uploads/%' OR url LIKE 'uploads/%') AS documentos_sin_normalizar,
  (SELECT COUNT(*) FROM sesion_recursos
    WHERE url LIKE '/uploads/%' OR url LIKE 'uploads/%') AS recursos_sin_normalizar;
