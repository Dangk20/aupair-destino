## Context

`historial_candidata` y `lib/historial-aupair.js` (change `etapas-candidata`)
son el único registro del recorrido. `registrarHecho()` nunca lanza. Este
change sólo añade hechos y un lugar más donde verlos. Todo sobre la capa de
Destino Au Pair (`lib/db-aupair.js`).

## Goals / Non-Goals

**Goals:** registrar el curso, los documentos y el pago; mostrarlo en «Ver».

**Non-Goals:**
- historial de agencias, asociadas o admins (Usuarios lista candidatas);
- medir cuánto de un video se miró (no hay reproductor propio que lo informe);
- la revisión documento por documento (aprobado/rechazado), que hoy no tiene pantalla.

## Decisions

### Idempotencia por `referencia` única, no por consulta previa

`referencia` (VARCHAR 80, NULL) + `UNIQUE (candidata_id, evento, referencia)`;
`registrarHecho()` usa `INSERT IGNORE`. Ejemplos: `sesion:7`, `curso`,
`venta:12:confirmado`. Los hechos repetibles (documento reemplazado, cambio de
etapa) van con `referencia` NULL, que MySQL no cuenta para el índice.
*Descartado:* un `SELECT` antes de insertar (como hace hoy `lista_revision`):
dos peticiones simultáneas lo duplican y el relleno no lo podría reutilizar.

### El pago se registra en `lib/ventas-aupair.js`

Es el dueño único de confirmar y anular, así que las cuatro rutas que lo usan
(confirmar venta, toggle-acceso, confirmar-pago, anular) lo heredan.
`confirmarVenta` registra `venta:<id>:confirmado`; `anularVenta`, si estaba
confirmada, `venta:<id>:anulado:<fecha>` (se puede reconfirmar y reanular).
*Descartado:* registrar en cada ruta: es la duplicación que la librería evita.

### «Visualización de los videos» = sesión completada

`POST /api/dashboard/completar` es la única señal. *Descartado:* registrar
cada apertura de `/dashboard/sesion/[id]`: no dice si lo vio y llenaría el
historial de ruido.

### «Ver» reutiliza `LineaDeTiempo` y la ruta existente

El modal pide `GET /api/admin/perfiles/[id]/historial` y pinta `LineaDeTiempo`
en modo revisión. *Descartado:* una lista nueva solo para Usuarios (regla de
una interfaz con permisos por rol).

## Risks / Trade-offs

- Las sesiones completadas antes de existir `fecha_completado` (NULL) no se rellenan → se omiten; no se inventa la fecha.
- Un documento reemplazado antes del cambio sólo conserva su última carga (`created_at` se sobreescribe al reemplazar) → el relleno dice «Cargó», con esa fecha.

## Migration Plan

`012_historial_referencia.sql` antes del código (`deploy/desplegar.sh`, con
condición sobre la columna). El código viejo ignora la columna nueva.
