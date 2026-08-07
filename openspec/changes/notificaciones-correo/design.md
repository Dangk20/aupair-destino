## Context

Se opera **sólo sobre la capa Destino Au Pair** (`lib/db-aupair.js`,
`lib/session-aupair.js`, rutas `/dashboard`, `/admin`). Nada de este change
toca `saasly-nextjs-1.0.0/` ni ninguna herencia del proveedor anterior.

Estado verificado antes de diseñar:

- **Envío de correo**: paquete `resend@^6.12.3` ya instalado. Dos usos, cada
  uno instanciando su propio cliente: `app/api/auth/forgot-password/route.js`
  (plantilla con la identidad real de la marca, `#a0435f` sobre `#fff8f9`) y
  `app/api/dashboard/reuniones/route.js`, que además define su propio
  `notificarAdmins()` con una plantilla morada que no corresponde a la marca.
- **Bloqueo de la respuesta**: ese `notificarAdmins()` se `await`ea dentro del
  handler y hace un `resend.emails.send()` por admin, en serie. Con 4 admins en
  la base, la candidata espera cuatro viajes a la API antes de ver su reunión
  confirmada. Si Resend responde lento, lo paga ella.
- **Destinatarios**: `SELECT email, nombre FROM usuarios WHERE rol='admin'`
  devuelve hoy `admin@destinoaupair.com`, `pruebadestino1@gmail.com` (proveedor
  anterior), `info@destino-aupair.com` (la clienta) y
  `revision@destino-aupair.local` (cuenta de revisión, dominio inexistente).
- **Preferencias**: `usuarios` tiene `notif_email`, `notif_plataforma`,
  `notif_mensajes` y `notif_reuniones` (`tinyint`, default 1). Se escriben desde
  `app/api/dashboard/configuracion/route.js` y **ninguna se lee en ningún
  lado**: los cuatro interruptores de `app/dashboard/configuracion/page.jsx` son
  decorativos.
- **Ventas**: `lib/ventas-aupair.js` es el dueño único de la confirmación.
  `confirmarVenta()` distingue la transición real del caso ya confirmado
  (devuelve `yaConfirmada: true` sin volver a hacer nada). Tres rutas entran por
  ahí: `/api/admin/confirmar-pago`, `/api/admin/ventas/[id]/confirmar` y
  `/api/admin/toggle-acceso`.
- **Curso**: `progreso_usuario` tiene `UNIQUE unique_progreso (id_usuario,
  id_sesion)`, y `app/api/dashboard/completar/route.js` usa `ON DUPLICATE KEY
  UPDATE`, así que "completar" es repetible sin efecto. La tabla `sesiones`
  tiene 8 filas y una columna `estado` (default `Publicada`) que
  `app/api/dashboard/sesiones/route.js` **no** usa para filtrar.
- **DNS de `destino-aupair.com`**: `resend._domainkey` con DKIM,
  `send.destino-aupair.com` con SPF de Amazon SES y MX de feedback, `_dmarc`
  con `p=none`. El MX de `@` apunta a `smtp.google.com` (Google Workspace de la
  clienta). Registrador/DNS: Squarespace.
- **Next 16.0.10**: `after()` está disponible en `next/server` (verificado).

## Goals / Non-Goals

**Goals:**

- Un solo lugar en el código que sepa mandar correo.
- Que la clienta se entere de lo que pasa sin entrar a mirar.
- Que un fallo de correo jamás tumbe un registro, un pago ni el avance del curso.
- Que el mismo aviso no llegue dos veces cuando el flujo que lo origina es
  repetible por diseño.
- Que se pueda verificar en local sin clave de Resend y sin mandar correo real.
- Que el canal de correo quede en una cuenta de la clienta, no del proveedor
  anterior.

**Non-Goals:**

- Notificaciones dentro de la plataforma (campanita/bandeja).
- Cualquier aviso que necesite tarea programada (recordatorio N horas antes de
  una reunión, resumen diario): no hay cron en el despliegue y montarlo es otro
  trabajo.
- Reintento automático de un correo fallido. Queda registrado; reenviar es
  manual.
- Plantillas editables desde el admin.
- Avisos a agencias y asociadas.

## Decisions

### 1. Un módulo `lib/notificaciones-aupair.js` como dueño único

Mismo patrón que `lib/ventas-aupair.js`: el módulo resuelve destinatarios, arma
el HTML, envía, registra y decide si el aviso ya se mandó. Expone una función
por evento (`avisarRegistroCandidata`, `avisarPagoConfirmado`,
`avisarCursoCompletado`, `avisarEvaluacionAprobada`, `avisarReunionAgendada`,
`avisarReunionCancelada`) sobre un `enviar()` interno privado.

**Alternativa descartada:** dejar cada ruta armando su correo, como está hoy.
Es justo lo que produjo dos plantillas distintas para el mismo producto y un
`notificarAdmins` escondido dentro de una ruta de reuniones, donde nadie lo
encuentra. Con seis eventos más, la divergencia se multiplica.

**Alternativa descartada:** una cola de trabajos (tabla + worker). Resuelve el
reintento, pero exige un proceso aparte en el VPS que hoy no existe y que nadie
va a vigilar. Para el volumen real (8 candidatas registradas) es sobreingeniería.

### 2. El disparo se engancha en el dueño del hecho, no en la ruta

- Pago confirmado y acceso activado → dentro de `confirmarVenta()` en
  `lib/ventas-aupair.js`, y **sólo en la transición real**: si devuelve
  `yaConfirmada`, no hay aviso. Un único enganche cubre las tres rutas que
  confirman.
- Evaluación aprobada → en `app/api/admin/aprobar-evaluacion/route.js`, que ya
  es dueño único de `usuarios.evaluacion_aprobada`, y sólo cuando
  `aprobada === true` (quitar la aprobación no manda nada).
- Registro → en `app/api/auth/register/route.js`.
- Curso completado → en `app/api/dashboard/completar/route.js`.

**Alternativa descartada:** enganchar en las tres rutas de confirmación de pago.
Garantiza que la próxima ruta que confirme un pago se olvide del aviso — es el
mismo error que hizo que el contador de usos de códigos no se moviera.

### 3. El envío no bloquea la respuesta: `after()` de Next

El módulo agenda el envío con `after()` de `next/server`, que ejecuta el trabajo
**después de que la respuesta salió** pero dentro del ciclo de vida de la
petición. Si `after()` no está disponible porque el módulo se llamó fuera de una
petición (un script de mantenimiento), cae a una promesa suelta con `.catch()`.

**Alternativa descartada:** seguir con `await` como hoy. Le cobra a la candidata
la latencia de Resend multiplicada por la cantidad de admins.

**Alternativa descartada:** promesa suelta siempre (`void enviar()`). Funciona
en este despliegue porque es un contenedor Node de larga vida, pero deja el
trabajo huérfano del ciclo de la petición y sin garantía de ejecución. `after()`
es la herramienta que Next 16 da justo para esto.

### 4. Un fallo de correo nunca sale del módulo

`enviar()` envuelve todo en `try/catch`: cualquier error (clave ausente, Resend
caído, dirección inválida) se registra en la tabla y en consola con el prefijo
`[notificaciones]`, y **no se re-lanza**. Como además corre en `after()`, ni
siquiera comparte camino con la respuesta.

La regla del proyecto se mantiene: registrar a una candidata, confirmar un pago
o completar una sesión no puede fallar porque el correo falle.

### 5. Tabla `notificaciones` con `clave_unica` opcional

```sql
CREATE TABLE notificaciones (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  evento        VARCHAR(60)  NOT NULL,
  destinatario  VARCHAR(190) NOT NULL,
  usuario_id    INT NULL,              -- la candidata a la que se refiere el aviso
  asunto        VARCHAR(255) NOT NULL,
  estado        ENUM('enviado','fallido','omitido') NOT NULL,
  detalle       VARCHAR(500) NULL,     -- id de Resend, o el error
  clave_unica   VARCHAR(120) NULL,
  creado_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_notificacion (clave_unica),
  KEY idx_evento (evento, creado_at)
);
```

La idempotencia se apoya en `clave_unica` — el mismo mecanismo que
`codigos_promo_usos` usa para el consumo de cupo: el hecho "este aviso ya se
mandó" queda representado por la fila, no por una bandera aparte. El módulo hace
`INSERT` de la fila **antes** de enviar; si el `INSERT` choca con el UNIQUE, el
aviso ya se mandó y no se hace nada.

La clave tiene siempre la forma `<evento>:<referencia>:<destinatario>`
(`bienvenida:12:ana@…`, `curso_completado:12:info@…`,
`pago_confirmado:87:info@…`). **El destinatario va siempre**, incluso cuando el
aviso es para una sola persona: sin él, un aviso dirigido a tres admins se
registraría una vez y sólo el primero de la lista lo recibiría.

La referencia del aviso de pago es la **venta**, no la candidata: si mañana
compra otra vez es otra venta y sí hay que avisar, mientras que confirmar dos
veces la misma no repite el correo.

Los eventos repetibles dejan la clave en `NULL` — MySQL admite múltiples `NULL`
en un índice único, así que reunión agendada y cancelada pueden ocurrir muchas
veces sin tocar el diseño.

**Alternativa descartada:** columnas bandera en `usuarios`
(`aviso_curso_enviado`, `aviso_bienvenida_enviado`, …). Ensancha todavía más una
tabla que ya venimos adelgazando (migración 006) y no deja rastro de a quién ni
cuándo.

### 6. `estado='omitido'` para el modo sin clave

Si `RESEND_API_KEY` está vacío, el módulo **no llama a Resend**: registra la fila
con `estado='omitido'` e imprime en consola el destinatario y el asunto. Así el
flujo local es verificable de verdad — se ve qué se habría mandado y a quién —
sin mandar correo a nadie ni necesitar cuenta.

**Alternativa descartada:** no registrar nada cuando no hay clave. Deja el
recorrido de verificación local sin nada que mirar.

### 7. Destinatarios de admin: consulta + filtro + exclusión por entorno

`destinatariosAdmin()` hace `SELECT nombre, email FROM usuarios WHERE
rol='admin'` y descarta:

1. lo que no tenga forma de correo;
2. dominios no entregables (`.local`, `.test`, `.invalid`, `.localhost`) — ahí
   cae `revision@destino-aupair.local`;
3. lo que esté en `NOTIF_EXCLUIR_EMAILS` (lista separada por comas).

`pruebadestino1@gmail.com` — el admin del proveedor anterior — **es una
dirección válida**: técnicamente no hay cómo distinguirla, y si no se hace nada,
cada registro de una candidata le llega a él. Se ataca por dos vías: se pone en
`NOTIF_EXCLUIR_EMAILS` en el despliegue (efecto inmediato, reversible) y se deja
como tarea de despliegue degradarlo o retirarlo de la base, **a confirmar con la
clienta** antes de ejecutarla — es su decisión, no nuestra.

**Alternativa descartada:** una lista fija de destinatarios en el `.env`. Es más
simple, pero obliga a redesplegar cuando entre alguien al equipo, y la decisión
tomada fue "todos los admin".

### 8. `notif_email` se lee de la base al momento de enviar

Igual que `requierePermiso()` con los permisos de sección: se consulta la fila,
no el JWT. Un JWT viejo no puede hacer que se ignore una preferencia que la
candidata acaba de cambiar.

Aplica **sólo a los avisos dirigidos a la candidata**. Los avisos al admin no la
consultan: son operación de la clienta, no marketing.

### 9. Plantilla única, la de la marca

Una función `plantilla({ titulo, saludo, parrafos, destacado, boton })` que
reproduce la maqueta del correo de recuperar contraseña — tablas HTML, logo en
círculo, tarjeta blanca sobre `#fff8f9`, acento `#a0435f`, pie con el año y el
dominio. Los correos de reunión adoptan esa maqueta y pierden el morado.

**Alternativa descartada:** React Email / MJML. Otra dependencia y un paso de
build para seis correos; la maqueta que ya existe se ve bien y está probada.

### 10. Se recupera la cuenta de Resend de la clienta, no SMTP de Google Workspace

El plan era crear una cuenta nueva a nombre de `info@destino-aupair.com` y
re-verificar el dominio reemplazando el DKIM en Squarespace. Al entrar con ese
correo apareció que **la cuenta ya existía a su nombre**: el proveedor anterior
la montó con la dirección de la clienta y el dominio está verificado desde el
2026-05-24, con el DKIM que ya está publicado. Recuperar el acceso bastó, y el
cambio de DNS —la parte con riesgo, por el MX de Google Workspace al lado— se
cae del plan.

**Alternativa descartada:** enviar por SMTP de Google Workspace con una
contraseña de aplicación de `info@destino-aupair.com`. Aprovecharía el Workspace
que la clienta ya paga, pero: obliga a cambiar el código de envío y añadir
`nodemailer`, tiene tope de 2.000 correos/día, mezcla el correo transaccional
con la bandeja personal de la clienta, y si algún día un envío se marca como
spam, arrastra la reputación de su correo de trabajo. Resend ya está integrado y
el dominio ya está preparado para firmar.

**Alternativa descartada:** seguir usando la cuenta de Resend del proveedor
anterior (si aparece la clave). Es lo más rápido, pero deja el canal de correo
del negocio colgando de una cuenta ajena que puede desaparecer sin aviso.

## Riesgos / Compromisos

- **La clave de Resend puede no estar en producción, y entonces hoy tampoco sale
  el correo de recuperar contraseña.** → Primera tarea del change, antes de
  escribir código: mirar el `.env` del VPS. Si está vacía, es un hallazgo que se
  le reporta a la clienta de inmediato, no un detalle de este trabajo.
- **Cambiar el DKIM en el DNS puede tumbar el correo de la clienta si se toca el
  registro equivocado.** → Sólo se reemplaza `resend._domainkey` y los registros
  de `send.`. El MX de `@` → `smtp.google.com` no se toca. La tarea de
  despliegue lo dice explícitamente y se verifica con `dig` antes y después.
- **Mientras el DKIM viejo esté activo y el nuevo no propague, los correos
  pueden caer en spam.** → Se hace el cambio y se espera propagación
  verificando con `dig` que el nuevo valor esté publicado antes de poner la
  clave nueva en el VPS. Ventana de riesgo: minutos, en horario de baja
  actividad.
- **Ahora sí llegan correos a los admins, y uno de ellos es el proveedor
  anterior.** → `NOTIF_EXCLUIR_EMAILS` se configura en el mismo despliegue que
  enciende las notificaciones. No se enciende sin eso.
- **`after()` no ejecuta si el contenedor se cae entre la respuesta y el envío.**
  → Se acepta. Perder un aviso en una caída no justifica montar una cola; la
  tabla `notificaciones` deja ver que no se envió.
- **El aviso de "curso completado" depende de contar las 8 sesiones existentes.**
  Si mañana se agrega la sesión 9, quien ya había recibido el aviso no recibe
  otro (la `clave_unica` ya existe) y quien no lo había recibido lo recibirá al
  completar la nueva. → Es el comportamiento correcto, pero queda escrito para
  que no sorprenda.

## Plan de despliegue

Los dos primeros pasos ya se ejecutaron (2026-08-05): la clave del VPS está
vacía y la cuenta de Resend es de la clienta, con el dominio verificado. No hay
paso de DNS.

1. Correr `migrations/007_notificaciones.sql` en la base de producción, antes
   del código.
2. Poner `RESEND_API_KEY` y `NOTIF_EXCLUIR_EMAILS` en el `.env` del VPS.
3. Desplegar, `npm run build` y `node scripts/pruebas-humo.mjs` dentro del
   contenedor.
4. Comprobar que el correo de recuperar contraseña vuelve a llegar: es el que
   lleva roto desde el 2026-07-23.
5. Recorrido de humo en producción: registrar una candidata de prueba,
   comprobar que el aviso llega a `info@destino-aupair.com` y borrarla.
6. Con la clienta: contarle lo de la recuperación de contraseña y decidir qué se
   hace con el admin `pruebadestino1@gmail.com` y con
   `revision@destino-aupair.local`.

**Vuelta atrás:** vaciar `RESEND_API_KEY` en el `.env` y reiniciar. El sistema
degrada a "registra y no envía" sin tocar código ni base. Si hay que revertir el
código, la tabla `notificaciones` queda huérfana pero no estorba a nadie.

## Preguntas abiertas

- ¿La clienta quiere que los avisos al admin lleguen también a
  `hola@destino-aupair.com` (el `email_contacto` que hoy tiene la tabla
  `configuracion`) o sólo a `info@`?
- ¿`pruebadestino1@gmail.com` se degrada a otro rol, se retira, o la clienta
  quiere conservarlo con acceso?
- ¿El aviso de "curso completado" debería llegarle también a la asociada que
  tiene asignada la candidata? Hoy queda sólo para el admin.
