## Context

`GET /api/dashboard/reuniones` (Destino Au Pair, `requierePermiso("reuniones")`)
devuelve las reuniones de la candidata con `d.fecha` (DATE, que llega como
`"YYYY-MM-DDT00:00:00.000Z"` por `timezone: "Z"`), `hora_inicio` y `estado`.

## Goals / Non-Goals

**Goals:** que el recuadro diga la verdad y desaparezca el 404.
**Non-Goals:** tocar el módulo de reuniones.

## Decisions

1. **Calcular la próxima en el navegador** a partir de la ruta existente, con
   una función compartida en `lib/reuniones.js` (formato y selección), usada
   por las dos páginas. *Descartado:* crear `/api/dashboard/reunion`; sería
   una ruta más para un dato que la existente ya entrega.
2. **Fecha por sus componentes UTC** (la trampa de `timezone: "Z"`): se toma
   `fecha.slice(0, 10)` y se formatea a mediodía para no correr el día.

## Risks / Trade-offs

- Si la candidata tiene muchas reuniones se traen todas; son pocas por persona.
