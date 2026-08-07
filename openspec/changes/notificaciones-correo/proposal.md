## Why

La plataforma está viva y con tráfico real, pero **no avisa nada**. Hoy sólo
existen dos envíos de correo en todo el código: la recuperación de contraseña
(`app/api/auth/forgot-password/route.js`) y los avisos de reunión agendada y
cancelada (`app/api/dashboard/reuniones/route.js`, con un `notificarAdmins`
escrito dentro de esa misma ruta). Nadie se entera cuando una candidata se
registra, cuando termina el curso o cuando su pago queda confirmado: la clienta
tiene que entrar a mirar. Es exactamente el R6 que pidió en la reunión del
2026-08-05 — «activar notificaciones de registro de usuarios, diligenciamiento
de los cursos, visualización de los cursos, y notificaciones hacia las
candidatas».

Hay además un riesgo que este change destapa y cierra:

- **El envío está apagado en producción.** `RESEND_API_KEY` figura como
  *(opcional)* en `deploy/DEPLOY.md` y `docker-compose.yml` la pasa desde el
  `.env` del VPS. **Comprobado el 2026-08-05: está vacía.** Desde el despliegue
  al VPS del 2026-07-23 no sale **ni el correo de recuperar contraseña**: una
  candidata que olvide su clave queda por fuera y nadie se entera, porque el
  error se traga en un `catch` y sólo queda en el log del contenedor.
- **La cuenta de envío sí es de la clienta, y eso se descubrió comprobándolo.**
  El DNS de `destino-aupair.com` ya tenía el DKIM de Resend
  (`resend._domainkey`) y los registros de `send.destino-aupair.com` hacia
  Amazon SES, que nadie del equipo actual creó. Resultó que el proveedor
  anterior montó la cuenta **con el correo de la clienta**
  (`info@destino-aupair.com`), así que entrar por ahí la recupera: el dominio
  figura verificado desde el 2026-05-24. No hace falta cuenta nueva ni tocar el
  DNS — lo que hace falta es llevar la clave al servidor.

**Nota de alcance contractual:** R6 (notificaciones) está declarado *fuera* del
contrato cerrado — `business/alcance-cerrado-aupair.md` lo deja para cotizar al
cerrar el taller de descubrimiento. Se ejecuta ahora por decisión explícita del
cliente, con el alcance acotado de este documento. Debe quedar registrado como
trabajo adicional, no absorbido dentro del precio cerrado.

## What Changes

- **Nuevo `lib/notificaciones-aupair.js`, dueño único del correo saliente.**
  Al estilo de `lib/ventas-aupair.js`: resuelve destinatarios, arma el HTML con
  una plantilla compartida, envía y registra. Ninguna ruta vuelve a instanciar
  `new Resend(...)` por su cuenta.
- **Nueva tabla `notificaciones`**: a quién se envió, qué evento, cuándo, si
  salió bien y el error si falló. Sirve para auditar («¿le llegó o no?») y para
  no repetir eventos que se pueden disparar dos veces.
- **Seis avisos nuevos.** Al admin: registro de una candidata, pago confirmado,
  curso completado. A la candidata: bienvenida al registrarse, acceso activado
  tras el pago, evaluación aprobada.
- **El aviso de curso se manda una sola vez**, cuando la candidata completa la
  última sesión que le faltaba — no uno por video.
- **Se migran los avisos de reunión** al módulo nuevo y se unifica su identidad
  visual: hoy salen en morado (`#5b21b6`), que no es la marca; el correo de
  recuperar contraseña sí usa la paleta real (`#a0435f` sobre `#fff8f9`).
- **Los envíos dejan de bloquear la respuesta.** Hoy `notificarAdmins` se
  `await`ea dentro del handler y manda un correo por admin en serie: la
  candidata espera a que salgan todos. Pasa a ser disparo sin espera, con el
  fallo registrado y nunca propagado.
- **Destinatarios enviables.** Las notificaciones de admin van a todos los
  `usuarios` con `rol='admin'`, filtrando direcciones no entregables. En la base
  hay hoy dos que no deben recibir nada: `pruebadestino1@gmail.com` (proveedor
  anterior) y `revision@destino-aupair.local` (dominio inexistente). El filtro
  técnico es el parche; la limpieza real de esos admins en producción va como
  tarea de despliegue, a confirmar con la clienta antes de ejecutarla.
- **La preferencia `notif_email` empieza a mandar de verdad** para los correos
  dirigidos a la candidata. Los avisos al admin no la consultan.
- **Se retiran de la pantalla de configuración los tres interruptores que no
  hacen nada** (`notif_plataforma`, `notif_mensajes`, `notif_reuniones`): hoy se
  guardan en la base y nadie los lee, así que la interfaz promete algo que no
  ocurre.

### Fuera de alcance (se cotiza aparte)

- Notificaciones dentro de la plataforma (campanita, bandeja) — es otro módulo.
- Avisos de mensajería (R5) y recordatorios programados antes de una reunión:
  requieren tarea periódica, que hoy no existe en el despliegue.
- Notificaciones a agencias y a asociadas.
- Resumen diario o semanal para la clienta.
- Plantillas de correo editables desde el admin.
- Pantalla de administración del registro de notificaciones (la tabla se
  consulta por SQL).

## Capabilities

### New Capabilities
- `notificaciones-correo`: qué eventos de la plataforma generan un correo, a
  quién le llega cada uno, cómo se registra el envío, y la garantía de que un
  fallo de correo nunca tumba la operación que lo originó.

### Modified Capabilities
Ninguna. Los eventos se enganchan a flujos existentes (registro, confirmación
de venta, progreso del curso, aprobación de evaluación) sin cambiar lo que esos
flujos hacen: `codigos-promo`, `perfil-candidata`, `ficha-candidata` y
`documentos-candidata` conservan sus requisitos tal como están.

## Impact

**Código nuevo**
- `lib/notificaciones-aupair.js`
- `migrations/007_notificaciones.sql`

**Código modificado**
- `app/api/auth/register/route.js` — dispara bienvenida + aviso al admin.
- `lib/ventas-aupair.js` — `confirmarVenta()` dispara pago confirmado (al admin)
  y acceso activado (a la candidata). Es el dueño único de la transición, así
  que cubre de una sola vez las tres rutas que confirman: `/api/admin/
  confirmar-pago`, `/api/admin/ventas/[id]/confirmar` y `/api/admin/
  toggle-acceso`.
- `app/api/dashboard/completar/route.js` — dispara curso completado.
- `app/api/admin/aprobar-evaluacion/route.js` — dispara evaluación aprobada.
- `app/api/dashboard/reuniones/route.js` — usa el módulo en vez de su helper.
- `app/api/auth/forgot-password/route.js` — usa el módulo en vez de Resend.
- `app/dashboard/configuracion/page.jsx` — quedan sólo los interruptores reales.
- `CLAUDE.md`, `LEEME-LOCAL.md`, `deploy/DEPLOY.md`, `.env.example` — la clave
  de Resend deja de ser opcional.

**Base de datos**
- Tabla `notificaciones` (nueva). No se toca ninguna existente.

**Infraestructura — la ejecuta una persona, no el código**
- Poner `RESEND_API_KEY` (de la cuenta de Resend de la clienta, recuperada
  entrando con `info@destino-aupair.com`) y `NOTIF_EXCLUIR_EMAILS` en el `.env`
  del VPS, y reiniciar el contenedor.
- **No hay cambio de DNS.** El dominio ya está verificado en esa cuenta desde el
  2026-05-24 y el DKIM publicado es el suyo. Se evita así el riesgo que traía la
  alternativa de montar cuenta nueva: tocar registros en Squarespace con el MX
  de Google Workspace de la clienta al lado.

**Sin impacto en control de acceso**: no se añade ninguna ruta de API, así que
`docs/rutas-y-acceso.md` y las pruebas de humo no cambian.

## Qué queda muerto

- **`notificarAdmins()` dentro de `app/api/dashboard/reuniones/route.js`**
  (líneas 26-42): se retira, su trabajo pasa al módulo.
- **Las dos importaciones sueltas de `Resend`** en `reuniones/route.js` y
  `forgot-password/route.js`: se retiran; el paquete `resend` sólo se importa
  desde `lib/notificaciones-aupair.js`.
- **El HTML morado de los correos de reunión**: se retira al unificar la
  plantilla.
- **Los interruptores `notif_plataforma`, `notif_mensajes` y `notif_reuniones`**
  de la pantalla de configuración: se retiran de la interfaz. Las **columnas se
  conservan** en `usuarios` a propósito — `notif_mensajes` y `notif_reuniones`
  son los interruptores naturales de R5 y de los recordatorios cuando esos
  módulos se coticen, y borrarlas ahora para recrearlas en dos meses es churn.
  Quedan documentadas como "sin lector" en la tabla de columnas del `CLAUDE.md`,
  para que nadie las lea creyendo que significan algo.
