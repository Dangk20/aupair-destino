## Why

Aprobar a una candidata es la decisión más importante que toma la clienta sobre
un perfil, y hoy se toma **donde no se puede ver el perfil**: en el listado de
`/admin/perfiles`, con un botón redondo de 32 píxeles cuyo único indicio es un
círculo relleno o vacío. Para decidir hay que abrir la ficha, leerla, volver al
listado, encontrar la fila y acertarle al botón.

Se verificó en el código: `toggleAprobar()` vive en `app/admin/perfiles/page.jsx`
y llama a `PUT /api/admin/aprobar-evaluacion`. La ficha, que es donde sí está la
información, sólo puede cambiar `evaluacion_aprobada` de refilón, como una opción
más de un `<select>` dentro del bloque de valoración interna, junto a un "Guardar"
que escribe otras seis columnas a la vez.

Y hay una segunda cosa que hoy no se puede hacer: **sacar el perfil de la
plataforma**. Cuando la clienta presenta una candidata a una agencia aliada
—que es el negocio— no tiene nada que enviar. Arma el correo a mano, copia datos
de la pantalla y adjunta los documentos uno por uno, bajándolos de a uno desde la
ficha. El ítem 14 del alcance cerrado lo contempla; estaba planeado para el
Sprint 4 y se adelanta porque es lo que desbloquea la operación diaria.

## What Changes

- **Aprobar el perfil pasa a la ficha**, como un botón propio junto a "Guardar"
  del bloque de valoración interna. Dice qué va a hacer —"Aprobar perfil" o
  "Quitar aprobación"— y actúa solo, sin arrastrar los otros seis campos.
  Conserva la regla que ya existe: no se puede aprobar un perfil incompleto.
- **BREAKING (para el admin):** desaparece el botón de aprobar del listado. Su
  lugar lo toma **Descargar perfil**, y el orden de la fila pasa a ser
  **editar · ver · descargar**.
- **Descargar perfil** entrega un **ZIP** con dos cosas: un **CV en PDF** con la
  foto y las 15 secciones del perfil, y **los documentos que cargó la candidata**,
  cada uno con su nombre legible.
- El CV se dibuja en la **línea gráfica del producto** —borgoña `#A0435F`,
  Poppins— a dos columnas: foto y datos de contacto a la izquierda, el contenido
  a la derecha. No reproduce la plantilla rosa de referencia.
- El PDF lleva **las 15 secciones completas**, salud y visas incluidas. **Nunca**
  la valoración interna: `score_dap`, `calificacion_dap`, `nota_dap` y
  `notas_agencia` no salen del panel.
- La descarga es una **ruta autenticada de admin**, como la de los documentos: no
  hay enlace público ni adivinable.

### Fuera de alcance

Explícito, porque el contrato es de alcance cerrado:

- **Enviar el ZIP por correo a la agencia.** Se descarga; enviarlo lo sigue
  haciendo la clienta desde su correo. Automatizarlo es otra conversación.
- **Que la agencia se descargue el perfil desde su propio panel.** Esta descarga
  es del admin. El panel de agencia se revisa en su propio momento.
- **Descarga masiva de varias candidatas a la vez.** Una candidata, un ZIP.
- **Elegir qué secciones entran en el PDF.** Van las 15, siempre. Un selector es
  configuración que nadie ha pedido todavía.
- **El responsive móvil de estas pantallas** — ítem 3, Sprint 4.
- **Rehacer el flujo de aprobación.** Sigue siendo un booleano y sigue sin haber
  dónde escribir por qué se rechaza un perfil. Es la carencia ya señalada, y
  necesita taller con la clienta.

### Qué queda muerto

- **`botonAprobar` y `toggleAprobar()` se retiran de `app/admin/perfiles/page.jsx`**,
  con el estado `aprobando` que los acompaña. La lógica no se duplica: se muda.
- **El `<select>` de "Evaluación del perfil" desaparece del bloque de valoración
  interna** de la ficha. Lo reemplaza el botón, que dice lo mismo con una sola
  acción y sin poder guardarse por accidente junto a otra cosa.
- **`PUT /api/admin/perfiles/[id]` deja de aceptar `evaluacion_aprobada`.** Hoy la
  acepta, así que la columna tiene dos dueños: esa ruta y
  `/api/admin/aprobar-evaluacion`. Es el mismo defecto que `lib/ventas-aupair.js`
  vino a corregir en las ventas. Queda un solo dueño: la ruta de aprobación.
- No hay tablas ni columnas que retirar: este cambio no toca el esquema.

## Capabilities

### New Capabilities

- `descarga-perfil`: el personal puede llevarse el perfil de una candidata fuera
  de la plataforma en un solo archivo —su CV en PDF más su documentación—, con
  las mismas reglas de acceso que ya rigen la ficha.

### Modified Capabilities

- `ficha-candidata`: la ficha gana la acción de aprobar el perfil, que hasta ahora
  vivía en el listado, y la declara como una acción propia y no como un campo más
  del bloque de valoración interna.

## Impact

**Código**

- Nuevo: `lib/cv-candidata.js` (dibuja el PDF), `lib/paquete-perfil.js` (arma el
  ZIP) y `app/api/admin/perfiles/[id]/descargar/route.js`.
- Modificados: `app/admin/perfiles/page.jsx` (fuera aprobar, dentro descargar, y
  el orden editar · ver · descargar), `app/admin/perfiles/[id]/page.jsx` (el botón
  de aprobar), `app/api/admin/perfiles/[id]/route.js` (deja de aceptar
  `evaluacion_aprobada`).
- Nuevo recurso: las fuentes Poppins en `.ttf`. `pdfkit` no lee `woff2`, que es lo
  único que hay hoy en el repositorio y además es un artefacto de compilación.

**APIs**

- Nueva: `GET /api/admin/perfiles/[id]/descargar` — nivel admin. Se declara en
  `docs/rutas-y-acceso.md` **antes** de escribir el handler, o las pruebas de humo
  fallan.
- `PUT /api/admin/perfiles/[id]` — deja de escribir `evaluacion_aprobada`.
- `PUT /api/admin/aprobar-evaluacion` — sin cambios en su contrato; cambia quién
  la llama.

**Dependencias**

Dos nuevas, las dos JavaScript puro, sin compilación nativa: `pdfkit` para dibujar
el PDF y `archiver` para escribir el ZIP en flujo. Es la primera vez que este
proyecto añade dependencias de producción desde que se recibió, así que conviene
decirlo en voz alta.

**Riesgo**

El que importa: **el PDF sale de la plataforma con datos clínicos y de historial
migratorio** —depresión, autolesiones, sustancias, visas negadas, familiares en
Estados Unidos—. Es lo decidido: la agencia los pide. Pero significa que un ZIP
mal enviado es una fuga de datos sensibles de una persona real, y que la ruta que
lo genera tiene que estar cerrada a admin sin excepción.
