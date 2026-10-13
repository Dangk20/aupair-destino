## Why

El panel de la asociada está roto en producción desde que se recibió la
plataforma. El Inicio (`/api/asociada/stats`), «Mis Candidatas»
(`/api/asociada/usuarias-asignadas`) y el detalle de una candidata
(`/api/asociada/usuarias/[id]`) filtran por `usuarios.asesora_asignada_id`,
**una columna que no existe** en la base (ni en local ni en producción): las
tres responden 500 y la asociada entra a una pantalla vacía o con error. Las
pruebas de humo las tienen declaradas como «rotas».

La misma columna rompe del lado del admin:

- `GET /api/admin/asociadas/[id]` (la ficha de una asociada) responde 500;
- `DELETE /api/admin/asociadas/[id]` no puede borrar una asociada: el primer
  `UPDATE … asesora_asignada_id` revienta;
- `/api/admin/asociadas/asignar` (asignar a mano una candidata a una asesora)
  revienta, y por eso el módulo «Asociadas» está apagado en el menú del admin;
- el registro intenta asignar asesora (por código o por turno) y el error se
  traga en silencio en cada registro.

Decisión de Daniel (2026-10-13): **las candidatas de una asociada son las que
llegaron por su cupón**, no una asignación manual. Es el mismo vínculo que ya
genera sus comisiones (`codigos_promo.asociada_id`, R18).

## What Changes

- **Una sola regla, en una librería** (`lib/asociada-aupair.js`): una
  candidata es de una asociada si
  1. tiene una venta no anulada pagada con un cupón de ella
     (`ventas.codigo_promo_id` → `codigos_promo.asociada_id`), o
  2. se registró escribiendo el código de un cupón de ella
     (`usuarios.codigo_referido` = `codigos_promo.codigo`) y no pagó con el
     cupón de otra asociada.
  El pago manda sobre el registro.
- **Panel de la asociada**: «Mis candidatas» pasa a ser el Inicio y usa **el
  mismo tablero de etapas** del admin y la agencia
  (`components/panel/TableroEtapas`), en sólo lectura: ve en qué etapa va cada
  una, cuánto lleva diligenciado y si pagó con su cupón o sólo se registró con
  él. **No** ve teléfono, correo, perfil ni chat (sólo el admin y la agencia
  conversan con la candidata).
- **Admin › Asociadas** vuelve al menú: la lista cuenta candidatas y pagos por
  cupón (no por el sistema viejo de referidos) y la ficha de cada asociada
  lista sus candidatas con su etapa. Se retira «Asignar / Desasignar».
  Borrar una asociada vuelve a funcionar.
- **Registro**: deja de intentar asignar asesora. El código que escribe la
  candidata ya queda guardado en `usuarios.codigo_referido`, que es lo que lee
  la regla.

## Capabilities

### New Capabilities

- `candidatas-de-asociada`: qué candidatas son de una asociada y qué ve ella
  de cada una.

### Modified Capabilities

Ninguna archivada.

## Qué queda muerto

Se retira en este mismo change:

- Rutas `GET /api/asociada/stats`, `GET /api/asociada/usuarias-asignadas`,
  `GET /api/asociada/usuarias/[id]` y `GET|POST /api/admin/asociadas/asignar`
  (reemplazadas por `GET /api/asociada/tablero`).
- Página `app/asociada/usuarias/[id]/page.jsx` (el detalle con los datos de
  salud de la candidata; la asociada ya no ve el perfil).
  `app/asociada/usuarias/page.jsx` queda como redirección a `/asociada` para
  no romper enlaces guardados.
- El bloque de asignación de asesora de `app/api/auth/register/route.js`
  (por código y por turno).
- Las referencias a `asesora_asignada_id` en `app/api/admin/asociadas/[id]`.
- El conteo de «referidas» de `/api/admin/asociadas` por `referidos` +
  `referido_registros`.
- Las 4 entradas de «rutas rotas» de `scripts/pruebas-humo.mjs` y
  `docs/rutas-y-acceso.md` que tienen que ver con esta columna.

`asesora_asignada_id` nunca existió como columna, así que no hay migración.

## Fuera de alcance

- **Calendario de la asociada** (`/asociada/reuniones`): sigue leyendo el
  sistema viejo de referidos. Las reuniones con la asociada no tienen
  definición funcional; se decide con la clienta.
- **Retirar el sistema viejo de referidos** (`referidos`,
  `referido_registros`, `/admin/referidos`): tarea propia de la auditoría.
- **Precargar en `/pago` el código del registro**: hoy la candidata lo vuelve
  a escribir al pagar. Mejora aparte.
- Crear los cupones de Tati y Diego en producción: es operación del admin.

## Impact

- Código: `lib/asociada-aupair.js` (nueva), `lib/tablero-aupair.js`,
  `components/panel/TableroEtapas.jsx`, `app/asociada/**`,
  `app/api/asociada/tablero` (nueva), `app/api/admin/asociadas/**`,
  `app/admin/asociadas/**`, `app/admin/layout.jsx`,
  `app/api/auth/register/route.js`, `docs/rutas-y-acceso.md`,
  `scripts/pruebas-humo.mjs`.
- Base: sin migración.
- Producción: hoy no hay cupones (se borraron el 13 de octubre), así que el
  panel de Tati quedará vacío hasta que el admin le cree uno. Si se recrea con
  el mismo texto que usaron sus candidatas al registrarse, la regla 2 las
  recupera.
