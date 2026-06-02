# 🚀 SOLUCIÓN COMPLETA: Cambiar Roles y Verificar BD

## 📋 Lo que creamos

### 1. **Página Admin para Cambiar Roles** ✅
- **Ubicación:** `/admin/cambiar-roles`
- **Funcionalidad:**
  - 🔍 Buscar usuarios por nombre/email
  - 🎯 Filtrar por rol actual
  - 📊 Ver estado (con/sin acceso)
  - 👆 Botones directos para cambiar rol
  - ✨ Cambios instantáneos

### 2. **Verificador de BD** ✅
- **Ubicación:** `/admin/bd-verificar`
- **Funcionalidad:**
  - 📊 Ver todas las tablas de tu BD
  - 📈 Estadísticas de cada tabla (filas, tamaño)
  - 📋 Detalles de columnas (tipo, NULL, PK, etc.)
  - 📋 Botón para copiar estructura

### 3. **APIs Creadas** ✅
- `GET /api/admin/bd-estructura` → Obtener estructura completa
- `PUT /api/admin/usuarios/[id]/cambiar-rol` → Cambiar rol de usuario

### 4. **Documentación**
- `GUIA_BD_ROLES.md` → Guía completa paso a paso
- `COMANDOS_SQL_UTILES.sql` → 22 comandos SQL listos para usar

---

## 🎯 CÓMO CAMBIAR UN USUARIO A ASESORA

### Método 1: Panel Admin (Recomendado) ⭐

1. **Accede a:** `/admin/cambiar-roles`
2. **Busca** al usuario por nombre/email
3. **Haz clic** en el botón "Asociada"
4. **Listo!** El rol cambió automáticamente

### Método 2: Línea de Comando SQL

```sql
UPDATE usuarios SET rol = 'asociada', tiene_acceso = 1 WHERE id = 5;
```

### Método 3: Línea de Comando SQL (por Email)

```sql
UPDATE usuarios SET rol = 'asociada', tiene_acceso = 1 
WHERE email = 'usuario@example.com';
```

---

## ✅ VERIFICAR BD EN RAILWAY

### Opción A: Desde el Panel Admin

1. Ve a `/admin/bd-verificar`
2. Verás todas las tablas con sus columnas
3. Puedes copiar la estructura de cada tabla

### Opción B: Directamente en Railway

**Pasos:**
1. Abre [railway.app](https://railway.app)
2. Selecciona tu proyecto
3. Abre tu servicio MySQL
4. Ve a la pestaña "Console" o "Connect"
5. Copia las credenciales
6. Conéctate con:
   - **MySQL Workbench** (escritorio)
   - **DBeaver** (gratuito)
   - **Línea de comandos**

---

## 📊 TABLAS QUE DEBES VER EN TU BD

```
✅ usuarios              ← Principal, contiene todos los usuarios
✅ codigos_promo         ← Códigos de descuento
✅ referidos             ← Programa de referidos
✅ reuniones             ← Reuniones 1-a-1
✅ sesiones              ← Cursos/sesiones del programa
✅ sesiones_usuarios     ← Progreso de sesiones por usuario
✅ documentos_usuario    ← Documentos subidos
✅ mensajes              ← Chat entre usuarios
✅ proceso_usuario       ← Timeline del progreso
✅ recursos              ← Archivos descargables
✅ sesion_recursos       ← Recursos por sesión
```

---

## 🔍 QUERIES ÚTILES PARA VERIFICAR

```sql
-- Ver resumen de usuarios por rol
SELECT rol, COUNT(*) FROM usuarios GROUP BY rol;

-- Ver todas las asesoras
SELECT * FROM usuarios WHERE rol = 'asociada';

-- Ver asignaciones (usuaria → asesora)
SELECT u.nombre, a.nombre as asesora 
FROM usuarios u
LEFT JOIN usuarios a ON a.id = u.asesora_asignada_id
WHERE u.rol = 'usuaria';

-- Ver usuarias sin asesora
SELECT * FROM usuarios 
WHERE rol = 'usuaria' AND asesora_asignada_id IS NULL;
```

---

## 🎓 CAMBIOS DE ROL - FLUJO COMPLETO

```
Usuario se registra normal
    ↓ (rol = 'usuaria')
Admin lo cambia a 'asociada'
    ↓ (rol = 'asociada', tiene_acceso = 1)
Usuario ingresa a /login
    ↓ (detecta rol = 'asociada')
Redirige a /asociada
    ↓
Dashboard de asesora con:
  - Usuarias asignadas
  - Reuniones
  - Configuración
  - Estadísticas
```

---

## 📱 MENÚ ADMIN ACTUALIZADO

Hemos agregado dos nuevas opciones al menú:

```
├── Resumen
├── Referidos y comisiones
├── Códigos promo
├── Pagos y comisiones
├── Usuarios
├── ⭐ Cambiar Roles          ← NUEVO
├── Asesoras/Asociadas
├── Perfiles
├── Sesiones
├── Calendario
├── ⭐ Verificar BD           ← NUEVO
├── Reportes
├── Configuración
└── Notificaciones
```

---

## ⚡ EJEMPLO PRÁCTICO

### Scenario: Convertir a Ana García a Asesora

**Método Admin Panel:**

1. Ir a `/admin/cambiar-roles`
2. Escribir "Ana" en búsqueda
3. Ver que aparece:
   - Ana García
   - Email: ana@example.com
   - Rol actual: Usuaria
4. Clic en botón "Asociada"
5. Mensaje: "Rol cambiado de 'usuaria' a 'asociada'" ✅
6. Próxima sesión de Ana → Va a `/asociada` automáticamente

---

## 🔐 SEGURIDAD

- ✅ Solo admins pueden cambiar roles
- ✅ Las asesoras siempre tienen `tiene_acceso = 1`
- ✅ No se pueden cambiar los datos personales al cambiar rol
- ✅ Se mantienen todas las relaciones (reuniones, usuarias asignadas)

---

## 📝 RESUMEN DE ARCHIVOS CREADOS

```
✅ /app/admin/cambiar-roles/page.jsx      → Página para cambiar roles
✅ /app/admin/bd-verificar/page.jsx       → Verificador de BD
✅ /api/admin/bd-estructura/route.js      → API estructura BD
✅ /api/admin/usuarios/[id]/cambiar-rol/route.js → API cambiar rol
✅ GUIA_BD_ROLES.md                       → Guía detallada
✅ COMANDOS_SQL_UTILES.sql                → SQL ready-to-use
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Prueba cambiar un usuario a asesora
2. ✅ Verifica que aparezca en `/admin/asociadas`
3. ✅ Que el usuario pueda loguearse y vea `/asociada`
4. ✅ Asigna usuarias a la asesora desde `/admin/asociadas/[id]`

---

**¡Todo está listo para usar! 🎉**
