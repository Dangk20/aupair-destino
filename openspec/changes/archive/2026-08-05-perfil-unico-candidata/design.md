## Context

Se opera sobre la única app del repositorio: la capa Destino Au Pair
(`lib/db-aupair.js`, cookie `dap_token`). Project Center y la plantilla Saasly se
retiraron en el Sprint 1.

Estado verificado en el código el 2026-08-03:

| Pantalla | Líneas | Cómo sabe qué mostrar |
|---|---|---|
| `app/dashboard/perfil/page.jsx` | 328 | Se genera desde `lib/campos-perfil.js`. Cero labels a mano. |
| `app/admin/perfiles/[id]/page.jsx` | 695 | `SECCIONES` propia (6) + `CAMPOS_PROGRESO` propia (16 campos) + `calcProgreso()` propia. |
| `app/admin/perfiles/[id]/agencia/page.jsx` | 709 | `SECCIONES` propia (10) + `seccionCompleta()` propia + `calcProgresoAgencia()` propia. |

`lib/campos-perfil.js` declara 63 campos en 15 secciones (PARTE1 con 6, PARTE2 con
9) y exporta ya todo lo necesario: `valorParaMostrar()`, `camposFaltantes()`,
`seccionCompleta()`, `progresoTotal()`, `seccionInicial()`.

La regla de `seccionCompleta()` del admin de agencia merece verse escrita:

```js
return sec.campos.filter(c => form[c] && String(form[c]).trim() !== "").length
       >= Math.ceil(sec.campos.length / 2);
```

Una sección con la mitad de sus campos llenos cuenta como completa. Ésa es la
razón concreta de que la clienta vea "100% completado" sobre perfiles que no lo
están.

`DOCS_REQUERIDOS` está exportado desde `app/api/dashboard/documentos/route.js`.
Funciona, pero importar desde una ruta de API arrastra a un componente de cliente
todo lo que ese archivo importe.

Restricción que manda sobre lo demás: **la plataforma está viva y la clienta usa
`/admin/perfiles/[id]` a diario.** Se puede cambiar cómo se ve; no se puede dejar
de poder revisar y editar una candidata ni un día.

## Goals / Non-Goals

**Goals:**

- Una sola ficha, compartida por la candidata y el personal.
- Una sola declaración de secciones, campos y avance: `lib/campos-perfil.js`.
- La documentación, dentro de la ficha.
- Cerrar la fuga de `reset_token` en `GET /api/admin/perfiles/[id]`.
- Que el admin no pierda ninguna capacidad que tiene hoy: editar Parte 1, editar
  Parte 2, aprobar y rechazar documentos, cambiar el estado admin.

**Non-Goals:**

- Rediseñar para teléfono (Sprint 4).
- Exportar a PDF (Sprint 4).
- Rehacer el flujo de aprobación de perfiles: hoy sólo existe
  `evaluacion_aprobada`, un booleano, y no hay dónde escribir por qué se rechaza
  un perfil. Necesita taller con la clienta.
- Tocar el esquema de la base.

## Decisions

### 1. Un componente que recibe los datos, no que los pide

`components/perfil/FichaCandidata.jsx` recibe por props el perfil, los documentos
y quién mira. No hace `fetch`. Cada pantalla trae sus datos de su propia API —la
candidata de `/api/dashboard/perfil`, el admin de `/api/admin/perfiles/[id]`— y se
los pasa.

*Alternativa descartada:* que el componente decidiera a qué API llamar según el
rol. Metería la autorización dentro de un componente de presentación y haría falta
un `if (rol === "admin")` en el sitio donde menos debe estar. Además obligaría a
montar el componente para saber si la petición falló.

### 2. `modo` como prop, no `rol`

El componente recibe `modo: "propio" | "revision"`, no el rol del usuario. Lo que
cambia la ficha es si la miras como dueña o como revisora, no si eres admin. El
día que una asociada revise a sus candidatas, entra en `"revision"` sin tocar el
componente.

*Alternativa descartada:* pasar `rol`. Ataría el componente a la lista de roles y
obligaría a editarlo cada vez que un rol nuevo necesite revisar.

### 3. La autorización NO vive en la ficha

`modo="revision"` sólo decide qué se dibuja. Quién puede pedir el perfil de otra
persona lo sigue decidiendo `requiereAdmin()` en la ruta de API, como hoy. Una
candidata que manipule el cliente para pasar `modo="revision"` no obtiene nada: la
API no le devuelve el perfil ajeno.

Esto es la misma regla ya escrita en el `CLAUDE.md` del repositorio para los
permisos de sección: lo que llega al cliente es una pista para pintar, nunca la
autorización.

### 4. Editar sigue siendo el formulario, con el mismo gesto en las dos

El lápiz de cada sección abre el formulario anclado a esa sección. Para la
candidata, `/dashboard/perfil/evaluacion?seccion=<id>` o
`/dashboard/perfil/agencia?seccion=<id>` — lo que ya hace hoy. Para el admin,
`/admin/perfiles/[id]/editar?seccion=<id>`.

*Alternativa descartada:* edición en línea, campo por campo, dentro de la ficha.
Es mejor experiencia y es bastante más trabajo: habría que reconstruir la
validación condicional (`camposInvalidos`, campos que se vuelven obligatorios según
otro) en un contexto nuevo. Con dos meses de plazo y una plataforma viva, se
reutiliza el formulario que ya valida bien.

*Alternativa descartada:* conservar el asistente de seis pasos del admin. Es
exactamente lo que la clienta pidió quitar.

### 5. Un solo formulario de edición para el admin, con las 15 secciones

Hoy el admin edita la Parte 1 en `[id]/page.jsx` y la Parte 2 en
`[id]/agencia/page.jsx`, con el botón "Perfil agencia" para saltar. Se sustituyen
por `app/admin/perfiles/[id]/editar/page.jsx`, que edita cualquiera de las 15
secciones generándose desde `campos-perfil.js`.

*Alternativa descartada:* reutilizar tal cual los formularios de la candidata
(`/dashboard/perfil/evaluacion`). Están bajo `/dashboard`, que el middleware
resuelve contra la sesión de quien pide: escriben sobre el perfil **de quien está
logueado**, no sobre el de un tercero. Adaptarlos a "editar el perfil de otra
persona" es tocar la ruta de guardado, que es justo la que valida. Se deja
intacta y se hace un formulario propio del admin contra
`PUT /api/admin/perfiles/[id]`, que ya existe y ya filtra columnas.

### 6. Los campos huérfanos entran como opcionales

`religion`, `estado_civil`, `numero_pasaporte`, `carrera_graduada`,
`tiene_visa_j1`, `fumadora`, `acepta_mascotas`, `video_presentacion_url` se
declaran en `campos-perfil.js` con `req: false`.

Esto importa: si entraran como obligatorios, las candidatas que hoy tienen su
perfil terminado pasarían a tenerlo incompleto de un despliegue a otro, y su
proceso retrocedería. Opcionales, se muestran sin exigirse.

*Alternativa descartada:* dejarlos fuera de la declaración y pintarlos aparte en
la ficha del admin. Sería fundar una cuarta lista, que es el defecto que este
change viene a matar.

### 7. `DOCS_REQUERIDOS` se muda a `lib/documentos.js`

Lo importan la ruta de API y el componente de la ficha. Que un componente de
cliente importe desde `app/api/**` arrastra a la petición todo lo que ese archivo
importe, incluido el pool de MySQL.

### 8. La pestaña de Documentos es un componente con dos modos, no dos componentes

`components/perfil/PestanaDocumentos.jsx`. En `"propio"` ofrece subir y quitar; en
`"revision"`, aprobar, rechazar y anotar. La lista de requeridos y el criterio de
"archivo perdido" son los mismos en los dos.

*Alternativa descartada:* dos componentes. Volvería a abrir la puerta a que
diverjan, que es el patrón que produjo las tres listas de secciones.

### 9. La misma lista negra, en un solo sitio

`NUNCA_SE_DEVUELVEN` sale de `app/api/dashboard/perfil/route.js` a `lib/perfil.js`
y la usan las dos rutas. Con dos matices, porque no ocultan lo mismo a los mismos:

- `password`, `reset_token`, `reset_token_expiry` — se ocultan **siempre**, a
  todo el mundo. Nadie necesita un hash de contraseña en el navegador.
- `score_dap`, `calificacion_dap`, `nota_dap`, `notas_agencia` — se ocultan **a la
  candidata**. Son valoración interna; el admin sí las ve, y las necesita.

## Riesgos / Trade-offs

**La clienta revisa candidatas a diario y esa pantalla cambia de forma.** → Avisar
antes de desplegar, como con el menú. Y desplegar con la pantalla completa, no a
medias: el asistente viejo se retira en el mismo despliegue en que entra la ficha.

**El admin pierde el asistente por pasos, que sí guiaba.** → Es lo pedido. Se
compensa: en el recorrido de secciones —el estado de perfil a medias— cada sección
dice qué campos le faltan, que es más información de la que daba "1 de 6 páginas".

**Añadir campos a `campos-perfil.js` cambia el denominador del progreso.** →
Entran como opcionales y `seccionCompleta()` sólo mira los obligatorios, así que
el porcentaje no se mueve. Se verifica antes y después sobre las mismas
candidatas, con `scripts/medir-perfiles-incompletos.mjs`, y se deja el número
escrito en `tasks.md`.

**Al unificar el progreso, perfiles que el admin daba por completos aparecerán
incompletos.** → No es una regresión: es que el número pasa a ser cierto. Hay que
decírselo a la clienta antes de que lo vea, porque va a parecer que algo se rompió.

**Un componente compartido acopla las dos pantallas: romperlo las rompe las
dos.** → Es el precio de que no diverjan, y es el que se quiere pagar. El
recorrido manual cubre las dos en el mismo paso.

## Plan de despliegue

1. `npm run build` y `node scripts/pruebas-humo.mjs` en verde.
2. Recorrido manual de los dos roles sobre la misma candidata, comparando
   pantalla contra pantalla que muestran lo mismo.
3. Medir el progreso de los perfiles antes y después.
4. Avisar a la clienta.
5. `bash deploy/desplegar-codigo.sh` — sin migraciones, no se toca la base.
6. Verificar en producción.

**Vuelta atrás:** `git revert` del commit y desplegar de nuevo. No hay migración
que deshacer ni dato que restaurar, así que revertir es seguro en cualquier
momento.

## Preguntas abiertas

- **Qué hace el admin cuando un perfil no le convence.** Hoy sólo puede marcar
  `evaluacion_aprobada`; no hay dónde escribir por qué. La ficha lo deja a la
  vista. Va a taller de descubrimiento.
- **Si una asociada debe poder abrir la ficha de sus candidatas.** El componente
  ya lo permitiría con `modo="revision"`; falta que exista el modelo de asignación,
  que está roto (`asesora_asignada_id` no existe) y va en el Sprint 3.
- **`estado_agencia` frente a `evaluacion_aprobada`.** Son dos campos que parecen
  decir lo mismo y no está claro cuál manda. Se muestran los dos y se pregunta.
