## Context

- Hoy la mensajería es candidata ↔ equipo sobre `mensajes`. En local tiene 2 filas y la consumen tres pantallas:
  - `/admin/mensajes`
  - `/dashboard/mensajes`
  - el conteo de no leídos en `app/dashboard/layout.jsx`
- La relación entre la candidata y su agencia vive en `candidata_agencia`, que trae `etapas-candidata`; hay una sola agencia por candidata.
- La regla del proyecto es una interfaz con permisos por rol: el chat y la vista rápida son el mismo componente para los tres roles.
- `/api/*` no pasa por el filtro de prefijos de `middleware.js`. Cada ruta se autoriza sola.

## Goals / Non-Goals

**Goals:**
- Que la agencia y el admin hablen con la candidata desde el tablero, sin cambiar de pantalla.
- La supervisión que pidió la clienta: el admin lee en silencio y, si entra, queda a la vista.
- Un solo lugar que decide quién lee y quién escribe cada conversación.

**Non-Goals:**
- Asociadas, adjuntos, correo por mensaje nuevo y tiempo real con websockets.

## Decisions

**1. Una conversación por candidata y contraparte, no un hilo único.**

`conversaciones(candidata_id, agencia_id NULL)`: `agencia_id NULL` es la conversación con el equipo.

- **Por qué:** la candidata no debe ver lo que habla con el equipo dentro del hilo de la agencia, ni al revés. Además, una candidata puede cambiar de agencia más adelante.
- **Unicidad:** se exige con una columna generada, `agencia_clave = IFNULL(agencia_id, 0)`, y `UNIQUE(candidata_id, agencia_clave)`. MySQL trata los NULL como distintos en un UNIQUE.
- **Descartado:** reusar `mensajes` añadiendo `agencia_id`. Obligaba a enumerar remitentes por rol y no deja registrar el ingreso del admin.

**2. El ingreso del admin es un mensaje de `tipo = 'ingreso'`.**

- Queda en el hilo, en su lugar cronológico, visible para todos, sin una tabla aparte.
- Que el admin ya entró se sabe por la existencia de ese mensaje con su `autor_id`.
- Leer sin entrar no escribe nada, ni siquiera en las lecturas de la agencia o la candidata.

**3. Lecturas por persona: `conversacion_lecturas(conversacion_id, usuario_id, ultimo_leido_id)`.**

- Se descartó `leido` en el mensaje, como en la tabla actual: con tres participantes, un solo indicador de leído no dice quién lo leyó.
- No leídos = mensajes con `id > ultimo_leido_id` que no escribió quien consulta.
- En la conversación con el equipo, cada admin lleva su propia lectura.

**4. Rutas compartidas `/api/conversaciones/**`, con la autorización en `lib/conversaciones-aupair.js`.**

`puede(actor, conversacion)` devuelve `{ leer, escribir, entrar }`:

- **Candidata:** las suyas, y responde con el permiso `mensajes`. No inicia ninguna (regla de Daniel, 2026-10-12): `POST /api/conversaciones` le da 403.
- **Agencia:** solo las suyas con candidatas en su `candidata_agencia`; lo ajeno da 404, no 403.
- **Admin:** lee todas. Escribe en las del equipo, o en las de agencia una vez que entró.

Es la misma idea que `requierePermiso`: el JWT pinta la interfaz y la base autoriza.

Rutas:
- `GET /api/conversaciones`:
  - candidata: sus conversaciones;
  - agencia: las de sus candidatas;
  - admin: todas;
  - en todos los casos con el último mensaje y los no leídos.
- `GET /api/conversaciones?candidata_id=X`: las de una candidata, para la vista rápida. Si la conversación todavía no existe, a quien puede iniciarla se le muestra «por iniciar», con su botón: al admin, la del equipo; a la agencia, la suya.
- `POST /api/conversaciones` `{ candidata_id }`:
  - la agencia inicia la suya;
  - el admin, la del equipo;
  - la candidata, 403.
  - Es idempotente.
- `GET /api/conversaciones/[id]/mensajes?desde=<id>`: los mensajes posteriores a `desde`. Marca la conversación como leída para quien la pide.
- `POST /api/conversaciones/[id]/mensajes` `{ contenido }`: máximo 4000 caracteres.
- `POST /api/conversaciones/[id]/entrar`: solo el admin, en conversaciones de agencia. Es idempotente.

Se retiran `/api/admin/mensajes` y `/api/dashboard/mensajes`.

**5. Actualización por sondeo cada 5 s, solo con la conversación abierta, con `?desde=`.**

- Es suficiente para el volumen actual: decenas de candidatas.
- No exige un servidor de websockets detrás del proxy del VPS.
- Si el volumen crece, se cambia el transporte sin cambiar el modelo.

**6. Vista rápida = `components/panel/VistaRapida.jsx`, un modal sobre el tablero.**

- **Los datos básicos salen de la misma fila del tablero.** `lib/tablero-aupair.js` suma `fecha_nacimiento` y `no_leidos`, así que el modal no hace otra consulta para mostrarlos.
- **El chat es `components/chat/Conversacion.jsx`.** Es el mismo componente que usan `/admin/mensajes` y `/dashboard/mensajes`.
- **En el tablero, la tarjeta entera abre la vista rápida.** El clic en el nombre deja de llevar a la ficha, y el arrastre sigue funcionando: `click` no se dispara tras un `dragstart`.
- **El menú ⋯ y los enlaces `tel:` y `mailto:` frenan la propagación** del clic, para no abrir la vista rápida.

## Risks / Trade-offs

- **[Sondeo con muchas pestañas abiertas]** → Solo sondea la conversación visible, y se detiene con `document.hidden`.
- **[El admin escribe sin haber entrado]** → El servidor lo rechaza con 409. El botón «Entrar» es el único camino.
- **[La candidata pierde el permiso `mensajes`]** → Sigue viendo el historial en modo lectura y no puede escribir, igual que hoy con la puerta de pago.
- **[Datos de la tabla `mensajes` en producción]** → Antes de desplegar hay que contar sus filas en producción (`SELECT COUNT(*) FROM mensajes`). La migración las copia y no borra la tabla.

## Migration Plan

1. `010_conversaciones.sql`:
   - crea las tres tablas;
   - copia `mensajes` a la conversación del equipo (`usuario` → `usuaria`; `admin` → `admin`, con `autor_id` NULL porque la tabla vieja no guarda qué admin escribió);
   - siembra la lectura de cada candidata con su último mensaje.
2. Se registra en `deploy/desplegar.sh` con la condición «no existe `conversaciones`».
3. Se despliega con `etapas-candidata` y `panel-agencia`, o después de ellos.
4. **Reversa:** el código viejo leía `mensajes`, que no se toca. Para volver atrás basta el código anterior. Los mensajes nuevos quedarían solo en `conversacion_mensajes`.

## Open Questions

- ¿La candidata recibe un correo cuando la agencia le escribe? Es R6 y queda fuera de este change; por ahora lo ve en la plataforma.
