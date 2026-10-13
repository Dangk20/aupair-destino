## Context

Se opera sobre Destino Au Pair (`lib/db-aupair.js`). El tablero
(`components/panel/TableroEtapas`, datos de `GET /api/admin/tablero` →
`lib/tablero-aupair.js`) ya trae por candidata: nombre, correo, teléfono,
ciudad, etapa, score, agencia y desde. La lista vieja (`/admin/perfiles`) pide
`GET /api/admin/perfiles`, que recalcula estados propios.

## Goals / Non-Goals

**Goals:** una sola pantalla y un solo vocabulario; no perder buscar,
exportar ni descargar el perfil.

**Non-Goals:** filtros por campos del perfil; retirar `estado_agencia`.

## Decisions

1. **`/admin/perfiles` monta el tablero**, con lo que hoy hace
   `app/admin/perfiles/tablero/page.jsx` (mover etapas de la agencia) más una
   barra de búsqueda, un selector de etapa y Exportar. El filtrado es en el
   navegador sobre la respuesta de `/api/admin/tablero`: son decenas de
   candidatas, no miles. *Descartado:* mantener la lista vieja cambiándole
   los estados por la etapa: seguiría siendo una segunda tabla con sus
   columnas y su paginación, contra la regla de una sola interfaz.
2. **Filtro en la página, no en el componente.** `TableroEtapas` recibe ya
   las candidatas filtradas; así la agencia y la asociada no cambian.
   *Descartado:* meter la búsqueda dentro de `TableroEtapas`; se puede subir
   ahí si la agencia la pide.
3. **CSV en el navegador** (con BOM para que Excel lea las tildes).
   *Descartado:* el `.txt` separado por `|` de la lista vieja.
4. **«Descargar perfil» en la ficha**, junto a «← Candidatas», con la misma
   ruta autenticada que ya existía. *Descartado:* un ícono en cada fila de la
   lista del tablero; cargaría el componente compartido con una acción que
   sólo el admin tiene.
5. **`/admin/perfiles/tablero` redirige** con `redirect()` de servidor.

## Risks / Trade-offs

- La lista vieja escondía a las candidatas sin nada diligenciado; el tablero
  las muestra en «Diligenciando». Es lo correcto (son candidatas), pero la
  columna será larga; el filtro por etapa lo compensa.
