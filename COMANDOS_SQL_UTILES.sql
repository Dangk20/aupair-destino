-- ========================================
-- COMANDOS SQL ÚTILES PARA DESTINO AU PAIR
-- ========================================

-- 1️⃣ VER TODAS LAS TABLAS
-- ========================
SHOW TABLES;

-- 2️⃣ VER ESTRUCTURA DE UNA TABLA
-- ================================
DESCRIBE usuarios;
DESCRIBE reuniones;
DESCRIBE sesiones;
DESCRIBE asociadas;

-- 3️⃣ VER INFORMACIÓN COMPLETA DE COLUMNAS
-- =========================================
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_KEY,
  COLUMN_DEFAULT,
  EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'usuarios' AND TABLE_SCHEMA = DATABASE()
ORDER BY ORDINAL_POSITION;

-- 4️⃣ VER TODOS LOS USUARIOS
-- ==========================
SELECT id, nombre, apellido, email, rol, tiene_acceso, created_at
FROM usuarios
ORDER BY created_at DESC;

-- 5️⃣ VER SOLO USUARIAS
-- ====================
SELECT id, nombre, apellido, email, estado_agencia, created_at
FROM usuarios
WHERE rol = 'usuaria'
ORDER BY nombre ASC;

-- 6️⃣ VER SOLO ASESORAS (ASOCIADAS)
-- =================================
SELECT id, nombre, apellido, email, telefono, ciudad, pais, created_at
FROM usuarios
WHERE rol = 'asociada'
ORDER BY nombre ASC;

-- 7️⃣ CAMBIAR ROL DE UN USUARIO
-- ============================
-- Cambiar usuario con ID 5 a ASOCIADA
UPDATE usuarios SET rol = 'asociada', tiene_acceso = 1 WHERE id = 5;

-- Cambiar usuario con ID 3 a USUARIA
UPDATE usuarios SET rol = 'usuaria' WHERE id = 3;

-- Cambiar usuario con ID 10 a ADMIN
UPDATE usuarios SET rol = 'admin', tiene_acceso = 1 WHERE id = 10;

-- 8️⃣ VER ASIGNACIONES DE USUARIAS A ASESORAS
-- ============================================
SELECT 
  u.id,
  u.nombre as usuaria,
  u.apellido,
  u.email,
  CASE 
    WHEN u.asesora_asignada_id IS NULL THEN 'Sin asesora'
    ELSE a.nombre
  END as asesora_asignada
FROM usuarios u
LEFT JOIN usuarios a ON a.id = u.asesora_asignada_id
WHERE u.rol = 'usuaria'
ORDER BY u.nombre ASC;

-- 9️⃣ ASIGNAR UNA USUARIA A UNA ASESORA
-- ======================================
-- Asignar usuario ID 5 a asesora ID 10
UPDATE usuarios SET asesora_asignada_id = 10 WHERE id = 5;

-- Desasignar usuaria
UPDATE usuarios SET asesora_asignada_id = NULL WHERE id = 5;

-- 🔟 CONTAR USUARIOS POR ROL
-- ==========================
SELECT rol, COUNT(*) as cantidad
FROM usuarios
GROUP BY rol;

-- 1️⃣1️⃣ VER USUARIAS SIN ASESORA
-- ==============================
SELECT id, nombre, apellido, email
FROM usuarios
WHERE rol = 'usuaria' AND asesora_asignada_id IS NULL
ORDER BY nombre ASC;

-- 1️⃣2️⃣ VER REUNIONES DE UNA ASESORA
-- ==================================
SELECT r.id, r.fecha, r.hora, r.tema, u.nombre as usuaria
FROM reuniones r
JOIN usuarios u ON u.id = r.usuario_id
WHERE r.asesora_id = 10  -- Cambiar 10 por el ID de la asesora
ORDER BY r.fecha DESC;

-- 1️⃣3️⃣ VER PROGRESO DE USUARIA (SESIONES COMPLETADAS)
-- =====================================================
SELECT 
  u.nombre,
  u.apellido,
  COUNT(DISTINCT s.id) as total_sesiones,
  COUNT(DISTINCT su.usuario_id) as sesiones_completadas,
  ROUND(COUNT(DISTINCT su.usuario_id) / COUNT(DISTINCT s.id) * 100, 2) as porcentaje
FROM usuarios u
JOIN sesiones s ON s.visible_para_usuaria = 1
LEFT JOIN sesiones_usuarios su ON su.usuario_id = u.id AND su.sesion_id = s.id
WHERE u.id = 5  -- Cambiar 5 por el ID de la usuaria
GROUP BY u.id;

-- 1️⃣4️⃣ VER ESTADÍSTICAS GENERALES
-- ================================
SELECT 
  (SELECT COUNT(*) FROM usuarios WHERE rol = 'admin') as admins,
  (SELECT COUNT(*) FROM usuarios WHERE rol = 'asociada') as asesoras,
  (SELECT COUNT(*) FROM usuarios WHERE rol = 'usuaria') as usuarias,
  (SELECT COUNT(*) FROM usuarios WHERE rol = 'usuaria' AND tiene_acceso = 1) as usuarias_con_acceso,
  (SELECT COUNT(*) FROM reuniones) as total_reuniones,
  (SELECT COUNT(*) FROM sesiones) as total_sesiones;

-- 1️⃣5️⃣ BUSCAR USUARIO POR EMAIL
-- =============================
SELECT id, nombre, apellido, email, rol
FROM usuarios
WHERE email = 'usuario@example.com';

-- 1️⃣6️⃣ VER DOCUMENTOS DE UNA USUARIA
-- ==================================
SELECT id, tipo, estado, fecha_subida
FROM documentos_usuario
WHERE usuario_id = 5  -- Cambiar por ID de usuaria
ORDER BY fecha_subida DESC;

-- 1️⃣7️⃣ VERIFICAR INTEGRIDAD DE RELACIONES
-- =========================================
-- Asesoras asignadas que no existen
SELECT DISTINCT asesora_asignada_id
FROM usuarios
WHERE asesora_asignada_id IS NOT NULL
AND asesora_asignada_id NOT IN (SELECT id FROM usuarios WHERE rol = 'asociada');

-- 1️⃣8️⃣ LISTAR CÓDIGOS PROMO
-- =========================
SELECT id, codigo, descripcion, precio_final, activo, created_at
FROM codigos_promo
ORDER BY created_at DESC;

-- 1️⃣9️⃣ LISTAR REFERIDOS
-- ====================
SELECT id, nombre, email, codigo, porcentaje, estado
FROM referidos
ORDER BY created_at DESC;

-- 2️⃣0️⃣ VER MENSAJES DE UNA USUARIA
-- ================================
SELECT id, asunto, mensaje, de_usuario_id, para_usuario_id, fecha
FROM mensajes
WHERE de_usuario_id = 5 OR para_usuario_id = 5  -- Cambiar por ID
ORDER BY fecha DESC;

-- 2️⃣1️⃣ CREAR BACKUP (EXPORTAR TABLA)
-- ==================================
-- Esto lo haces desde tu cliente SQL, selecciona una tabla
-- y elige "Export" o "Dump"

-- 2️⃣2️⃣ RESTAURAR DATOS DESPUÉS DE CAMBIOS
-- =========================================
-- Si necesitas deshacer cambios, ten cuidado:
-- Primero verifica qué vas a cambiar:
SELECT * FROM usuarios WHERE id = 5;  -- Verificar antes

-- Luego haz el cambio:
UPDATE usuarios SET rol = 'usuaria' WHERE id = 5;

-- Verifica el resultado:
SELECT * FROM usuarios WHERE id = 5;

-- ========================================
-- TIPS IMPORTANTES:
-- ========================================
-- 1. Siempre verifica ANTES de actualizar
-- 2. Haz respaldos regularmente
-- 3. Los roles válidos son: 'admin', 'usuaria', 'asociada'
-- 4. No elimines usuarios con datos relacionados sin limpiar primero
-- 5. Las fechas se guardan en formato YYYY-MM-DD HH:MM:SS
