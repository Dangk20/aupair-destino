-- Insertar una asesora de prueba
INSERT INTO usuarios (nombre, apellido, email, password, rol, telefono, ciudad, pais, codigo_referido, tiene_acceso, perfil_habilitado, created_at)
VALUES 
('María', 'Test García', 'maria.test@example.com', '$2a$10$dummypassword123456789', 'asociada', '3001234567', 'Bogotá', 'Colombia', 'MAR9999', 1, 1, NOW()),
('Sofia', 'Test López', 'sofia.test@example.com', '$2a$10$dummypassword123456789', 'asociada', '3005678901', 'Medellín', 'Colombia', 'SOF8888', 1, 1, NOW());

-- Insertar referidos vinculados a las asesoras por email
INSERT INTO referidos (nombre, email, codigo, porcentaje, estado)
VALUES 
('María García Promo', 'maria.test@example.com', 'MARIAPROMO2024', 20, 'Pendiente'),
('Sofia López Promo', 'sofia.test@example.com', 'SOFIAPROMO2024', 15, 'Pendiente');

-- Insertar usuarias de prueba asignadas a una asesora
INSERT INTO usuarios (nombre, apellido, email, password, rol, asesora_asignada_id, tiene_acceso, perfil_habilitado, created_at)
SELECT 'Usuaria', 'Test 1', 'usuaria1@example.com', '$2a$10$dummy', 'usuaria', id, 1, 1, NOW()
FROM usuarios WHERE email = 'maria.test@example.com' AND rol = 'asociada' LIMIT 1;

INSERT INTO usuarios (nombre, apellido, email, password, rol, asesora_asignada_id, tiene_acceso, perfil_habilitado, created_at)
SELECT 'Usuaria', 'Test 2', 'usuaria2@example.com', '$2a$10$dummy', 'usuaria', id, 1, 1, NOW()
FROM usuarios WHERE email = 'maria.test@example.com' AND rol = 'asociada' LIMIT 1;
