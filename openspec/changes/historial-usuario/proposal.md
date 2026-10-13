## Why

R10 (reunión del 2026-08-05, adicional cotizado): en la acción **«Ver»** de cada
usuario, un historial con los eventos importantes —creación de la cuenta,
visualización de los videos, diligenciamiento de los formularios, carga de
documentos, paso a la agencia— para que el admin lo vea sin salir de ahí. Es
requisito de R11: la transferencia de cupo tiene que quedar escrita en el
historial de las dos cuentas.

Lo que hay hoy (leído del código y de la base):

- `historial_candidata` (migración 009) y `lib/historial-aupair.js` ya
  registran registro, envío de la Parte 1 y la 2, lista para revisión,
  correcciones, aprobación, no califica, agencia asignada y cambios de etapa.
  La ficha (`FichaCandidata` › Recorrido) lo muestra con `LineaDeTiempo`.
- **No se registra:** la sesión del curso completada (`progreso_usuario`), el
  curso terminado, la carga, el reemplazo o el retiro de un documento, ni el
  pago confirmado o anulado (`lib/ventas-aupair.js`).
- El modal «Ver» de `/admin/usuarias` muestra ID, progreso, códigos, pago y
  accesos. **No muestra historial.**
- La plataforma no sabe cuándo se *mira* un video, sólo cuándo la candidata
  marca la sesión como completada (`POST /api/dashboard/completar`). Eso es lo
  que se registra como «visualización».

## What Changes

- **Hechos nuevos en el historial:**
  - sesión del curso completada (con su título) y curso terminado;
  - documento cargado, reemplazado y retirado (por ella o por el equipo);
  - pago confirmado y pago anulado / acceso retirado, desde el dueño único de
    las ventas.
- **Sin duplicados:** `historial_candidata.referencia` con índice único
  `(candidata_id, evento, referencia)`. Completar dos veces la misma sesión o
  correr dos veces el relleno no repite el hecho.
- **Relleno** de lo que ya pasó con su fecha real: sesiones completadas
  (`fecha_completado`), documentos vigentes (`created_at`) y ventas confirmadas
  (`confirmado_at`).
- **«Ver» de Usuarios muestra el historial:** la misma `LineaDeTiempo` de la
  ficha, en modo revisión, más «Ver perfil» para ir a la ficha completa.
- La candidata sigue viendo su línea de tiempo sin autor ni hechos internos.

## Capabilities

### New Capabilities

- `historial-usuario`: qué hechos se registran del recorrido de una candidata y
  dónde los ve el admin.

### Modified Capabilities

Ninguna archivada.

## Impact

- **Migración `012_historial_referencia.sql`:** columna `referencia`, índice
  único y relleno. Idempotente.
- **Librería:** `lib/historial-aupair.js` (hechos nuevos, `referencia`).
- **Rutas que registran:**
  - `app/api/dashboard/completar/route.js`;
  - `app/api/dashboard/documentos/route.js` (POST y DELETE);
  - `app/api/admin/perfiles/[id]/documentos/route.js` (DELETE);
  - `lib/ventas-aupair.js` (`confirmarVenta`, `anularVenta`, `retirarAccesoUsuario`).
- **Pantalla:** `app/admin/usuarias/page.jsx` (modal «Ver»).
- **Sin rutas nuevas:** usa `GET /api/admin/perfiles/[id]/historial`.
