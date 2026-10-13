## Why

La clienta lo pidió en la reunión del 2026-08-05 (R2) y lo volvió a preguntar
el 2026-10-12: la cédula, frente y reverso, debe verse justo debajo de la
información básica, en el perfil de la candidata y en la vista del admin.

Verificado en el código: `cedula_frontal_url` y `cedula_posterior_url` se suben
desde la Parte 1 (`app/dashboard/perfil/evaluacion/page.jsx`, vía
`POST /api/dashboard/documento`) y se guardan como data-URI en `usuarios`, pero
**ninguna pantalla las muestra**: ni la ficha (`components/perfil/FichaCandidata.jsx`)
ni la descarga del perfil. En la base local hay dos candidatas con las dos fotos
cargadas que nadie puede ver.

Ahora además hace falta para el ciclo de observaciones: el admin puede pedir
otra foto de la cédula observando "Información personal", pero no tiene dónde
ver la que está pidiendo cambiar.

## What Changes

- En la ficha (la misma para candidata y admin), la sección "Información
  personal" de la Parte 1 muestra un bloque **Cédula** debajo de sus campos,
  con las dos fotos, frente y reverso, y "Sin cargar" en la que falte.
- Cada foto se abre en grande en una pestaña nueva al hacer clic.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `ficha-candidata`: la ficha muestra las fotos de la cédula en Información
  personal.

## Impact

- `components/perfil/FichaCandidata.jsx`. Sin rutas nuevas ni migraciones: las
  dos rutas que alimentan la ficha ya devuelven esas columnas (`SELECT *`
  filtrado por `lib/perfil.js`, que no las oculta).

## Fuera de alcance

- Incluir la cédula en el PDF de la hoja de vida o en el ZIP de descarga.
- Mostrarla en el panel de la agencia (va con el bloque de agencias, R12–R14).
- Mover las fotos de la cédula de la base al almacenamiento de archivos (deuda
  conocida, igual que `foto_url`).

## Qué queda muerto

Nada.
