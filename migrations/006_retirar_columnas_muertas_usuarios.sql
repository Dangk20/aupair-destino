-- ════════════════════════════════════════════════════════════════════════
-- 006_retirar_columnas_muertas_usuarios.sql — Sprint 1, tarea 6.5
--
-- Retira cinco columnas de `usuarios` que ninguna línea del código menciona.
-- Son versiones viejas de columnas que sí están vivas, dejadas por el
-- proveedor anterior al rehacer el formulario del perfil.
--
-- Verificado en el entorno local antes de escribir esta migración
-- (2026-08-02, 13 usuarios):
--
--   columna             referencias   datos                     la reemplaza
--   ─────────────────── ───────────── ───────────────────────── ─────────────────
--   experiencia_ninos   0             todas NULL                exp_ninos_externos
--   fecha_salida        0             todas NULL                —
--   estado_proceso      0             13× 'explorando' (default) proceso_usuario
--   tiene_visa          0             13× 0 (default)           tiene_visa_j1
--   fotos_perfil        0             todas NULL                foto_url
--
-- Ojo al verificar: buscar "tiene_visa" a secas da falsos positivos porque
-- casa con `tiene_visa_j1`, que SÍ se usa (perfil con la agencia). Con
-- delimitador de palabra, las cinco dan cero referencias.
--
-- Ninguna columna llevaba información introducida por una usuaria: las que
-- tienen valor lo tienen porque es el valor por defecto de la columna.
--
-- Reversión: las definiciones originales quedan al final de este archivo.
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE usuarios
  DROP COLUMN experiencia_ninos,
  DROP COLUMN fecha_salida,
  DROP COLUMN estado_proceso,
  DROP COLUMN tiene_visa,
  DROP COLUMN fotos_perfil;

-- ── Reversión ───────────────────────────────────────────────────────────
-- Devuelve la estructura, no los datos (no había ninguno que perder).
--
-- ALTER TABLE usuarios
--   ADD COLUMN experiencia_ninos TEXT NULL,
--   ADD COLUMN fecha_salida      VARCHAR(50) NULL,
--   ADD COLUMN estado_proceso    ENUM('explorando','buscando_familia','tengo_familia','ya_viaje') NULL DEFAULT 'explorando',
--   ADD COLUMN tiene_visa        TINYINT(1) NULL DEFAULT 0,
--   ADD COLUMN fotos_perfil      TEXT NULL;
