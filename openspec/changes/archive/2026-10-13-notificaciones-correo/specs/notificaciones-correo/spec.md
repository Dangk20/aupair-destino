## ADDED Requirements

### Requirement: Un único dueño del correo saliente

El sistema SHALL enviar todo su correo desde `lib/notificaciones-aupair.js`.
Ninguna ruta de `app/api/**` ni ningún otro módulo MUST instanciar el cliente de
Resend ni componer HTML de correo por su cuenta.

#### Scenario: No queda ningún envío fuera del módulo

- **WHEN** se busca `new Resend(` o `from "resend"` en todo el repositorio,
  excluyendo `node_modules/`
- **THEN** el único resultado es `lib/notificaciones-aupair.js`

#### Scenario: Los correos comparten la identidad de la marca

- **WHEN** se envía cualquiera de los correos del sistema
- **THEN** todos usan la misma maqueta: fondo `#fff8f9`, tarjeta blanca, acento
  `#a0435f`, logo de Destino Au Pair y pie con el dominio
- **AND** ningún correo conserva la cabecera morada `#5b21b6` de los avisos de
  reunión

### Requirement: Un fallo de correo nunca tumba la operación

El sistema SHALL completar la operación que originó un aviso aunque el envío
falle. Un error de correo MUST quedar registrado y MUST NOT propagarse al
handler que lo originó.

#### Scenario: Resend rechaza el envío durante un registro

- **WHEN** una candidata se registra y el envío del correo falla (clave
  inválida, servicio caído o dirección rechazada)
- **THEN** la candidata queda creada en `usuarios`, recibe su sesión y ve el
  dashboard como siempre
- **AND** el fallo queda en la tabla `notificaciones` con `estado='fallido'` y
  el motivo en `detalle`
- **AND** en el log del servidor aparece una línea con el prefijo
  `[notificaciones]`

#### Scenario: El envío no hace esperar a quien lo dispara

- **WHEN** se confirma un pago con varios admins configurados como
  destinatarios
- **THEN** la respuesta HTTP de la ruta sale sin esperar a que los correos se
  envíen
- **AND** los correos salen igual, después de la respuesta

### Requirement: Modo sin clave para desarrollo local

Cuando `RESEND_API_KEY` esté vacía, el sistema MUST NOT llamar a Resend. SHALL
registrar el aviso con `estado='omitido'` y escribir en consola el destinatario
y el asunto que se habrían usado.

#### Scenario: Registro en local sin clave configurada

- **WHEN** se levanta la aplicación en local sin `RESEND_API_KEY` y se registra
  una candidata
- **THEN** en la consola del servidor aparece `[notificaciones]` con el evento,
  el destinatario y el asunto
- **AND** la tabla `notificaciones` tiene las filas correspondientes con
  `estado='omitido'`
- **AND** no se envía ningún correo real

### Requirement: Registro auditable de cada aviso

El sistema SHALL registrar en la tabla `notificaciones` cada aviso que intente
enviar, con el evento, el destinatario, la candidata a la que se refiere, el
asunto, el estado (`enviado`, `fallido` u `omitido`), el detalle y la fecha.

#### Scenario: Consultar si un aviso llegó

- **WHEN** el equipo consulta
  `SELECT * FROM notificaciones WHERE usuario_id = <id> ORDER BY creado_at DESC`
- **THEN** ve todos los avisos referidos a esa candidata, a qué dirección
  salieron, cuándo y con qué resultado

### Requirement: Los avisos de una sola vez no se repiten

Los avisos de bienvenida, acceso activado, curso completado y evaluación
aprobada SHALL enviarse **una sola vez por candidata y destinatario**, aunque el
flujo que los origina se repita. La garantía MUST apoyarse en la columna
`clave_unica` de la tabla `notificaciones`, no en una bandera aparte, y esa
clave MUST incluir el destinatario: un aviso que va a varios admins tiene que
llegarle a todos, no sólo al primero.

#### Scenario: Completar dos veces la última sesión del curso

- **WHEN** una candidata completa la última sesión que le faltaba y vuelve a
  marcarla como completada
- **THEN** el aviso de curso completado se envía una sola vez
- **AND** la tabla `notificaciones` tiene una sola fila por destinatario, con
  `clave_unica='curso_completado:<id_candidata>:<destinatario>'`

#### Scenario: Confirmar un pago que ya estaba confirmado

- **WHEN** el admin confirma el acceso de una candidata cuya venta ya estaba en
  estado `confirmado`
- **THEN** no se envía ningún aviso nuevo, ni al admin ni a la candidata

#### Scenario: Los avisos repetibles sí se repiten

- **WHEN** una candidata agenda una reunión, la cancela y agenda otra
- **THEN** el admin recibe los tres avisos correspondientes

### Requirement: Aviso al admin cuando se registra una candidata

Cuando se crea una usuaria con rol `usuaria`, el sistema SHALL avisar a los
admins con el nombre, el correo y la fecha de registro de la candidata, y con
el código de referido si lo usó.

#### Scenario: Autorregistro desde el sitio público

- **WHEN** una persona completa el formulario de registro
- **THEN** cada admin destinatario recibe un correo con asunto que identifica el
  evento y el nombre de la candidata
- **AND** el cuerpo trae nombre, apellido, correo y, si aplica, el código de
  referido

#### Scenario: El admin crea una usuaria desde el panel

- **WHEN** el admin crea una usuaria desde `/admin/usuarias`
- **THEN** también se envía el aviso, porque el hecho registrado es el mismo

### Requirement: Correo de bienvenida a la candidata

Cuando una candidata se registra, el sistema SHALL enviarle un correo de
bienvenida con un enlace a su dashboard.

#### Scenario: Bienvenida tras el registro

- **WHEN** una candidata termina su registro
- **THEN** recibe un correo de bienvenida en la dirección con la que se registró
- **AND** el correo trae un botón que lleva a `${NEXT_PUBLIC_APP_URL}/dashboard`

### Requirement: Aviso de pago confirmado

Cuando una venta pasa de `pendiente` a `confirmado`, el sistema SHALL avisar a
los admins con la candidata, el monto, el código aplicado y la comisión
generada si la hubo. El aviso MUST dispararse desde `confirmarVenta()` en
`lib/ventas-aupair.js`, de modo que valga para cualquier ruta que confirme.

#### Scenario: Confirmación desde cada una de las tres rutas

- **WHEN** el admin confirma el pago desde `/admin/pagos`, desde el listado de
  ventas o activando el acceso desde el listado de usuarias
- **THEN** en los tres casos se envía el mismo aviso a los admins

#### Scenario: Venta anulada

- **WHEN** el admin anula una venta confirmada
- **THEN** no se envía ningún aviso de este change (la anulación queda fuera de
  alcance)

### Requirement: Aviso de acceso activado a la candidata

Cuando el pago de una candidata queda confirmado y sus permisos se encienden, el
sistema SHALL avisarle que ya tiene acceso, listando lo que se le habilitó.

#### Scenario: La candidata recibe su acceso

- **WHEN** el admin confirma el pago de una candidata
- **THEN** ella recibe un correo diciendo que su acceso está activo
- **AND** el correo enlaza al dashboard

### Requirement: Aviso de curso completado

Cuando una candidata marca como completada la última sesión que le faltaba, el
sistema SHALL avisar a los admins. MUST NOT enviarse un aviso por cada sesión
completada.

#### Scenario: Completar la última sesión

- **WHEN** una candidata completa su última sesión pendiente
- **THEN** los admins reciben un aviso de que terminó el curso

#### Scenario: Completar una sesión intermedia

- **WHEN** una candidata completa una sesión y todavía le quedan otras
- **THEN** no se envía ningún correo

### Requirement: Aviso de evaluación aprobada a la candidata

Cuando el admin aprueba la evaluación de una candidata, el sistema SHALL
avisarle. Retirar la aprobación MUST NOT generar ningún correo.

#### Scenario: El admin aprueba la evaluación

- **WHEN** el admin marca la evaluación de una candidata como aprobada
- **THEN** ella recibe un correo confirmándolo

#### Scenario: El admin retira la aprobación

- **WHEN** el admin quita la aprobación de una candidata
- **THEN** no se envía ningún correo

### Requirement: Destinatarios de admin enviables

Los avisos dirigidos al admin SHALL enviarse a los usuarios con `rol='admin'`,
descartando las direcciones sin forma de correo válida, las de dominios no
entregables (`.local`, `.test`, `.invalid`, `.localhost`) y las declaradas en la
variable de entorno `NOTIF_EXCLUIR_EMAILS`.

#### Scenario: Cuenta de revisión con dominio inexistente

- **WHEN** se envía un aviso de admin y existe el admin
  `revision@destino-aupair.local`
- **THEN** esa dirección no recibe correo y no se registra intento de envío
  hacia ella

#### Scenario: Dirección excluida por configuración

- **WHEN** `NOTIF_EXCLUIR_EMAILS` contiene `pruebadestino1@gmail.com` y se
  dispara un aviso de admin
- **THEN** esa dirección queda excluida
- **AND** los demás admins reciben el aviso normalmente

#### Scenario: No hay ningún destinatario válido

- **WHEN** se dispara un aviso de admin y ningún admin pasa el filtro
- **THEN** no se envía nada, no se lanza ningún error y queda registrado en el
  log del servidor

### Requirement: La preferencia de correo de la candidata se respeta

Los avisos dirigidos a una candidata SHALL enviarse sólo si su columna
`usuarios.notif_email` está encendida, leída de la base en el momento del envío
y no del JWT. Los avisos dirigidos al admin MUST NOT consultar esa preferencia.

#### Scenario: La candidata apaga las notificaciones por correo

- **WHEN** una candidata apaga "Notificaciones por email" en
  `/dashboard/configuracion` y después el admin le confirma el pago
- **THEN** ella no recibe el correo de acceso activado
- **AND** los admins sí reciben su aviso de pago confirmado

#### Scenario: La preferencia cambia sin volver a iniciar sesión

- **WHEN** una candidata cambia la preferencia y en la misma sesión ocurre un
  evento que le enviaría correo
- **THEN** se respeta el valor recién guardado, sin necesidad de que cierre y
  vuelva a abrir sesión

### Requirement: La configuración de la candidata no ofrece lo que no existe

La pantalla `/dashboard/configuracion` SHALL mostrar únicamente las preferencias
de notificación que el sistema respeta. Los interruptores sin efecto
(`notif_plataforma`, `notif_mensajes`, `notif_reuniones`) MUST retirarse de la
interfaz.

#### Scenario: La candidata abre sus preferencias

- **WHEN** una candidata abre la pestaña de notificaciones en su configuración
- **THEN** ve un único interruptor, "Notificaciones por email"
- **AND** no ve interruptores de notificaciones en plataforma, mensajes ni
  recordatorios de reuniones
