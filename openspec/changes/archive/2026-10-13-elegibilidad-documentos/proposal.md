## Why

La clienta pidió (R14, reunión del 2026-08-05) que una candidata se pueda
analizar y mostrar a una agencia con **el Perfil 1 y la documentación**, sin
necesidad de la Parte 2. Hoy, verificado en `lib/etapas-candidata.js · etapaDe()`,
pasa a «En revisión» con sólo enviar la Parte 1: los documentos no cuentan.

Daniel fijó el 2026-10-12 cuáles: **los 8 obligatorios** de `lib/documentos.js`
(pasaporte, cédula, foto de perfil, primeros auxilios, bachillerato,
antecedentes, registro civil y certificado médico).

Medido en producción el 2026-10-12: de 13 candidatas, 3 tienen los 8. Ninguna
tiene `parte1_enviada_at`; las que terminaron la Parte 1 antes del envío
explícito cuentan como enviadas.

## What Changes

- «En revisión» exige la **Parte 1 enviada y los 8 documentos obligatorios
  cargados**. Con la Parte 1 enviada y documentos pendientes, la candidata
  sigue en «Diligenciando».
- Se puede enviar la Parte 1 sin los documentos (no se traba a nadie). Su
  «Próximo paso» le dice cuántos documentos le faltan y la lleva a cargarlos.
- El paso a revisión queda en el historial como un hecho propio, «Completó la
  Parte 1 y sus documentos», con la fecha en que se cumplió la segunda
  condición. «Envió la Parte 1» sigue en el historial pero ya no marca la
  llegada a revisión.
- Las candidatas con decisión del equipo (aprobada, no califica) o con agencia
  no cambian: la decisión manda sobre el cálculo.

## Capabilities

### New Capabilities

- `elegibilidad-candidata`: cuándo una candidata está lista para que el equipo la revise.

### Modified Capabilities

Ninguna archivada (las etapas viven en `etapas-candidata`, desplegado y sin archivar).

## Impact

- `lib/etapas-candidata.js` (`etapaDe`, `documentosCompletos`), `lib/historial-aupair.js`
  (hecho nuevo y `registrarSiListaParaRevision`), `lib/tablero-aupair.js`.
- Rutas que lo disparan: `POST /api/dashboard/perfil/enviar` y `POST /api/dashboard/documentos`.
- `GET /api/dashboard/proceso`: el próximo paso con los documentos faltantes.
- Sin migración. En producción, las candidatas en revisión sin los 8 documentos pasan a «Diligenciando».
