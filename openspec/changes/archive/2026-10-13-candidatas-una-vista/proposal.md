## Why

El admin tiene **dos pantallas de candidatas que se contradicen**:

- `/admin/perfiles` (la del menú «Candidatas») es la lista heredada del
  proveedor. Calcula en `app/api/admin/perfiles/route.js` dos vocabularios
  propios — «Completo / En revisión / Pendiente / Incompleto» por el avance de
  la Parte 1, y «Lista para agencia / En progreso / Sin inicio» con
  `usuarios.estado_agencia` — que **no son las etapas** acordadas con la
  clienta el 2026-10-12. Una candidata puede salir «Completo» ahí y
  «Diligenciando» en el tablero (por ejemplo, porque le faltan documentos:
  R14).
- `/admin/perfiles/tablero` es el tablero por etapas (`lib/etapas-candidata.js`)
  con su vista de lista, el que usan también la agencia y la asociada.

`estado_agencia` dejó de ser la fuente de la etapa con `etapas-candidata`
(la etapa con la agencia vive en `candidata_agencia`), así que la columna
«Estado agencia» de la lista vieja muestra un dato que ya nadie mueve.

## What Changes

- **«Candidatas» (`/admin/perfiles`) pasa a ser el tablero por etapas**, con
  sus dos vistas (Tablero y Lista), arriba una búsqueda (nombre, correo o
  ciudad) y un filtro por etapa, y el botón **Exportar** (CSV con etapa y %
  diligenciado de lo filtrado).
- `/admin/perfiles/tablero` redirige a `/admin/perfiles` (enlaces guardados).
- **«Descargar perfil»** (PDF + documentos), que sólo estaba en la lista
  vieja, pasa a la ficha del admin (`/admin/perfiles/[id]`), como en la de la
  agencia.

## Capabilities

### New Capabilities

- `vista-candidatas-admin`: una sola pantalla de candidatas para el admin,
  con las etapas del recorrido.

### Modified Capabilities

Ninguna archivada.

## Qué queda muerto

Se retira en este change:

- `GET /api/admin/perfiles` (`app/api/admin/perfiles/route.js`): su único
  consumidor era la lista vieja. Las subrutas `/admin/perfiles/[id]/**` siguen.
- La lista vieja de `app/admin/perfiles/page.jsx` (dos pestañas, estados
  inventados, paginación) y `app/admin/perfiles/tablero/page.jsx` como página
  propia.
- La lectura de `usuarios.estado_agencia` en el listado. La columna sigue en
  la tabla (la escriben rutas heredadas de agencia); retirarla es otro change.

## Fuera de alcance

- Filtros por inglés, licencia u horas de childcare (estaban en la pestaña 2
  de la lista vieja, en modo sólo lectura). Si la clienta los necesita, se
  añaden como filtros del tablero.
- La columna `estado_agencia` y las rutas que aún la escriben.

## Impact

- `app/admin/perfiles/page.jsx`, `app/admin/perfiles/tablero/page.jsx`,
  `app/admin/perfiles/[id]/page.jsx`, `app/api/admin/perfiles/route.js`
  (se borra), `docs/rutas-y-acceso.md`, `scripts/pruebas-humo.mjs`.
- Sin migración.
