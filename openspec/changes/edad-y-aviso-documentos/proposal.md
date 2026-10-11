## Why

La clienta fijó en la reunión del 5 de agosto (R4) que el programa acepta
candidatas **de 18 a 27 años inclusive**, y que quien esté fuera de ese rango
**no puede continuar el registro**. Hoy el registro (`app/register/page.jsx`,
`POST /api/auth/register`) ni siquiera pide la fecha de nacimiento: la fecha
aparece por primera vez en la Parte 1 del perfil, días después, cuando la cuenta
ya existe. Y la regla que sí existe —mínimo 18, del change
`validar-fecha-nacimiento`— tiene tres huecos verificados en el código:

- **El servidor no la aplica.** `parteCompleta()` en `lib/campos-perfil.js`
  sólo mira campos vacíos, no inválidos, así que `PUT /api/dashboard/perfil`
  marca `perfil_completo = 1` con una fecha imposible, y
  `PUT /api/admin/aprobar-evaluacion` deja aprobar ese perfil. La spec vigente
  ("El servidor aplica la misma regla") dice lo contrario.
- **Dos rutas guardan cualquier fecha:** `PUT /api/dashboard/configuracion`
  (pantalla Configuración de la candidata) y `PUT /api/admin/perfiles/[id]`
  (edición del admin) escriben `fecha_nacimiento` sin validar.
- **No hay edad máxima** en ninguna parte del código.

Además (R1), al terminar la Parte 1 o la Parte 2 la candidata pulsa
"Finalizar", ve "Guardado correctamente" y vuelve a su perfil. Nada le dice que
el siguiente paso es cargar sus documentos —ocho obligatorios— ni la lleva a la
Parte 2. Los documentos se quedan en el aire hasta que ella entra por su cuenta
al módulo.

## What Changes

- **El registro pide la fecha de nacimiento** y no deja crear la cuenta si la
  persona tiene menos de 18 o más de 27 años. Se valida en el formulario y en
  `POST /api/auth/register`, con la misma regla de `lib/campos-perfil.js`.
- **Edad máxima de 27 años**, declarada en un único lugar (`EDAD_MAXIMA`),
  junto a la mínima.
- **El tope sólo aplica a registros nuevos.** Las cuentas creadas antes de este
  cambio conservan la regla anterior (sólo el mínimo de 18): una candidata que
  ya está en proceso y cumplió 28 no se bloquea. Para las cuentas nuevas, el
  tope se mide **a la fecha de registro**, de modo que tampoco se bloquee a
  quien cumpla 28 a mitad del proceso.
- **El servidor deja de aceptar fechas inválidas** en las tres rutas que la
  escriben (perfil, configuración, edición del admin): responde 400 con el
  motivo y no guarda.
- **El servidor no da por completa una parte con un valor inválido.**
  `parteCompleta()` pasa a exigir lo mismo que `seccionCompleta()`; con eso
  `perfil_completo` y la aprobación del admin dejan de aceptar fechas
  imposibles.
- **Al finalizar la Parte 1 o la Parte 2, un modal guía el siguiente paso:**
  "¿Quieres cargar tus documentos ahora?" con acceso directo a
  `/dashboard/documentos`. Al terminar la Parte 1 ofrece además continuar con la
  Parte 2. Sólo aparece si le faltan documentos obligatorios y tiene el módulo
  de documentos habilitado; si no, ofrece lo que sí puede hacer.

## Capabilities

### New Capabilities

- `registro-candidata`: qué pide el registro público de una candidata y qué
  rechaza (la fecha de nacimiento y su rango de edad).

### Modified Capabilities

- `perfil-candidata`: la regla de la fecha de nacimiento gana el tope de 27 años
  con su alcance (sólo cuentas nuevas, medido a la fecha de registro); el
  servidor rechaza fechas inválidas en todas las rutas que la escriben y no da
  una parte por completa con valores inválidos; al finalizar cada parte la
  candidata recibe el aviso de documentos.

## Impact

- `lib/campos-perfil.js` — `EDAD_MAXIMA`, fecha de corte, validador con
  contexto de la cuenta, `parteCompleta()` y un validador de campo suelto para
  las rutas.
- `app/register/page.jsx`, `app/api/auth/register/route.js` — campo y
  validación.
- `app/api/dashboard/perfil/route.js`, `app/api/dashboard/configuracion/route.js`,
  `app/api/admin/perfiles/[id]/route.js`, `app/api/admin/aprobar-evaluacion/route.js`
  — validación en servidor.
- `app/dashboard/perfil/evaluacion/page.jsx`, `app/dashboard/perfil/agencia/page.jsx`
  — el validador recibe `created_at`; modal al finalizar.
- `components/perfil/ModalSiguientePaso.jsx` — nuevo.
- Sin migraciones: `usuarios.fecha_nacimiento` y `usuarios.created_at` ya
  existen.

**Efecto visible a avisar:** un perfil guardado con una fecha imposible que hoy
figura como completo deja de estarlo (ya lo anunciaba la spec; ahora además lo
cumple el servidor).

## Fuera de alcance

- **El texto de dos preguntas de la Parte 1** ("si tienes 26 años…" y "entre
  18-20 años…") describe requisitos del programa. Con el rango ampliado a 27
  probablemente deba decir "26 o 27 años", pero es contenido de la clienta: se
  le pregunta, no se adivina.
- Bloquear la edición del perfil tras enviarlo (R3) — change propio.
- Validar otros campos además de la fecha.

## Qué queda muerto

Nada. `faltantesDeParte()` sigue en uso para listar lo que falta; sólo deja de
ser el criterio de "parte completa".
