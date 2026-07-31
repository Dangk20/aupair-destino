-- ════════════════════════════════════════════════════════════════════════
-- Cierre Sprint 0.0 — Limpiar foto_url con valores que no son imágenes
--
-- Quedaron filas con texto suelto (p. ej. "data:img") en usuarios.foto_url.
-- El <img src> con ese valor dispara ERR_INVALID_URL y rompe la vista del
-- perfil en el panel admin.
--
-- La escritura ya quedó validada en /api/dashboard/foto y en
-- /api/admin/perfiles/[id]; esto limpia lo que se guardó antes.
--
-- Idempotente.
-- ════════════════════════════════════════════════════════════════════════

UPDATE usuarios
   SET foto_url = NULL
 WHERE foto_url IS NOT NULL
   AND foto_url NOT LIKE 'data:image/%'
   AND foto_url NOT LIKE 'http://%'
   AND foto_url NOT LIKE 'https://%';

-- Verificación: debe devolver 0.
SELECT COUNT(*) AS fotos_invalidas
  FROM usuarios
 WHERE foto_url IS NOT NULL
   AND foto_url NOT LIKE 'data:image/%'
   AND foto_url NOT LIKE 'http://%'
   AND foto_url NOT LIKE 'https://%';
