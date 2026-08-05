## 1. Preparar el terreno

- [x] 1.1 `npm i pdfkit archiver` con versión fija, y comprobar que ninguna arrastra compilación nativa (`npm ls --omit=dev` y revisar que no aparezca `node-gyp`)
- [x] 1.2 Añadir `Poppins-Regular.ttf` y `Poppins-Bold.ttf` en `assets/fuentes/`, con su `OFL.txt`. Fuera de `public/`: no son recursos web, los lee el servidor
- [x] 1.3 Comprobar que `docker-compose.yml` y el `Dockerfile` copian `assets/` a la imagen. Si no, arreglarlo **antes** de escribir el generador: si no, funciona en local y falla en producción

      **No las copiaba.** La etapa de runtime sólo trae `public/`, `.next/` y
      `scripts/`; `assets/` se habría quedado fuera y el PDF habría reventado
      con ENOENT sólo en producción. Se resolvió por la vía nativa de Next,
      `outputFileTracingIncludes` en `next.config.mjs`, que además arrastra las
      métricas `.afm` de pdfkit. Verificado sobre el build: los tres `.ttf` y
      los `.afm` aparecen dentro de `.next/standalone/`.
- [x] 1.4 Declarar `GET /api/admin/perfiles/[id]/descargar` con nivel admin en `docs/rutas-y-acceso.md`. **Antes de escribir el handler**: las pruebas de humo fallan si encuentran una ruta sin nivel declarado

## 2. Un solo dueño para la aprobación

- [x] 2.1 Comprobar con `grep` quién envía hoy `evaluacion_aprobada` a `PUT /api/admin/perfiles/[id]`. Anotar aquí el resultado antes de tocar la ruta

      Un solo emisor: `guardarInterno()` de `app/admin/perfiles/[id]/page.jsx`,
      que este change retira. `app/api/dashboard/perfil/route.js` la nombra en
      su lista `BLOQUEADAS`, o sea que la candidata ya no podía tocarla.
- [x] 2.2 Añadir `evaluacion_aprobada` al conjunto `EXCLUIR` de `app/api/admin/perfiles/[id]/route.js`
- [x] 2.3 `PUT /api/admin/aprobar-evaluacion`: verificar en el servidor que el perfil está completo antes de aprobar, con `parteCompleta()` de `lib/campos-perfil.js` sobre la fila leída de la base. Hoy acepta aprobar cualquier perfil y la única defensa es que el botón esté apagado
- [x] 2.4 Verificar a mano que aprobar un perfil incompleto por la API devuelve error, aun con el botón deshabilitado en la interfaz

## 3. Aprobar desde la ficha

- [x] 3.1 En `app/admin/perfiles/[id]/page.jsx`, añadir el botón de aprobar junto a "Guardar" del bloque de valoración interna. Dice "Aprobar perfil" o "Quitar aprobación" según el estado, y llama sólo a `/api/admin/aprobar-evaluacion`
- [x] 3.2 Deshabilitar el botón cuando el perfil no esté completo, con `perfilCompleto()`, y explicar por qué en el `title`

      **Corregido durante la verificación:** deshabilitarlo sin más dejaba
      encerrada a la clienta. Juan Donato (id 7) tiene el perfil al 40% y está
      aprobado de antes; con el botón muerto no había forma de retirarle esa
      aprobación. Un perfil incompleto no se puede aprobar, pero sí se le puede
      QUITAR la aprobación — que es justo lo que el servidor ya permitía
      (`if (aprobada && !parteCompleta(...))`). La interfaz lo bloqueaba en las
      dos direcciones y ahora sólo en una.
- [x] 3.3 **Retirar el `<select>` "Evaluación del perfil"** de `BloqueInterno` y sacar `evaluacion_aprobada` del cuerpo que envía `guardarInterno()`
- [x] 3.4 Verificar a mano: aprobar, ver que el recuadro verde de la ficha cambia sin recargar, y que la candidata ve "Tu perfil fue aprobado" en el suyo
- [x] 3.5 Verificar a mano que guardar la valoración interna de una candidata ya aprobada **no** le quita la aprobación

## 4. El CV en PDF

- [x] 4.1 `lib/cv-candidata.js`: recibe el perfil y devuelve un `Buffer` con el PDF. Recorre `PARTE1` y `PARTE2` de `lib/campos-perfil.js` y usa `valorParaMostrar()` para cada valor. Ni una etiqueta escrita a mano
- [x] 4.2 Encabezado a dos columnas: foto, nombre, edad, ciudad y contacto a la izquierda; el contenido a la derecha. Paleta `lib/tema.js` (borgoña `#A0435F`) y Poppins
- [x] 4.3 La foto sale del data-URI de `foto_url`, dentro de un `try`: si el dato está corrupto —en producción llegó a quedar `data:img`— se dibuja el círculo con la inicial y el PDF se genera igual
- [x] 4.4 Omitir de las secciones los campos de tipo `imagen`: la foto ya está en el encabezado y volcar el data-URI como texto arruinaría el documento
- [x] 4.5 Los campos sin diligenciar se muestran señalados como tales, con el mismo criterio que la ficha. No se omiten en silencio
- [x] 4.6 Verificar que **no aparece** `score_dap`, `calificacion_dap`, `nota_dap` ni `notas_agencia` en ninguna página, buscando el texto dentro del PDF generado
- [x] 4.7 Verificar que **sí aparecen** las secciones de salud y de visas, que son parte del perfil que la agencia evalúa

## 5. El paquete comprimido

- [x] 5.1 `lib/paquete-perfil.js`: arma el ZIP en flujo con `archiver`. Dentro, `<nombre>-hoja-de-vida.pdf` y una carpeta `documentos/`
- [x] 5.2 Cada documento entra por su ruta en disco (`resolverRuta()` de `lib/almacenamiento-archivos.js`), nombrado por su `tipo_doc` y conservando la extensión. **No** por su columna `nombre`: en la base hay filas cuyo nombre es la cadena `"null"`

      **Hallazgo:** esas mismas filas se guardaron **sin extensión**, porque
      `guardarArchivo()` la toma del nombre original y `path.extname("null")`
      es vacío. Salían del ZIP como `cedula-de-identidad`, sin extensión, y así
      no las abre nadie. La extensión se busca ahora en la referencia y, si no
      está, en la columna `nombre`.
- [x] 5.3 Un documento cuyo archivo no exista no aborta el paquete: se omite y se anota en un `LEEME.txt` que sólo se incluye si faltó algo
- [x] 5.4 `app/api/admin/perfiles/[id]/descargar/route.js`: guard `requiereAdmin`, 404 si la candidata no existe, y devuelve el ZIP como `ReadableStream` con `Content-Disposition` y un nombre que identifique a la candidata

## 6. El listado

- [x] 6.1 **Retirar `botonAprobar`, `toggleAprobar()` y el estado `aprobando`** de `app/admin/perfiles/page.jsx`
- [x] 6.2 Añadir el botón de descargar, que abre la ruta nueva
- [x] 6.3 Dejar el orden de la fila en **editar · ver · descargar**, en las dos pestañas
- [x] 6.4 Comprobar con `grep` que no queda ninguna referencia a `aprobar-evaluacion` fuera de la ficha y de su propia ruta

## 7. Verificación y cierre

- [x] 7.1 `npm run build` en verde. (`npm run lint` sigue roto de antes: llama a `next lint`, retirado en Next 16 — no lo arregla este change)
- [x] 7.2 `node scripts/pruebas-humo.mjs` en verde, con la ruta nueva ya declarada en `docs/rutas-y-acceso.md`
- [x] 7.3 Comprobar el control de acceso de la descarga a mano: sin sesión → 401; como candidata, asociada y agencia → 403; como admin → el archivo
- [x] 7.4 Descargar el perfil de una candidata **con documentos** y abrir el ZIP: está el PDF, está la carpeta, los documentos se abren
- [x] 7.5 Descargar el de una candidata **sin ningún documento**: el ZIP se genera con el PDF dentro y no falla
- [x] 7.6 Descargar el de una candidata con **un archivo perdido** (dejar en la base un `documentos_usuario` que apunte a un archivo inexistente): la descarga se completa y el `LEEME.txt` dice cuál faltó
- [x] 7.7 Abrir el PDF junto a la ficha de la misma candidata y comprobar que las secciones, su orden, las etiquetas y los valores coinciden

      Coinciden. Verificado extrayendo el texto del PDF con `pdftotext` y
      mirando el render: están las quince secciones en el orden de la
      declaración, "Sin diligenciar" donde la ficha lo dice, y ninguna traza de
      `score_dap`, `calificacion_dap`, `nota_dap`, `notas_agencia`, `password`,
      `reset_token` ni del data-URI de la foto.

      **Hallazgo ajeno a este change:** el PDF de Dani Peña muestra
      "IngenierÃ­a, sÃ©ptimo semestre". No es del generador: la base guarda
      `C383C2AD`, que es `í` codificado dos veces en UTF-8. Son datos que entró
      el proveedor anterior con la conexión en el juego de caracteres
      equivocado, y **la ficha los muestra igual de mal**. Arreglarlo es una
      migración de datos, y este change no toca la base.
- [x] 7.8 Recorrido del listado: editar lleva al formulario, ver lleva a la ficha, descargar entrega el ZIP — desde **las dos** pestañas
- [ ] 7.9 Avisar a la clienta antes de desplegar: el botón de aprobar se movió al detalle de la candidata, y ahora hay descarga
- [x] 7.10 Desplegar con `bash deploy/desplegar-codigo.sh` — sin migraciones, este change no toca la base. Va después de todo lo anterior
- [x] 7.11 Verificar en producción con una candidata real: aprobar, quitar la aprobación y descargar el paquete
- [x] 7.12 Anotar en la bitácora del cronograma el adelanto del ítem 14 (exportar perfil) desde el Sprint 4, y las dos dependencias nuevas
