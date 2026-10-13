## Context

`etapaDe()` es la única regla de etapa; la usan la ficha, el tablero, Mi Destino y la línea de tiempo. `contextoEtapa()` y `tablero()` ya leen los `tipo_doc` de cada candidata (para el score), así que el dato ya está a mano.

## Decisions

**1. Enviar la Parte 1 no exige los documentos; la etapa sí.** Bloquear el envío obligaría a cargar ocho documentos antes de poder cerrar el formulario, y el aviso de `edad-y-aviso-documentos` ya propone el orden contrario (terminar la parte y luego cargar). La compuerta está donde importa: en qué ve el equipo como «En revisión».

**2. Los obligatorios salen de `DOCS_REQUERIDOS` (`requerido: true`).** Es la lista que ya muestran el módulo de documentos y la ficha; cambiarla allí cambia la regla en todas partes. `documentosCompletos(tipos)` en `lib/etapas-candidata.js`.

**3. Un hecho nuevo, `lista_revision`, marca la llegada a revisión.** `parte1_enviada` deja de llevar `etapa: "revision"`: si no, la línea de tiempo fecharía la revisión el día del envío aunque falten documentos. `registrarSiListaParaRevision()` lo registra una vez, idempotente, y lo llaman las dos rutas que pueden completar la condición.

**4. Cuenta la fila del documento, no la aprobación.** Un documento rechazado ya genera una observación y lleva a «Con correcciones»; no hace falta otra regla.

## Risks / Trade-offs

- **[Candidatas que hoy se ven en revisión retroceden]** → Es el efecto pedido. En producción son las que terminaron la Parte 1 sin los 8 documentos; se dice en el reporte al desplegar.
- **[Una candidata quita un documento estando en revisión]** → Vuelve a «Diligenciando» hasta subirlo. El hecho no se duplica.
