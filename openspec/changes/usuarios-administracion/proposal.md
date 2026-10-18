## Por qué

Ítem **8** del alcance (refactor y arquitectura de módulos). «Usuarios registrados» (`/admin/usuarias`) mezcla cuatro módulos y su intención —administrar cuentas— quedó enterrada. Auditoría del 17 oct 2026:

- **Cifras que no cuadran**: «Usuarios totales 19» excluye admins y la pestaña «Todos 24» no; además la consulta cruza `referido_registros`/`referidos` (tablas heredadas) y duplica filas. «Inactivos» significa «sin clases vistas» e incluye admins y agencias. El filtro de pestañas mete los registrados del mes en todas (`page.jsx:668`).
- **Plata escondida en un interruptor**: el acceso «Sesiones» del modal de accesos llama a `toggle-acceso` con `tiene_acceso`, que crea o anula una venta con comisión. Dos rutas más (`PUT /api/admin/usuarias`, `PUT /api/admin/usuarias/[id]`) encienden `tiene_acceso` sin pasar por `lib/ventas-aupair.js`, el dueño único de esa regla.
- **Fuera de lugar**: columnas Código, Pago y Progreso; KPIs Conversión y «Solo bienvenida gratis»; «Top referidoras» y «Actividad reciente» (tablas heredadas; la actividad pinta COP como USD); transferir cupo (es una operación de Ventas); un modal de pago sin uso.
- **Cambiar rol** a asociada crea una fila en la tabla heredada `referidos` (las asociadas usan códigos promo) y deja quitarse el rol de admin a uno mismo.
- **Faltan** las tareas propias del módulo: elegir el rol al crear, restablecer la contraseña y desactivar una cuenta.
- **Hallazgo de seguridad**: `POST /api/auth/login` escribe en el log del servidor la contraseña escrita, la fila completa del usuario (hash y tokens) y el hash, desde el commit inicial del proveedor anterior.

## Qué cambia

- **Usuarios** queda sólo con administración de cuentas: buscar; pestañas por rol (Todos, Candidatas, Asociadas, Agencias, Admins) y Desactivadas; cifras por rol que cuadran con las pestañas; crear con rol (la persona recibe un correo para crear su contraseña); editar nombre, apellido, correo y teléfono; cambiar rol; accesos por sección; restablecer contraseña; desactivar y reactivar; exportar datos de cuenta.
- **Acceso general sólo por Ventas**: el interruptor «Sesiones» sale de los accesos; `toggle-acceso` sólo cambia secciones. Ventas suma «Registrar pago» (confirma el acceso de una candidata sin solicitud previa, vía `confirmarAccesoUsuario`) y «Transferir cupo» en las ventas confirmadas.
- **Cuenta desactivada** (`usuarios.cuenta_activa`, migración 014): no puede iniciar sesión; `/api/auth/me` la saca del panel en su siguiente carga y `requierePermiso` le niega las secciones. Nadie se desactiva a sí mismo ni deja el sistema sin admins activos.
- **Cambiar rol**: roles `usuaria`, `asociada`, `agencia`, `admin`; sin escrituras en `referidos`; nadie cambia su propio rol ni se deja el sistema sin admins.
- **Se retiran**: `GET /api/admin/usuarios/{stats,actividad,top-referentes}`, `PUT /api/admin/usuarias`, `PUT /api/admin/toggle-acceso`, la escritura heredada en `referido_registros` de `toggle-acceso`, y la pantalla duplicada `/admin/cambiar-roles`.
- **Login**: sin registrar contraseñas ni filas en el log; lee sólo las columnas que usa.

## Fuera de alcance

- Retirar el resto del sistema heredado de referidos (registro, `/admin/referidos`, `/admin/pagos`, portal de la asesora): resto del ítem 8.
- Cortar al instante un token ya emitido en las rutas que no leen la base (el JWT dura 7 días): la cuenta desactivada sale en la siguiente carga del panel.
