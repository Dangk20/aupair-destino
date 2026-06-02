# 📊 Guía: Verificar BD en Railway y Cambiar Roles

## 1️⃣ VER LA ESTRUCTURA DE BD DESDE EL ADMIN

### Opción A: Usar la Página de Verificador (Recomendado)

1. Accede a tu panel admin: `/admin/bd-verificar`
2. Verás todas las tablas de tu BD con:
   - Nombre de la tabla
   - Cantidad de filas
   - Tamaño en KB
   - Detalles de cada columna (tipo, si es NULL, si es clave primaria, etc.)
3. Puedes copiar la estructura de cada tabla con el botón 📋

---

## 2️⃣ VER LA BD DIRECTAMENTE EN RAILWAY

### Paso a Paso:

**1. Abre Railway.app**
- Ve a [railway.app](https://railway.app)
- Loguéate con tu cuenta

**2. Selecciona tu proyecto**
- Busca "Destino Au Pair" o el nombre de tu proyecto
- Haz clic para entrar

**3. Abre la base de datos**
- En el panel izquierdo, busca tu servicio MySQL
- Haz clic en él

**4. Abre la consola SQL**
- Ve a la pestaña "Connect" o "Console"
- O copia la cadena de conexión

**5. Copia las credenciales**
```
Host: (tu-host-railway.railway.app)
Port: (tu-puerto)
Username: root
Password: (tu-contraseña)
Database: (tu-database)
```

**6. Conecta con un cliente SQL**

### Opción A: MySQL Workbench (Escritorio)
1. Descarga [MySQL Workbench](https://www.mysql.com/products/workbench/)
2. File → New Model Connection
3. Ingresa los datos de Railway
4. Conecta y explora las tablas

### Opción B: DBeaver (Gratuito y Fácil)
1. Descarga [DBeaver](https://dbeaver.io/)
2. Database → New Database Connection → MySQL
3. Ingresa datos de Railway
4. Conecta y ve todas las tablas

### Opción C: phpMyAdmin (Web)
1. Ve a Railway → Console
2. Ejecuta:
```bash
mysql -h tu-host -u root -p tu-database
```

---

## 3️⃣ TABLAS QUE DEBERÍAS VER

```
✅ usuarios
✅ codigos_promo
✅ referidos
✅ reuniones
✅ sesiones
✅ sesiones_usuarios
✅ documentos_usuario
✅ mensajes
✅ proceso_usuario
✅ recursos
✅ sesion_recursos
```

---

## 4️⃣ CAMBIAR ROL DE UN USUARIO

### Opción A: Desde la Página Admin (Recomendado)

1. Ve a `/admin/cambiar-roles`
2. Busca el usuario por nombre/email
3. Elige el nuevo rol:
   - 👩‍🎓 **Usuaria** (Estudiante Au Pair)
   - 👩‍🏫 **Asociada** (Asesora)
   - 👨‍💼 **Admin** (Administrador)
4. Haz clic en el botón del rol deseado
5. ¡Listo! El rol cambiará instantáneamente

### Opción B: Directamente en BD (Avanzado)

Si prefieres hacerlo manualmente en la BD:

```sql
-- Ver todos los usuarios
SELECT id, nombre, apellido, email, rol, tiene_acceso 
FROM usuarios;

-- Cambiar rol de un usuario
UPDATE usuarios SET rol = 'asociada' WHERE id = 5;

-- Verificar cambio
SELECT id, nombre, apellido, email, rol 
FROM usuarios WHERE id = 5;
```

### Roles Válidos:
```
'usuaria'  → Estudiante Au Pair
'asociada' → Asesora/Consultora
'admin'    → Administrador
```

---

## 5️⃣ FLUJO COMPLETO: CAMBIAR UNA PERSONA A ASESORA

### Si ya se registró como usuario normal:

1. **Desde Admin Panel:**
   - Ir a `/admin/cambiar-roles`
   - Buscar el usuario por nombre/email
   - Clic en botón "Asociada"
   - ✅ Listo

2. **Resultado:**
   - Su rol cambia de "usuaria" a "asociada"
   - `tiene_acceso` se pone automáticamente en 1
   - Próxima vez que inicie sesión → redirige a `/asociada`
   - Puede ver dashboard de asesora

---

## 6️⃣ PREGUNTAS FRECUENTES

**P: ¿Puedo cambiar el rol de un admin a otro?**
A: No, por seguridad el sistema no permite cambiar admins. Debes hacerlo manualmente en BD.

**P: ¿Qué pasa con sus datos si cambio el rol?**
A: Sus datos personales se mantienen intactos. Solo cambia el rol y permisos.

**P: ¿Puede una asociada también ser usuaria?**
A: No, un usuario tiene un único rol en el sistema.

**P: ¿Cómo deshago un cambio de rol?**
A: Simplemente cambia el rol nuevamente desde `/admin/cambiar-roles`

---

## 7️⃣ VERIFICACIÓN SQL ÚTIL

Copia y ejecuta estas queries en tu BD:

```sql
-- Ver resumen de usuarios por rol
SELECT rol, COUNT(*) as cantidad 
FROM usuarios 
GROUP BY rol;

-- Ver todas las asesoras creadas
SELECT id, nombre, apellido, email, created_at 
FROM usuarios 
WHERE rol = 'asociada' 
ORDER BY created_at DESC;

-- Ver usuarias sin asesora asignada
SELECT id, nombre, apellido, email 
FROM usuarios 
WHERE rol = 'usuaria' AND asesora_asignada_id IS NULL;

-- Ver asignaciones actuales
SELECT 
  u.nombre as usuaria,
  a.nombre as asesora
FROM usuarios u
LEFT JOIN usuarios a ON a.id = u.asesora_asignada_id
WHERE u.rol = 'usuaria';
```

---

## 8️⃣ ESTRUCTURA BÁSICA DE TABLA `usuarios`

```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'usuaria', 'asociada') DEFAULT 'usuaria',
  telefono VARCHAR(20),
  ciudad VARCHAR(100),
  pais VARCHAR(100),
  foto_url TEXT,
  tiene_acceso BOOLEAN DEFAULT FALSE,
  perfil_habilitado BOOLEAN DEFAULT FALSE,
  asesora_asignada_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asesora_asignada_id) REFERENCES usuarios(id)
);
```

---

✨ **¡Con esta guía puedes verificar y gestionar todo fácilmente!**
