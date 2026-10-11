## Why

La clienta pidió (R3, reunión del 2026-08-05; precisado el 2026-10-10) que,
**una vez la candidata envía su información, no la pueda editar**, salvo lo que
el administrador le reabra **con una observación**: por campo, por sección o por
documento. Escribir la observación es lo que habilita la edición de ese
elemento, y nada más. Es lo que convierte la revisión del perfil en un ciclo
—enviar, revisar, corregir— en vez de un formulario que cambia por debajo
mientras el equipo lo está revisando.

Hoy no existe nada de esto, verificado en el código:

- **La candidata edita todo, siempre.** `PUT /api/dashboard/perfil` guarda
  cualquier columna fuera de una lista negra; no hay estado de "enviado". La
  ficha pinta "Editar" en todas las secciones.
- **Puede borrar documentos ya aprobados.** `DELETE /api/dashboard/documentos`
  borra en cualquier estado, y el `POST` reemplaza un documento aprobado
  devolviéndolo a "pendiente".
- **No hay dónde escribir una observación por campo o sección.** Lo único es
  `documentos_usuario.nota_admin`, una nota por documento que no desbloquea
  nada. `score_dap`/`nota_dap` son valoración interna que la candidata no ve.
- **Hay tres caminos que escriben el perfil**, y los tres tendrían que respetar
  el bloqueo: los formularios de la Parte 1 y 2, la pantalla de Configuración
  (teléfono, ciudad, país y fecha son campos de la Parte 1) y las subidas de
  foto y cédula.

## What Changes

- **Enviar una parte es un acto explícito.** En la última sección, el botón
  pasa a ser "Enviar Parte N", con una confirmación que explica que después
  sólo podrá corregir lo que el equipo le pida. Se registra la fecha de envío.
- **Una parte enviada queda cerrada**: el servidor rechaza cualquier cambio a
  sus campos (en las tres rutas que los escriben) salvo los cubiertos por una
  observación abierta. Su formulario muestra que fue enviada y la lleva a su
  perfil.
- **Un documento cargado queda cerrado**: no se puede quitar ni reemplazar salvo
  con una observación abierta sobre ese documento.
- **El admin escribe observaciones desde la ficha de la candidata**: sobre un
  campo, sobre una sección completa o sobre un documento. Al guardarla, ese
  elemento queda editable para la candidata, **automáticamente**.
- **La candidata corrige desde su perfil**: ve cada observación con el texto
  del equipo y, ahí mismo, el campo, la sección o el documento a corregir.
- **Al guardar la corrección, se vuelve a cerrar** y la observación pasa a
  "atendida"; el admin la ve así en la ficha y puede darla por cerrada o
  escribir una nueva.
- **Aviso por correo a la candidata** cuando recibe observaciones, por el módulo
  de notificaciones existente (respeta `notif_email`).

## Capabilities

### New Capabilities

- `observaciones-perfil`: el ciclo enviar → observar → corregir → volver a
  cerrar, para campos, secciones y documentos.

### Modified Capabilities

- `perfil-candidata`: el formulario deja de ser editable después de enviar
  cada parte; la última sección envía en vez de sólo guardar.

## Impact

- Migración `008_observaciones_perfil.sql`: columnas `parte1_enviada_at` y
  `parte2_enviada_at` en `usuarios`; tabla `observaciones_perfil`.
- Nuevo: `lib/observaciones-perfil.js` (reglas puras, cliente y servidor),
  `lib/bloqueo-perfil.js` (consultas), `components/perfil/CampoEditable.jsx`
  (extraído de la edición del admin), `components/perfil/Observaciones*.jsx`.
- Rutas nuevas: `GET/POST/PATCH /api/admin/perfiles/[id]/observaciones`,
  `GET /api/dashboard/observaciones`, `POST /api/dashboard/perfil/enviar`.
- Rutas que pasan a respetar el bloqueo: `PUT /api/dashboard/perfil`,
  `PUT /api/dashboard/configuracion`, `POST /api/dashboard/foto`,
  `POST /api/dashboard/documento`, `POST/DELETE /api/dashboard/documentos`.
- Pantallas: Parte 1, Parte 2, `/dashboard/perfil`, `/dashboard/documentos`,
  `/admin/perfiles/[id]`, y `docs/rutas-y-acceso.md` + `scripts/pruebas-humo.mjs`.
- **Trabajo adicional al contrato cerrado** (R3 figura entre los módulos nuevos):
  se registra como adicional cotizado.

## Fuera de alcance

- **Perfiles ya terminados antes de este cambio no se cierran solos.** Quedan
  abiertos hasta que la candidata envíe la parte; cerrarlos de golpe impediría
  corregir a las que figuran incompletas por los campos que se volvieron
  obligatorios. El admin puede observarlas igual.
- Que el admin "reabra" una parte entera sin escribir observación.
- Historial de cambios del perfil (R10).
- La nota por documento existente (`nota_admin`) sigue como está: informa, no
  desbloquea.

## Qué queda muerto

Nada. El lápiz "Editar" de la ficha propia deja de mostrarse en partes
enviadas, pero sigue en uso mientras la parte no se envía.
