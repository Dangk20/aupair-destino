## ADDED Requirements

### Requirement: Toda ruta de la API declara su nivel de acceso

Cada handler de `app/api/**/route.js` SHALL pertenecer a exactamente uno de estos niveles, y aplicarlo como primera operación antes de tocar la base de datos:

- **pública** — no exige sesión (autenticación, validación de código, contenido público)
- **con sesión** — exige sesión válida de cualquier rol
- **por rol** — exige sesión con un rol determinado
- **por permiso** — exige además el permiso de sección que la candidata paga

No SHALL quedar ninguna ruta sin nivel declarado.

#### Scenario: Ruta protegida sin sesión

- **WHEN** se llama cualquier ruta no pública sin cookie de sesión válida
- **THEN** el sistema responde 401 y no ejecuta ninguna consulta

#### Scenario: Ruta pública

- **WHEN** se llama una ruta declarada pública sin sesión
- **THEN** el sistema responde normalmente

#### Scenario: Cobertura completa

- **WHEN** se recorren todos los handlers de `app/api/**`
- **THEN** cada uno aplica el guard correspondiente a su nivel
- **AND** las únicas rutas sin verificación de sesión son las declaradas públicas

### Requirement: El rol se verifica en el servidor, no sólo en la navegación

El sistema SHALL rechazar toda llamada a una ruta de un área cuyo rol no corresponda a la sesión, independientemente de que el middleware ya proteja las páginas. `/api/admin/**` SHALL exigir rol `admin`; `/api/asociada/**`, rol `asociada`; `/api/agencia/**`, rol `agencia`.

#### Scenario: Candidata llamando una ruta de administración

- **WHEN** una sesión con rol `usuaria` llama directamente una ruta bajo `/api/admin/`
- **THEN** el sistema responde 403 y no entrega datos

#### Scenario: Asociada llamando una ruta de agencia

- **WHEN** una sesión con rol `asociada` llama una ruta bajo `/api/agencia/`
- **THEN** el sistema responde 403

#### Scenario: Admin en su propia área

- **WHEN** una sesión con rol `admin` llama una ruta bajo `/api/admin/`
- **THEN** la ruta se ejecuta normalmente

### Requirement: Los permisos que se pagan se leen de la base de datos

Para las secciones que desbloquea el pago (documentos, mensajes, recursos, reuniones, comunidad), el sistema SHALL verificar el permiso consultando la fila del usuario en la base de datos, NO el valor incrustado en el token de sesión. El token congela los permisos hasta el siguiente ingreso, y la confirmación de un pago debe surtir efecto de inmediato.

#### Scenario: Permiso concedido después de iniciar sesión

- **WHEN** el admin confirma el pago de una candidata que tiene la sesión abierta
- **AND** la candidata usa una sección recién habilitada sin volver a ingresar
- **THEN** el sistema le permite el acceso

#### Scenario: Permiso retirado después de iniciar sesión

- **WHEN** se anula la venta de una candidata con sesión abierta
- **AND** la candidata intenta usar una sección que dependía de ese pago
- **THEN** el sistema responde 403 sin esperar a que cierre sesión

### Requirement: Cada usuario sólo alcanza sus propios datos

Cuando una ruta recibe un identificador de recurso por parámetro, el sistema SHALL verificar que el recurso pertenece a quien lo solicita, salvo que el rol de la sesión esté autorizado a ver el de terceros.

#### Scenario: Candidata pidiendo el recurso de otra

- **WHEN** una candidata solicita un recurso cuyo `usuario_id` no es el suyo
- **THEN** el sistema responde 403

#### Scenario: Rol administrativo revisando

- **WHEN** un admin solicita el mismo recurso
- **THEN** el sistema lo entrega

#### Scenario: Identificador inexistente

- **WHEN** se solicita un identificador que no existe
- **THEN** el sistema responde 404 sin revelar si pertenecía a otra persona

### Requirement: Crear un usuario desde el panel no cambia la sesión de quien lo crea

El registro de un usuario por parte de un administrador NO SHALL emitir ni sobrescribir la cookie de sesión. Sólo el autorregistro de una candidata SHALL iniciar sesión automáticamente.

#### Scenario: Admin crea una candidata

- **WHEN** un admin crea un usuario desde el panel
- **THEN** el usuario queda creado
- **AND** el admin conserva su propia sesión

#### Scenario: Candidata se registra sola

- **WHEN** una persona se registra desde el formulario público
- **THEN** queda con sesión iniciada, como hasta ahora

### Requirement: Las reglas de acceso se verifican de forma automatizada antes de desplegar

El sistema SHALL contar con una comprobación ejecutable que valide las reglas anteriores contra un entorno corriendo, y el procedimiento de despliegue SHALL ejecutarla y detenerse si alguna falla.

#### Scenario: Una ruta queda desprotegida

- **WHEN** se ejecuta la comprobación y alguna ruta no pública responde datos sin sesión
- **THEN** la comprobación falla e identifica la ruta
- **AND** el despliegue no se da por bueno

#### Scenario: Todas las reglas se cumplen

- **WHEN** se ejecuta la comprobación sobre un entorno correcto
- **THEN** termina sin fallos y el despliegue continúa
