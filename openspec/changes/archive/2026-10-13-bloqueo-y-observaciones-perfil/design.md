## Context

Capa Destino Au Pair. Lo que hay:

- Los campos del perfil, sus secciones y sus partes se declaran en
  `lib/campos-perfil.js` (`PARTE1`, `PARTE2`). Los ids de sección se repiten
  entre partes, así que una sección se identifica por `parte + id`.
- Escriben el perfil de la candidata: `PUT /api/dashboard/perfil` (formularios
  Parte 1 y 2, que envían el perfil entero), `PUT /api/dashboard/configuracion`
  (nombre, apellido y cuatro campos de la Parte 1), `POST /api/dashboard/foto`
  (`foto_url`, Parte 2 · fotos) y `POST /api/dashboard/documento`
  (`cedula_frontal_url`/`cedula_posterior_url`, que no están declaradas pero se
  capturan en la Parte 1 · personal).
- Documentos: `POST/DELETE /api/dashboard/documentos` sobre `documentos_usuario`
  (un registro por `tipo_doc`, reemplazo por UPDATE).
- La ficha (`components/perfil/FichaCandidata.jsx`) se genera de
  `campos-perfil.js` y la usan la candidata (`modo="propio"`) y el admin
  (`modo="revision"`). La edición del admin genera sus controles con
  `CampoEditable` desde las mismas declaraciones.

## Goals / Non-Goals

**Goals:** cerrar lo enviado en el servidor, no sólo en la interfaz; que la
observación sea el único mecanismo de reapertura; que corregir no obligue a
rehacer los formularios largos.

**Non-Goals:** historial de cambios; reapertura sin observación; cerrar
retroactivamente perfiles ya terminados.

## Decisions

### 1. Datos

Migración `008_observaciones_perfil.sql`:

```sql
ALTER TABLE usuarios ADD COLUMN parte1_enviada_at DATETIME NULL, ADD COLUMN parte2_enviada_at DATETIME NULL;
CREATE TABLE observaciones_perfil (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,                  -- la candidata
  tipo ENUM('campo','seccion','documento') NOT NULL,
  parte TINYINT NULL, seccion VARCHAR(40) NULL, campo VARCHAR(64) NULL, tipo_doc VARCHAR(40) NULL,
  texto TEXT NOT NULL,
  estado ENUM('abierta','atendida','cerrada') NOT NULL DEFAULT 'abierta',
  creada_por INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, atendida_at DATETIME NULL, cerrada_at DATETIME NULL,
  INDEX (usuario_id, estado),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

*Alternativa descartada — un estado por parte (`en_revision`, `devuelta`…):* la
clienta pidió granularidad por campo y documento; un estado por parte obliga a
reabrir todo para corregir un dato.

*Alternativa descartada — reutilizar `documentos_usuario.nota_admin`:* sólo
cubre documentos, y ya significa "nota informativa" para la candidata.

### 2. Las reglas, puras y compartidas: `lib/observaciones-perfil.js`

Sin dependencias de servidor (la importan la ficha y las rutas):

- `ubicacionesDeCampo(name)` → `[{ parte, seccion }]`, de `PARTE1/PARTE2`, más
  las dos columnas de cédula en `1 · personal`.
- `cubre(obs, { parte, seccion, campo })` — observación abierta de campo con ese
  nombre, o de sección con esa parte+sección.
- `cambiosBloqueados(cambios, fila, enviadas, abiertas)` → campos que **cambian
  de valor**, pertenecen a una parte enviada y no están cubiertos. Comparación
  normalizada (vacío = null; fechas a `YYYY-MM-DD`; `Date` de mysql2 incluido;
  el resto como texto).
- `observacionesAtendidas(cambiados, abiertas)` → ids a pasar a "atendida".

Se compara contra el valor guardado porque los formularios reenvían el perfil
entero: sin eso, guardar la Parte 2 con la Parte 1 enviada se rechazaría siempre.

### 3. Las consultas: `lib/bloqueo-perfil.js`

`estadoBloqueo(usuarioId)` → `{ enviadas: {1,2}, abiertas }` y
`atenderObservaciones(ids)`. Las cinco rutas de la candidata los llaman **antes**
de escribir, y marcan atendidas **después** de escribir con éxito.

### 4. Documentos

`POST` sobre un `tipo_doc` que ya tiene registro, o `DELETE` de un registro:
403 salvo observación abierta de tipo `documento` con ese `tipo_doc`. Tras el
reemplazo, la observación pasa a "atendida". Cargar un tipo que no existe sigue
libre.

### 5. Enviar

`POST /api/dashboard/perfil/enviar { parte }`: 400 si `!parteCompleta(parte)`;
si no, fija `parteN_enviada_at = NOW()` (sólo si estaba en NULL). En el
formulario, la última sección muestra "Enviar Parte N"; al pulsarlo, un diálogo
de confirmación; al confirmar, guarda, envía y muestra el aviso de siguiente
paso del change `edad-y-aviso-documentos`.

Con la parte enviada, el formulario muestra una pantalla "Enviaste tu Parte N"
con acceso a `/dashboard/perfil`, igual que la pantalla de "Parte 2 bloqueada"
que ya existe.

*Alternativa descartada — cerrar al completarse la parte:* se cerraría a mitad
de la última sección, antes de que la candidata decida que terminó.

### 6. Corregir desde el perfil, con controles generados

`CampoEditable` sale de `app/admin/perfiles/[id]/editar/page.jsx` a
`components/perfil/CampoEditable.jsx` (la página del admin lo importa). La
ficha propia muestra, antes de las pestañas, "El equipo te pidió corregir"
con una tarjeta por observación abierta: texto, y los controles del campo o de
los campos de la sección, con "Guardar corrección" (`PUT /api/dashboard/perfil`
sólo con esos campos). Para un documento, un botón a `/dashboard/documentos`,
donde ese documento muestra la observación y vuelve a ofrecer subirlo.

*Alternativa descartada — reabrir campos sueltos dentro de los formularios de
la Parte 1 y 2:* están escritos a mano, campo por campo, sin un punto único
donde desactivar controles; habría que tocar cada uno de unos 80 inputs.

### 7. Observar desde la ficha del admin

En `modo="revision"`:

- Cada campo gana un botón "Observar" que despliega un texto y "Abrir a
  corrección".
- Cada sección, un "Observar sección" en su encabezado.
- Cada documento de la pestaña Documentos, "Pedir corrección".
- Sobre las pestañas, el listado de observaciones con su estado y las acciones
  "Cerrar" (atendida) y "Retirar" (abierta).

Rutas: `GET/POST/PATCH /api/admin/perfiles/[id]/observaciones` (`requiereAdmin`).
`POST` valida que el elemento exista en las declaraciones (campo, sección o
`DOCS_REQUERIDOS`) y que el texto no esté vacío; dispara
`avisarObservaciones(usuarioId)`. `PATCH { id, accion: "cerrar"|"retirar" }`.

### 8. Aviso

`avisarObservaciones(usuarioId)` en `lib/notificaciones-aupair.js`, respetando
`notif_email`. Repetible por diseño (`clave_unica` NULL): cada tanda de
observaciones avisa.

## Risks / Trade-offs

- **Una candidata con la parte enviada no puede corregir un error propio** sin
  que el admin lo observe. → Es exactamente lo pedido; el texto de la
  confirmación lo dice antes de enviar.
- **Configuración muestra datos que pueden estar cerrados.** → El servidor
  rechaza con un mensaje claro; la pantalla lo muestra.
- **Aviso por cada observación** si el admin escribe varias seguidas. → Se
  agenda con `after()`; aceptable. Si molesta, se agrupa después.

## Migration Plan

1. `008_observaciones_perfil.sql` (idempotente) y registro en
   `deploy/desplegar.sh`.
2. Código. Despliegue con `deploy/desplegar.sh` (lleva migración).
3. Reversión: commit anterior; las columnas y la tabla nuevas no estorban al
   código viejo.

## Open Questions

- ¿El admin debe poder reabrir una parte entera de una vez? Hoy se logra
  observando sus secciones.
