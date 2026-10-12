## Context

`FichaCandidata.jsx` pinta la sección activa campo por campo desde
`lib/campos-perfil.js`. Las fotos de la cédula no están declaradas allí (no son
un dato que se valide ni cuente para el progreso), así que no aparecen.

## Goals / Non-Goals

**Goals:** que se vean en la ficha, en los dos modos. **Non-Goals:** PDF,
agencia, mover el almacenamiento.

## Decisions

### Un bloque propio, no un campo declarado

Se pinta un componente `FotosCedula` en la ficha cuando la sección activa es
`1-personal`. *Alternativa descartada — declararlas en `campos-perfil.js` con
`requeridoSi: OPCIONAL`:* las haría aparecer también en el formulario generado
del admin y en el editor de correcciones como campos de texto con un data-URI
de cientos de KB, y las metería en `validarCambios` y en el progreso sin motivo.

### Abrir en grande

El data-URI no se puede abrir con un `<a href>` en una pestaña nueva (Chrome
bloquea la navegación a `data:`). Se abre con `window.open()` y se escribe un
`<img>` dentro, que sí funciona.

## Risks / Trade-offs

- Data-URI de hasta ~220 KB por foto en la respuesta del perfil: ya viajaban
  hoy; sólo se empiezan a pintar.

## Migration Plan

Sin migraciones; entra en el mismo despliegue que los otros tres changes.
