## Why

El inicio de la candidata (`/dashboard`) y «Mi proceso» (`/dashboard/proceso`)
piden `GET /api/dashboard/reunion`, en singular. **Esa ruta no existe**: la
real es `/api/dashboard/reuniones`, que devuelve `{ reuniones: [...] }`,
mientras las páginas leen `.reunion`. Resultado: cada visita deja un 404 en la
consola y el recuadro «Tu próxima reunión» **nunca ha mostrado una reunión**;
siempre dice «Aún no tienes una agendada», tenga o no. Está documentado en
`docs/rutas-y-acceso.md` («Una ruta que se llama y no existe»). En local hay 6
reuniones agendadas.

## What Changes

- Las dos páginas piden `/api/dashboard/reuniones` y muestran la **próxima**:
  la más cercana de hoy en adelante que no esté cancelada, con fecha legible
  y hora («martes 20 de octubre · 10:00 a. m.»).
- Sin reuniones futuras, el recuadro sigue invitando a agendar.
- Sin el permiso de reuniones (la ruta responde 403), el recuadro se comporta
  como sin reuniones.

## Capabilities

### New Capabilities

- `proxima-reunion`: qué reunión muestra el recuadro «Tu próxima reunión».

### Modified Capabilities

Ninguna archivada.

## Qué queda muerto

Nada en código: la ruta en singular nunca existió. Se retira el apartado
«Una ruta que se llama y no existe» de `docs/rutas-y-acceso.md` y se
actualiza el párrafo de `asesora_asignada_id` que quedó viejo con
`candidatas-por-cupon`.

## Fuera de alcance

- El módulo de reuniones en sí (agendar, cancelar, calendario de la asesora).

## Impact

- `app/dashboard/page.jsx`, `app/dashboard/proceso/page.jsx`,
  `docs/rutas-y-acceso.md`. Sin migración, sin rutas nuevas.
