## Context

Se opera sobre la única app que queda (Destino Au Pair: `lib/db-aupair.js`,
`lib/session-aupair.js`). La asociada tiene uno o más cupones
(`codigos_promo.asociada_id`), creados al darla de alta
(`app/api/admin/asociadas/route.js · asegurarCodigoPromo`) o desde
`/admin/codigos-promo`. La candidata deja dos rastros de un cupón:
`usuarios.codigo_referido` (lo que escribió al registrarse, texto libre) y
`ventas.codigo_promo_id` (con qué cupón pagó). Las comisiones (R18) ya salen
del segundo.

El tablero por etapas (`lib/tablero-aupair.js` + `components/panel/TableroEtapas`)
ya calcula etapa y score en lote para el admin y, filtrado, para la agencia.

## Goals / Non-Goals

**Goals:**
- Una regla única de pertenencia, usada por el panel de la asociada y por el admin.
- El panel de la asociada con la interfaz compartida, sin pantallas propias.
- Que dejen de existir rutas que consultan `asesora_asignada_id`.

**Non-Goals:**
- Calendario de la asociada, sistema viejo de referidos, precarga del código en `/pago`.

## Decisions

1. **La regla vive en `lib/asociada-aupair.js · candidatasDeAsociadas()`**,
   que devuelve un `Map candidataId → { asociadaId, codigo, pago }` para todas
   las asociadas en dos consultas (ventas no anuladas con cupón de asociada; y
   usuarias cuyo `codigo_referido` coincide, sin distinguir mayúsculas, con un
   cupón de asociada). El pago se aplica después del registro, así que lo
   pisa. Si una candidata tiene ventas con cupones de dos asociadas, gana la
   más reciente.
   *Descartado:* una columna `asociada_id` en `usuarios` llenada en el
   registro y en el pago. Duplica un dato que ya está en ventas y cupones, y
   se desincroniza al anular una venta, transferir un cupo o reasignar un
   cupón.

2. **`tablero({ asociadaId })`** filtra con ese mapa y añade `cupon` y `pago`.
   La ruta `GET /api/asociada/tablero` quita `telefono`, `email`,
   `fecha_nacimiento` y `no_leidos` antes de responder: la autorización de lo
   que se ve está en la API, no en el componente.
   *Descartado:* reescribir `usuarias-asignadas` y `stats` con la regla nueva.
   Eran tres pantallas propias con estilos y campos viejos (`estado_agencia`),
   contra la regla del proyecto de una interfaz por permisos.

3. **`TableroEtapas` recibe `soloLectura`**: sin vista rápida (chat), sin
   enlace a la ficha, sin teléfono ni correo en la tarjeta y la lista, y con
   la píldora del cupón (`c.cupon`). Ninguna etapa se mueve (`movibles=[]`).
   *Descartado:* abrir la ficha en modo «asociada». La ficha trae datos de
   salud y documentos que una aliada comercial no necesita; si la clienta lo
   pide se añade un modo a `FichaCandidata`.

4. **`/asociada` es «Mis candidatas»**; el menú pierde la entrada duplicada y
   `/asociada/usuarias` redirige. Encima del tablero, tres cifras: candidatas,
   pagaron, sólo registradas.

5. **Admin:** `GET /api/admin/asociadas` cuenta `candidatas` y `pagaron` con
   el mapa (en vez de `referidos`); `GET /api/admin/asociadas/[id]` devuelve
   las candidatas con `tablero({ asociadaId })`; `DELETE` deja de tocar la
   columna. La página `/admin/asociadas/[id]` cambia el bloque de asignar por
   la lista de sus candidatas (sólo lectura, con enlace a la ficha del admin).
   Al borrar una asociada sus cupones quedan con `asociada_id` apuntando a un
   id que ya no existe: se ponen en `NULL` en el mismo `DELETE` para que no
   generen comisión a nadie. El borrado viejo también apuntaba a
   `reuniones.asesora_id`, que tampoco existe (el horario de la asesora está
   en `disponibilidad.asesora_id`): se borran sus horarios y las reuniones
   agendadas en ellos. Y la ficha deja de devolver `password` (era `SELECT *`).

## Risks / Trade-offs

- **`codigo_referido` es texto libre**: si la candidata escribe mal el
  código, no aparece hasta que pague con el cupón. Aceptable: el pago es la
  fuente fuerte.
- **Producción sin cupones**: el panel de Tati queda vacío hasta que se cree
  su cupón; se dice en el reporte.
- **Transferencia de cupo (R11)**: la venta pasa a la cuenta nueva, así que
  la candidata nueva aparece como «Pagó con» y la de origen sale (salvo que
  se haya registrado con el código). Es lo coherente con la comisión.
