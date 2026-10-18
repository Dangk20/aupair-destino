## ADDED Requirements

### Requirement: Usuarios administra cuentas

El módulo Usuarios SHALL mostrar y gestionar sólo cuentas: nombre, correo, teléfono, rol, estado de la cuenta, accesos por sección y fecha de registro. NO SHALL mostrar pagos, códigos, comisiones ni progreso del curso. Sus cifras SHALL contar lo mismo que sus pestañas.

#### Scenario: Cifras coherentes
- **WHEN** el admin abre Usuarios
- **THEN** el número de cada pestaña coincide con las filas que muestra

### Requirement: El acceso pagado sólo se da por Ventas

Ninguna acción de Usuarios SHALL encender o apagar `tiene_acceso` ni crear o anular ventas. Ventas SHALL permitir registrar el pago de una candidata sin solicitud previa y transferir su cupo.

#### Scenario: Registrar un pago recibido por fuera
- **WHEN** el admin registra en Ventas el pago de una candidata sin solicitud
- **THEN** queda una venta confirmada, se encienden sus permisos y se genera la comisión si aplica

### Requirement: Crear, restablecer y desactivar

El admin SHALL crear una cuenta eligiendo su rol; la persona SHALL recibir un correo para crear su contraseña. El admin SHALL poder enviar un restablecimiento de contraseña y desactivar o reactivar una cuenta. Una cuenta desactivada NO SHALL iniciar sesión. Nadie SHALL desactivarse ni cambiarse el rol a sí mismo, ni dejar el sistema sin un admin activo.

#### Scenario: Cuenta desactivada
- **WHEN** el admin desactiva una cuenta
- **THEN** esa persona no puede iniciar sesión y, si tenía el panel abierto, sale en su siguiente carga

#### Scenario: Último admin
- **WHEN** el único admin activo intenta quitarse el rol o desactivarse
- **THEN** la acción se rechaza

### Requirement: El inicio de sesión no registra secretos

`POST /api/auth/login` NO SHALL escribir en el log la contraseña, el hash ni la fila del usuario.

#### Scenario: Inicio de sesión
- **WHEN** alguien inicia sesión
- **THEN** el log del servidor no contiene su contraseña ni su hash
