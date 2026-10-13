## Decisions

**1. Un componente, dos modos.** `PanelComisiones({ modo })` sale de `/admin/comisiones` sin cambiar lo que ve el admin. `modo="asociada"` cambia: la ruta que consulta, el título, el texto, el nombre de cada fila (la candidata en vez de la asociada) y quita «Pagar» y el filtro por asociada. Es la regla de `una-interfaz-por-permisos`.

**2. La autorización está en el servidor.** `GET /api/asociada/comisiones` usa `requiereRol(req, "asociada")` y pasa `asociadaId = session.id` a `listarComisiones()`: la asociada no puede pedir las de otra ni con parámetros. Los correos de candidatas se quitan en la librería para ese modo.

**3. `lib/comisiones-aupair.js` es la única lectura.** `listarComisiones({ asociadaId, estado, paraAsociada })` y `codigosDeAsociada(asociadaId)`. La escritura sigue en `lib/ventas-aupair.js`.

## Risks / Trade-offs

- **[La asociada ve el nombre de la candidata]** → Es su referida: le vendió el cupo con su código. No se expone el correo.
- **[Su Inicio sigue roto]** → Fuera de alcance; deuda declarada.
