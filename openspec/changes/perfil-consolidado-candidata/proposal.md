## Why

Una candidata termina de diligenciar su perfil —quince secciones entre las dos partes— y **no tiene dónde verlo**. Las dos únicas pantallas que existen son formularios de edición: `/dashboard/perfil/evaluacion` (489 líneas) y `/dashboard/perfil/agencia` (454 líneas). No hay ninguna vista de lectura.

La pantalla que las reúne, `/dashboard/perfil`, ofrece tres caminos y los tres engañan:

- El botón principal dice **"Revisar mi perfil"** y abre `/perfil/evaluacion`, que es **sólo la Parte 1**. La mitad del perfil no está ahí.
- La Parte 2 tiene su propio botón "Revisar", aparte, al final de la página.
- Las seis tarjetas de sección de la Parte 1 —Datos personales, Habilidades, Situación, Salud, Experiencia, Visas— **van todas al mismo sitio**, sin anclar. Hacer clic en "Salud" no lleva a Salud: lleva al principio del formulario.

Es decir: el botón que promete el perfil entero muestra la mitad, y las tarjetas que prometen una sección concreta no llevan a ninguna.

Hay además una pieza construida que nadie ve. `/api/dashboard/perfil` ya devuelve `evaluacion_aprobada`, `score_dap`, `calificacion_dap` y `nota_dap`, y `/api/dashboard/proceso` los usa para decidir el estado del proceso — pero **ninguna pantalla de la candidata se los muestra**. El equipo evalúa el perfil y la candidata nunca ve el resultado. Es el ítem 11 del alcance cerrado, hoy a medias.

## What Changes

### Una vista consolidada del perfil

Cuando el perfil está diligenciado, `/dashboard/perfil` deja de ser la única entrada y **"Revisar mi perfil" abre una vista de lectura con todo el perfil junto**: foto y datos principales arriba, y debajo las quince secciones de las dos partes, cada una con sus campos y su botón de editar.

- **La vista se deriva de `lib/campos-perfil.js`**, que ya declara las secciones y el `label` de cada campo. No se escribe a mano ninguna etiqueta: si mañana se añade un campo al formulario, aparece solo en la vista consolidada. No pueden desincronizarse.
- Un campo sin diligenciar se muestra como vacío de forma explícita, no se omite: la candidata tiene que poder ver qué le falta.

### Editar desde donde se está mirando

- **BREAKING (interno)**: los formularios pasan a aceptar la sección por la URL. Hoy ambos son asistentes con el paso en estado interno, siempre arrancando en cero y sin leer la URL.
- El botón de editar de cada sección abre su formulario **en esa sección**, no al principio.
- El salto directo sólo se ofrece con el perfil completo, que es cuando todas las secciones están validadas. Con el perfil a medias se sigue entrando por el principio, para no saltarse la validación por pasos que fijó el Sprint 0.0.

### Las tarjetas dejan de mentir

Las seis tarjetas de sección de `/dashboard/perfil` llevan cada una a su sección. La Parte 2 deja de ser una tarjeta suelta al final y se integra con el resto.

### La API del perfil deja de devolver lo que no debe

`GET /api/dashboard/perfil` hace `SELECT *` y entrega **119 columnas** al navegador de la candidata, entre ellas **el hash de su contraseña** y sus `reset_token` / `reset_token_expiry`. Hoy los tokens van vacíos, pero una candidata que pida recuperar su contraseña y abra su perfil los enviaría a su navegador: quien pudiera leer esa respuesta podría cambiarle la contraseña.

El barrido del Sprint 1 no lo vio porque miraba **quién** puede llamar cada ruta, no **qué** devuelve.

La ruta pasa a entregar sólo lo que el perfil necesita. La lista de columnas prohibidas ya existe en ese mismo archivo (`BLOQUEADAS`, que usa el `PUT`); el `GET` simplemente no la estaba usando.

### El resultado de la evaluación, visible

Cuando el equipo ha evaluado el perfil, la candidata ve el resultado en su vista consolidada: si está aprobado y la observación que le hayan dejado, que es lo accionable. Mientras no haya evaluación, se dice que está en revisión — no se inventa un estado.

**La calificación numérica no se le muestra.** `score_dap` y `calificacion_dap` no tienen definición escrita en ninguna parte —ni sobre cuánto van, ni qué significa cada valor— y un número sin explicación genera preguntas que nadie puede responder. Quedan como herramienta interna del equipo.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `perfil-candidata`: hoy cubre qué campos son obligatorios y cómo se valida el formulario. Se le añade **cómo se consulta el perfil una vez diligenciado** y **cómo se llega a editar una sección concreta**. La validación por pasos del Sprint 0.0 no cambia.

## Impact

**Código afectado**

- `app/dashboard/perfil/page.jsx` — pasa a **ser** la vista consolidada, en sus dos estados. No hay ruta nueva: se probó con una (`/perfil/vista`) y sobraba.
- `lib/campos-perfil.js` — se añade lo que falte para poder rotular un valor (los `label` ya están; hace falta cómo se presenta un valor vacío o de lista).
- `app/dashboard/perfil/evaluacion/page.jsx` y `app/dashboard/perfil/agencia/page.jsx` — leer la sección inicial de la URL.
- `app/api/dashboard/perfil/route.js` — dejar de devolver `SELECT *`: entregar el perfil sin las columnas de autenticación. Los 63 campos de las 15 secciones ya llegan todos.

**Datos**

Ninguna migración. Todas las columnas existen.

**Infraestructura**

Ninguna.

## Qué queda muerto

| Qué | Dónde | Por qué |
|---|---|---|
| El índice de secciones del perfil | `app/dashboard/perfil/page.jsx` | Lo reemplaza la vista consolidada, que ya muestra las secciones y su estado |
| El botón "Revisar" suelto de la Parte 2 | `app/dashboard/perfil/page.jsx` | Revisar es lo que hace la vista; ese botón sólo edita |
| El destino único de las seis tarjetas de sección | `app/dashboard/perfil/page.jsx` | Cada una lleva a su sección |
| El `SELECT *` del perfil | `app/api/dashboard/perfil/route.js` | Devolvía 119 columnas, incluido el hash de la contraseña |

**Deuda nueva que sí se produce:** la vista consolidada renderiza los valores tal como están en la base. Los campos que guardan listas o textos largos van a verse crudos hasta que se defina cómo presentarlos; se anota y se resuelve cuando haya un caso real que lo pida, no antes.

**Lo que esta vista habilita, sin hacerlo aquí:** el PDF de hoja de vida del ítem 14 necesita exactamente esta consolidación. Hoy la única versión que existe vive dentro de `exportPDF()` en `app/admin/perfiles/[id]/agencia/page.jsx`, como una plantilla HTML suelta. Cuando llegue el Sprint 4, el PDF debe salir de la vista consolidada y esa plantilla se retira — anotado para no construir dos veces lo mismo.

**Fuera de alcance**

- Exportar el perfil en PDF (ítem 14, Sprint 4).
- Responsive mobile (ítem 3, Sprint 4).
- El resto del Sprint 2 —dashboard con datos reales, indicadores de calendario y recursos, módulo de recursos—, que se propone aparte porque parte depende de los talleres de descubrimiento.
- Rediseñar los formularios de edición: sólo se les añade la sección inicial por URL.
