## 1. Averiguar antes de tocar nada

- [x] 1.1 Mirar el `.env` del VPS y comprobar si `RESEND_API_KEY` tiene valor.
      **Resultado (2026-08-05): está VACÍA.** Producción no envía ningún correo
      desde el despliegue al VPS del 2026-07-23 (`516ca27`) — tampoco el de
      recuperar contraseña. Hay que reportárselo a la clienta.
- [x] 1.2 Comprobar a nombre de quién está la cuenta de Resend.
      **Resultado: es de la clienta.** El proveedor anterior creó la cuenta con
      `info@destino-aupair.com`, así que entrar por ese correo la recupera. El
      dominio `destino-aupair.com` figura ahí desde el 2026-05-24 en estado
      `verified`, región `us-east-1`, con envío habilitado. Sin envíos en los
      últimos 15 días, lo que cuadra con 1.1.
- [x] 1.3 Guardar el estado del DNS antes de tocarlo. **Resultado: no hay que
      tocarlo.** El DKIM publicado (`resend._domainkey`) es el de esa misma
      cuenta y ya valida; el SPF y el MX de `send.` también. Se cae la
      necesidad de crear cuenta nueva y de reemplazar registros en Squarespace,
      con el riesgo que eso traía para el correo de Google Workspace.

## 2. Base de datos

- [x] 2.1 `migrations/007_notificaciones.sql` con la tabla `notificaciones`,
      `UNIQUE KEY uniq_notificacion (clave_unica)` e índices por evento y por
      usuaria. Idempotente.
- [x] 2.2 Corrida en local y verificada con `SHOW COLUMNS`.
      **En producción se corre en el paso 8, antes de desplegar el código.**

## 3. El módulo `lib/notificaciones-aupair.js`

- [x] 3.1 Cabecera con el contrato del módulo: dueño único del correo.
- [x] 3.2 `plantilla({ titulo, saludo, parrafos, destacado, boton })` con la
      maqueta de marca portada del correo de recuperar contraseña.
- [x] 3.3 `destinatariosAdmin()` con el filtro de enviables y
      `NOTIF_EXCLUIR_EMAILS`.
- [x] 3.4 `enviar()`: registra antes de enviar, corta si la clave única ya
      existe, modo `omitido` sin clave de API, marca `fallido` con el motivo y
      nunca re-lanza.
- [x] 3.5 `agendar()` sobre `after()` de `next/server`, con caída a promesa
      suelta fuera de una petición.
- [x] 3.6 `candidataQueAceptaCorreo()` — lee `notif_email` de la base.
- [x] 3.7 Las seis funciones de evento, con la convención de clave única
      `<evento>:<referencia>:<destinatario>`.
- [x] 3.8 `avisarReunionAgendada` / `avisarReunionCancelada` con la maqueta de
      marca y sin clave única (son repetibles).
- [x] 3.9 `enviarRecuperacionPassword()` — no consulta `notif_email` a
      propósito: es un correo de cuenta, no una notificación.

## 4. Enganchar los eventos

- [x] 4.1 `app/api/auth/register/route.js` — aviso al admin y bienvenida, antes
      de la bifurcación entre autorregistro y creación por el admin, para que
      valga en los dos casos.
- [x] 4.2 `lib/ventas-aupair.js` — dentro de `confirmarVenta()`, sólo en la
      transición real. Cubre las tres rutas que confirman.
- [x] 4.3 `app/api/dashboard/completar/route.js` — cuenta completadas contra el
      total de `sesiones` y avisa sólo al terminar.
- [x] 4.4 `app/api/admin/aprobar-evaluacion/route.js` — sólo al aprobar.

## 5. Retirar lo que queda muerto

- [x] 5.1 Retirado `notificarAdmins()` de la ruta de reuniones; sus dos
      llamadas pasan por el módulo.
- [x] 5.2 Retiradas las dos importaciones sueltas de `Resend`;
      `forgot-password` envía por el módulo.
- [x] 5.3 Verificado: `grep -rn "new Resend\|from \"resend\"" app/ lib/` sólo
      encuentra `lib/notificaciones-aupair.js`. El morado `#5b21b6` ya no
      aparece en ninguna ruta.
- [x] 5.4 `app/dashboard/configuracion/page.jsx` — queda sólo `notif_email`.
- [x] 5.5 Anotado en el `CLAUDE.md` que las otras tres columnas `notif_*` siguen
      en la base sin lector, y por qué no se borraron.

## 6. Documentación y configuración

- [x] 6.1 `.env.example` — `RESEND_API_KEY` deja de ser opcional; se añade
      `NOTIF_EXCLUIR_EMAILS`.
- [x] 6.2 `deploy/DEPLOY.md` — quitado el "(opcional)", añadida la advertencia
      de lo que significa dejarla vacía, y el bucle de migraciones pasa a
      `migrations/0*.sql` (antes sólo corría la 001 y la 002, así que las
      migraciones 003 a 006 se habrían saltado en un despliegue limpio).
- [x] 6.3 `LEEME-LOCAL.md` — el modo sin clave, con la consulta para ver qué se
      habría enviado.
- [x] 6.4 `CLAUDE.md` — sección de correo con la tabla de los ocho avisos y
      dónde se dispara cada uno.
- [x] 6.5 `docker-compose.yml` — pasa `NOTIF_EXCLUIR_EMAILS` al contenedor.

## 7. Verificación en local

Hecha contra el servidor de desarrollo, con la clave real de Resend y usando
las direcciones de prueba de Resend (`delivered@`, `bounced@`) para no escribirle
a ninguna persona. Los tres admins reales quedaron en `NOTIF_EXCLUIR_EMAILS`
durante toda la prueba.

- [x] 7.1 `npm run build` — compila sin errores.
- [x] 7.2 `node scripts/pruebas-humo.mjs` — **586 aserciones en verde, 0 en
      rojo**. (El inventario creció desde las 541 que cita el `CLAUDE.md`; este
      change no añade rutas.)
- [x] 7.3 **Registro** — la candidata queda creada y salen los dos avisos:
      `registro_candidata` al admin y `bienvenida` a ella, ambos `enviado` con
      su id de Resend. Ninguna fila hacia `revision@destino-aupair.local` ni
      hacia los tres admins excluidos.
- [x] 7.4 **Pago** — confirmar genera `pago_confirmado` y `acceso_activado`.
      Confirmar por segunda vez no genera ninguna fila nueva.
- [x] 7.5 **Curso** — completadas las 8 sesiones, una sola fila de
      `curso_completado`. Volver a marcar la última no la duplica.
- [x] 7.6 **Evaluación** — aprobar avisa a la candidata; retirar la aprobación
      no genera nada. De paso quedó comprobado que la ruta rechaza aprobar un
      perfil incompleto (400 con la lista de faltantes).
- [x] 7.7 **Preferencia** — con `notif_email = 0`, reactivar el acceso genera el
      aviso al admin y **no** el de la candidata.
- [x] 7.8 **Reuniones** — agendar y cancelar generan sus dos avisos, con la
      maqueta de marca y `clave_unica` en NULL (repetibles).
- [x] 7.9 **Fallo controlado** — con una clave inválida, el registro se completa
      igual (HTTP 200, usuaria creada) y las dos filas quedan en `fallido` con
      `API key is invalid` en `detalle`.
- [x] 7.10 **Modo sin clave** — con `RESEND_API_KEY` vacía, las filas quedan en
      `omitido` con el motivo, y no se llama a Resend.
- [x] 7.11 **Configuración** — la pestaña de notificaciones muestra un único
      interruptor y guardarlo sigue funcionando (comprobado en el navegador:
      al conmutarlo, `usuarios.notif_email` pasó de 1 a 0).

## 8. Despliegue (en este orden)

Ya no hay que crear cuenta ni tocar el DNS (ver 1.2 y 1.3): la cuenta es de la
clienta y el dominio está verificado. Queda sólo llevar la clave al servidor.

- [x] 8.1 Migración aplicada por `deploy/desplegar.sh`, que ahora la lleva en su
      lista con la condición de que la tabla no exista. (Le faltaba: el script
      sólo conocía la 006.)
- [x] 8.2 `RESEND_API_KEY` y `NOTIF_EXCLUIR_EMAILS` puestas en el `.env` del VPS
      y comprobadas dentro del contenedor.
- [x] 8.3 Desplegado con `deploy/desplegar.sh` el 2026-08-07: respaldo previo en
      `/var/respaldos-dap/20260807-1531`, migración 007 aplicada y **586
      aserciones de humo en verde, 0 en rojo**.
- [x] 8.4 **Recuperación de contraseña verificada en producción**: `POST
      /api/auth/forgot-password` → fila `enviado` y Resend lo reporta
      `delivered`. Es lo que llevaba roto desde el 2026-07-23.
- [x] 8.5 Recorrido en producción: registro de una candidata de prueba → correo
      de bienvenida `enviado` y `delivered` según Resend. La candidata de prueba
      quedó borrada. Para no meterle un correo de prueba a la bandeja de la
      clienta, durante el recorrido se excluyeron temporalmente todos los
      admins reales y se usó la dirección de pruebas de Resend; la lista quedó
      restaurada después.
- [x] 8.6 Entregas confirmadas por la API de Resend (`last_event: delivered`)
      en los dos correos de prueba.
- [x] 8.7 Hallazgo del despliegue: **`admin@destinoaupair.com` (sin guion) no
      existe** — ese dominio no tiene MX ni A, así que cada aviso al admin le
      habría rebotado, y los rebotes duros desgastan la reputación de envío. Se
      añadió a `NOTIF_EXCLUIR_EMAILS`. La lista viva en producción es
      `pruebadestino1@gmail.com,admin@destinoaupair.com`.
- [ ] 8.8 Anotar el despliegue y su verificación en
      `tech/cronograma-sprints-aupair.md`.

## 9. Con la clienta

- [x] 9.1 Contarle que la recuperación de contraseña llevaba desde el 2026-07-23
      sin funcionar, por qué (la clave de Resend no viajó en la migración a
      VPS) y qué se hizo para que no vuelva a pasar en silencio: ahora todo
      intento de correo queda registrado en la tabla `notificaciones`.
      **Hablado con la clienta el 2026-08-07.**
- [x] 9.2 **Retiradas las dos cuentas el 2026-08-07**, con autorización de la
      clienta: `pruebadestino1@gmail.com` (proveedor anterior) y
      `admin@destinoaupair.com` (dominio inexistente). Respaldo previo en
      `/var/respaldos-dap/20260807-1546`. Con ellas se fueron tres filas de
      basura de pruebas de mayo: un cupo de agenda nunca reservado, un evento
      titulado "gfder" y dos registros de referido en 0.00. Quedan dos admins:
      la clienta y la cuenta de servicio. Los dos correos siguen en
      `NOTIF_EXCLUIR_EMAILS` como red de seguridad. Verificado después:
      586 aserciones de humo en verde y el sitio en 200.
- [ ] 9.3 Decidir si `revision@destino-aupair.local` sigue existiendo como
      cuenta de revisión o se retira. Igual con `admin@destinoaupair.com`, que
      es un admin de producción con un dominio que no existe: o se corrige la
      dirección, o se retira la cuenta.
- [ ] 9.4 Confirmar si los avisos deben llegar también a
      `hola@destino-aupair.com` (el `email_contacto` de la tabla
      `configuracion`) o sólo a los admins.
- [ ] 9.5 Registrar R6 como trabajo adicional al contrato cerrado, con lo que
      quedó dentro y lo que sigue pendiente de cotizar (notificaciones en
      plataforma, avisos de mensajería, recordatorios programados, avisos a
      agencias y asociadas).
- [ ] 9.6 Comprobar en la consola de Google Workspace si el buzón
      `grexya.admin@destino-aupair.com` existe de verdad. Es admin en
      producción y recibe los avisos; si no hay buzón, cada aviso le rebota y
      hay que excluirlo o cambiarle el correo.
- [x] 9.7 Rotar la clave de Resend. **Decisión de Daniel el 2026-08-07: no se
      rota por ahora.** Queda anotado que se compartió por chat durante este
      trabajo, por si más adelante se quiere cerrar ese cabo.
