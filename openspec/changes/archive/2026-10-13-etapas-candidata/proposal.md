## Why

Hoy no hay una respuesta única a "¿en qué va esta candidata?". Verificado en el
código y la base:

- **La decisión del equipo se toma en tres lugares que se contradicen:** el
  botón "Aprobar perfil" (`evaluacion_aprobada`), el select "Calificación DAP"
  (califica / requiere revisión / no califica) y el estado "Aprobada /
  Rechazada" de `estado_agencia`. Ninguno lleva fecha.
- **`estado_agencia` tiene tres vocabularios** —el del admin, el del panel de la
  agencia y el de los perfiles de la agencia— escritos en la misma columna por
  actores distintos; cada pantalla lee los suyos y cuenta mal los ajenos.
- **El score de 0 a 10 se escribe a mano, sin criterio**, y la agencia ordena
  por él.
- **El bloque dice "Sólo lo ve el equipo" y no es cierto:** calificación, score y
  nota DAP los ve la agencia; "Notas para la agencia" es lo único que no le llega.
- **La línea de tiempo de "Mi Destino" está rota:** lee `proceso_usuario`, una
  tabla que no existe; tiene su propia regla de "perfil completo"; "Visa" y
  "Viaje" están siempre bloqueados. No hay historial de nada en ninguna parte.
- **No hay una vista de conjunto:** no existe un tablero por etapa.

La clienta definió el recorrido el 2026-10-12 (con Daniel): ocho etapas y dos
salidas, una sola agencia por candidata por ahora, y la etapa "Pago confirmado"
como el hecho que dispara la comisión que la agencia le paga a Destino Au Pair
(R17, que se construye aparte).

## What Changes

- **Ocho etapas y dos salidas, con un solo vocabulario:**
  Diligenciando → En revisión → Con correcciones → Evaluación de la agencia →
  Elección de plan → Pago confirmado → Visa → Completada; salidas: No califica
  (Destino Au Pair) y No continúa (agencia o candidata).
- **Las cuatro primeras se calculan solas** de datos que ya existen (partes
  enviadas, observaciones abiertas, decisión del equipo). **Las de la agencia se
  mueven** —por el admin en este change, por la agencia en `panel-agencia`.
- **La decisión del equipo son tres acciones** en la ficha: "Aprobar y enviar a
  la agencia" (eligiendo la agencia), "Pedir correcciones" (las observaciones) y
  "No califica" (con motivo interno obligatorio). Se retiran el select de
  Calificación DAP y el de Estado con la agencia.
- **Una agencia por candidata**, en una tabla propia (`candidata_agencia`) con
  su etapa y sus fechas. La restricción "una" es un índice único: si la clienta
  valida varias, se quita sin rediseñar.
- **Historial con fecha y autor** de cada hecho del recorrido
  (`historial_candidata`), que alimenta la línea de tiempo.
- **Una sola línea de tiempo**, compartida: la candidata la ve en "Mi Destino" y
  en su perfil; el admin, en la ficha. Cada hito con su fecha y, desde la
  aprobación, la agencia.
- **Score automático:** el porcentaje de toda la información diligenciada —todos
  los campos que le aplican, obligatorios u opcionales, más los 12 documentos—.
- **Las notas dicen quién las ve:** "Presentación para la agencia" (la ve la
  agencia) y "Notas internas" (sólo el equipo).
- **Tablero kanban** en el admin: una columna por etapa, una tarjeta por
  candidata con su score, su agencia y los días en la etapa; las etapas de la
  agencia se mueven arrastrando.

## Capabilities

### New Capabilities

- `etapas-candidata`: el recorrido, la decisión del equipo, la relación con la
  agencia, el historial, el score y el tablero.

### Modified Capabilities

- `ficha-candidata`: el bloque de valoración interna se reemplaza por la
  decisión, la etapa, el score y las notas con su visibilidad; la ficha muestra
  la línea de tiempo.

## Impact

- Migración `009_etapas_candidata.sql`: columnas de decisión en `usuarios`,
  tablas `candidata_agencia` e `historial_candidata`.
- Nuevo: `lib/etapas-candidata.js` (puro), `lib/historial-aupair.js`,
  `components/perfil/LineaDeTiempo.jsx`, `components/panel/TableroEtapas.jsx`,
  `app/admin/perfiles/tablero/page.jsx`.
- Rutas: `PUT /api/admin/perfiles/[id]/decision`,
  `PUT /api/admin/perfiles/[id]/etapa`, `GET /api/admin/perfiles/[id]/historial`,
  `GET /api/admin/tablero`, `GET /api/dashboard/historial`; se reescribe
  `GET /api/dashboard/proceso`.
- Se registra historial desde: registro, envío de partes, observaciones,
  decisión, movimientos de etapa.

## Fuera de alcance

- El panel de la agencia (ver, seleccionar y mover sus candidatas con los mismos
  componentes): change `panel-agencia`, que va en el mismo despliegue.
- La comisión agencia → DAP (R17): aquí sólo queda registrado "Pago confirmado".
- Varias agencias por candidata.
- Reconstruir el historial de hechos anteriores sin fecha: las aprobaciones
  previas entran al historial con la fecha de la migración y lo dicen.

## Qué queda muerto

- `PUT /api/admin/aprobar-evaluacion`: la reemplaza `.../decision`. Se retira.
- `PUT /api/dashboard/proceso` (override del admin sobre una tabla que no
  existe) y la lectura de `proceso_usuario`. Se retiran.
- Los selects de Calificación DAP y Estado con la agencia, y el score manual, de
  la ficha. Las columnas `calificacion_dap`, `score_dap` y `estado_agencia` dejan
  de escribirse desde el admin; las sigue leyendo el panel heredado de la
  agencia hasta que `panel-agencia` lo retire, y en ese change se retiran.
