## 1. Una sola declaración de campos

- [x] 1.1 Medir el punto de partida: correr `node scripts/medir-perfiles-incompletos.mjs` y anotar aquí el avance de cada candidata **antes** de tocar nada. Es la referencia contra la que se comprueba que añadir campos no movió el porcentaje de nadie

      Base local, 2026-08-04 (8 candidatas, 1 completa):

      | id | nombre | parte1 | parte2 | faltan |
      |---|---|---|---|---|
      | 4 | prueba destino | 0% | 0% | 49 |
      | 6 | Juan Donato | 100% | 78% | 4 |
      | 7 | Juan Donato | 67% | 22% | 17 |
      | 9 | Toolsi isabel Giraldo saenz | 0% | 0% | 50 |
      | 11 | Yulieth Chavarro | 0% | 0% | 50 |
      | 13 | Sofia Ortiz | 0% | 0% | 50 |
      | 14 | Laura Recorrido | 100% | 78% | 3 |
      | 15 | Dani Peña | 100% | 100% | 0 |

- [x] 1.2 Declarar en `lib/campos-perfil.js`, con `req: false`, los ocho campos que hoy sólo existen en las pantallas del admin: `religion`, `estado_civil`, `numero_pasaporte`, `carrera_graduada`, `tiene_visa_j1`, `fumadora`, `acepta_mascotas`, `video_presentacion_url` — cada uno en la sección que le corresponde

      **Hallazgo: no son ocho, son dieciocho.** Al cruzar los `name=` de los dos
      formularios de la candidata contra lo declarado en `campos-perfil.js`
      aparecieron diez campos más que **ella misma diligencia** y que su ficha
      nunca le muestra, porque no estaban declarados: `pais_destino`,
      `fecha_vencimiento_pasaporte`, `numero_ds2019`, `numero_sponsor`,
      `referencia_1_relacion`, `referencia_1_telefono`, `referencia_2_nombre`,
      `referencia_2_relacion`, `referencia_2_email`, `referencia_2_telefono`.
      Dejarlos fuera habría hecho que el admin perdiera campos que hoy sí puede
      editar (tarea 5.4), así que se declaran los dieciocho.

      La marca de opcional se implementa como `requeridoSi: OPCIONAL`, con
      `OPCIONAL = () => false`: reutiliza la maquinaria condicional que ya
      existe en vez de añadir una segunda forma de decir "no es obligatorio".

- [x] 1.3 Comprobar contra la base que las ocho columnas existen en `usuarios` y con qué tipo (`docker exec dap-mysql mysql … DESCRIBE usuarios`). Si alguna no existe, no se declara: se anota aquí como hallazgo

      Las dieciocho existen. **Hallazgo aparte: `estado_perfil` NO existe.** Es
      la columna contra la que escribe el selector "Estado admin" del hero de
      `/admin/perfiles/[id]`. Como `PUT /api/admin/perfiles/[id]` descarta las
      claves que no son columnas, ese selector nunca ha guardado nada: la
      clienta lo mueve, ve "✓ Guardado correctamente" y al recargar vuelve a
      "Pendiente". El bloque interno de la ficha usa `estado_agencia`, que sí
      existe (`varchar(50)`, por defecto "En progreso").

- [x] 1.4 Volver a correr la medición y verificar que **el avance de cada candidata es idéntico** al de 1.1. Si se movió, el campo entró como obligatorio por error

      Idéntico fila a fila: mismos porcentajes, mismos faltantes, misma única
      candidata completa. Los dieciocho campos entraron sin exigirse.
- [x] 1.5 Mover `NUNCA_SE_DEVUELVEN` a `lib/perfil.js`, separada en dos listas: la que se oculta a todos (`password`, `reset_token`, `reset_token_expiry`) y la que se oculta sólo a la candidata (`score_dap`, `calificacion_dap`, `nota_dap`, `notas_agencia`)
- [x] 1.6 Mover `DOCS_REQUERIDOS` de `app/api/dashboard/documentos/route.js` a `lib/documentos.js` y actualizar a quien lo importe

## 2. Cerrar la fuga de la ruta del admin

- [x] 2.1 `GET /api/admin/perfiles/[id]`: sustituir `delete u.password` por el filtro de `lib/perfil.js`, ocultando siempre credenciales y testigos de recuperación
- [x] 2.2 Verificar a mano: entrar como admin, abrir la ficha de una candidata **que tenga `reset_token` en la base**, y comprobar en la pestaña de red que la respuesta no trae `password`, `reset_token` ni `reset_token_expiry`
- [x] 2.3 Comprobar que la respuesta **sí** sigue trayendo `score_dap`, `calificacion_dap`, `nota_dap` y `notas_agencia`, que el admin necesita

## 3. La ficha compartida

- [x] 3.1 `components/perfil/FichaCandidata.jsx`: recibe `perfil`, `usuario`, `modo` y las rutas de edición; no hace `fetch`. Sale de mover lo que hoy vive en `app/dashboard/perfil/page.jsx` — tarjeta de identidad, estado de evaluación, recorrido de secciones y pestañas de sólo lectura
- [x] 3.2 En `modo="revision"`, añadir el bloque de valoración interna: `estado_agencia`, `notas_agencia`, `score_dap` y el selector de Estado admin. En `modo="propio"` ese bloque no se dibuja
- [x] 3.3 Reescribir `app/dashboard/perfil/page.jsx` para que sólo traiga los datos y monte la ficha en `modo="propio"`
- [x] 3.4 Verificar que la candidata ve **exactamente lo mismo que antes**: comparar contra captura, con perfil completo y con perfil a medias

## 4. La pestaña de Documentos

- [x] 4.1 `components/perfil/PestanaDocumentos.jsx`, con los dos modos: `"propio"` ofrece subir y quitar; `"revision"`, aprobar, rechazar y anotar. La lista de requeridos y el criterio de archivo perdido son los mismos en ambos
- [x] 4.2 Añadirla como última pestaña de la fila en `FichaCandidata`
- [x] 4.3 En `modo="propio"` sin permiso de documentos, mostrar el mismo aviso que ya usa el módulo, y no pedir los documentos al servidor
- [x] 4.4 Verificar a mano con la candidata: subir un documento desde la ficha, verlo aparecer, quitarlo. Y que `/dashboard/documentos` sigue funcionando igual

      La pestaña se recorrió en el navegador como candidata (lista de los doce
      requeridos, estados, avance 1/8). El ciclo de subir → aparecer → quitar se
      ejercitó contra la misma ruta que llama el modal
      (`POST` y `DELETE /api/dashboard/documentos`), porque el autocompletado de
      Chrome impedía completar el formulario de ingreso de forma fiable. El
      módulo `/dashboard/documentos` sigue devolviendo sus doce requeridos.
- [x] 4.5 Verificar a mano con el admin: aprobar un documento, rechazar otro, dejar una nota, abrir un archivo
- [x] 4.6 Verificar el caso del archivo perdido: dejar en la base un `documentos_usuario` cuyo archivo no exista en `UPLOADS_DIR` y comprobar que las dos vistas lo muestran como no disponible y no lo cuentan como cargado

      Con una fila `pasaporte` apuntando a un archivo inexistente: la ficha lo
      muestra como "Archivo no disponible" con su aviso, sin el botón de abrir,
      y el contador se queda en 1/8 — no lo cuenta. Al volver a subirlo, la fila
      se reemplaza y pasa a disponible.

      **Hallazgo menor, corregido:** hay filas cuyo `nombre` es la CADENA
      `"null"`, de una carga antigua. La pestaña pintaba "✓ null" al lado del
      documento. `nombreArchivo()` en `PestanaDocumentos.jsx` las descarta.

## 5. La ficha en el panel del admin

- [x] 5.1 Reescribir `app/admin/perfiles/[id]/page.jsx` para que traiga el perfil y los documentos y monte la ficha en `modo="revision"`
- [x] 5.2 `app/admin/perfiles/[id]/editar/page.jsx`: un solo formulario para las 15 secciones, generado desde `campos-perfil.js`, que guarda contra `PUT /api/admin/perfiles/[id]` y acepta `?seccion=<id>` para abrir en la sección pedida

      Acepta `?parte=<n>&seccion=<id>`: los ids de sección se repiten entre
      partes, así que sin la parte el lápiz de "Información personal" de la
      Parte 2 abriría la de la Parte 1.

      Para GENERARLO hubo que declarar en `campos-perfil.js` también `tipo` y
      `opciones` de cada campo. Sin ellos el formulario del admin habría sido
      todo texto libre, y los valores importan: `requeridoSi: siEs("visa_negada",
      "Si")` deja de dispararse si alguien escribe "Sí" a mano.

      **Hallazgo, corregido:** la base guarda valores que ninguna lista declara
      —`"Si"` donde las opciones dicen `"Sí"`, `"Catolica"` sin tilde, `"No"`
      donde se ofrece `"No, aún no"`—, de versiones anteriores del formulario.
      El `select` los pintaba en blanco y parecían sin diligenciar. `opcionesCon()`
      añade el valor guardado a la lista, marcado, para que se vea y se pueda
      normalizar.
- [x] 5.3 Conectar el lápiz de cada sección de la ficha a ese formulario, anclado a la sección
- [x] 5.4 Comprobar que el admin conserva todo lo que podía hacer: editar cualquier campo de Parte 1, editar cualquier campo de Parte 2, cambiar el estado admin, y aprobar/rechazar documentos
- [x] 5.5 Declarar la ruta nueva en `docs/rutas-y-acceso.md` **antes** de escribir su handler si hiciera falta alguno; si no hay ruta de API nueva, dejarlo dicho aquí

      **No hay ninguna ruta de API nueva.** `/admin/perfiles/[id]/editar` es una
      página; reutiliza `GET`/`PUT /api/admin/perfiles/[id]`, que ya estaban
      declaradas. Las pruebas de humo siguen cubriendo las 148 rutas del
      inventario sin cambios.
- [x] 5.6 Comparar pantalla contra pantalla: abrir la misma candidata como ella y como admin, y verificar que las pestañas, el orden, los valores y el porcentaje coinciden

## 6. Retirar lo que queda muerto

- [x] 6.1 Eliminar `app/admin/perfiles/[id]/agencia/page.jsx` (709 líneas) con su `SECCIONES` de diez entradas, su `seccionCompleta()` de la mitad de los campos y su `calcProgresoAgencia()`
- [x] 6.2 Eliminar de `app/admin/perfiles/[id]/page.jsx` la `SECCIONES` propia, `CAMPOS_PROGRESO` y `calcProgreso()`
- [x] 6.3 Retirar el botón "Perfil agencia" y cualquier enlace a `/admin/perfiles/[id]/agencia`; comprobar con `grep` que no queda ninguna referencia
- [x] 6.4 Comprobar que no queda en el repositorio ninguna otra lista de secciones de perfil fuera de `lib/campos-perfil.js`

      **Aparecieron dos copias más de las previstas**, en las rutas de listado:
      `app/api/admin/perfiles/route.js` y `app/api/agencia/perfiles/route.js`
      llevaban cada una su `CAMPOS_EVAL` de dieciséis columnas y su
      `SECCIONES_AGENCIA` de diez, con la misma regla de "media sección llena
      cuenta como completa". Por eso el listado podía decir 100% de una
      candidata cuya ficha decía 78%. Las dos pasan a `progresoParte()`.

      En la de agencia hubo que cambiar la lista blanca de columnas del `SELECT`
      por `u.*`: con la lista blanca faltaba la mitad de los campos declarados y
      toda candidata habría parecido incompleta. Lo que no debe salir lo quita
      `perfilPublicable()`, que además cierra ahí la misma fuga de
      `reset_token` — ese `SELECT` no la tenía, pero el del admin sí, y devolvía
      los testigos de TODAS las candidatas en una sola respuesta.

## 7. Verificación y cierre

- [x] 7.1 `npm run build` en verde. (`npm run lint` sigue roto de antes: llama a `next lint`, retirado en Next 16, y además falta `typescript` en las dependencias — no lo arregla este change)
- [x] 7.2 `node scripts/pruebas-humo.mjs` en verde, con las rutas nuevas declaradas en `docs/rutas-y-acceso.md`
- [x] 7.3 Recorrido manual como candidata: perfil a medias → ver qué falta, completar una sección desde el lápiz, volver a la ficha y ver la sección completa
- [x] 7.4 Recorrido manual como admin: abrir una candidata, recorrer las 15 pestañas más Documentos, editar un campo de Parte 1 y otro de Parte 2, cambiar el estado admin
- [x] 7.5 Volver a medir el avance de los perfiles y comprobar que coincide con 1.1

      Coincide, salvo Laura Recorrido (id 14), que pasó de 78% a 89% en la
      Parte 2 **porque se editó a propósito desde el formulario nuevo** para
      comprobar que el cambio llega a la fuente única. No es efecto de declarar
      los campos opcionales: eso se comprobó en 1.4, antes de tocar dato alguno.
- [x] 7.6 Anotar qué perfiles pasan de "completos" a "incompletos" al unificar el cálculo — **es información para la clienta**, no una regresión

      Ninguna candidata cambia de estado por este change: el criterio ya era el
      de `campos-perfil.js` desde el Sprint 0.0. Lo que cambia es **el número
      que la clienta ve**, y baja en dos sitios:

      - En la **ficha**: el asistente calculaba sobre dieciséis columnas y
        marcaba "100% completado" a candidatas con secciones vacías.
      - En el **listado de candidatas** y en el de la **agencia**, por la regla
        de media sección.

      Sobre la base local, con el criterio único: de 8 candidatas sólo 1 está
      completa. Es la cifra real, y es la que hay que anticiparle.

## 8. Cambio pedido durante la implementación

- [x] 8.1 El recorrido de secciones alargaba mucho la ficha de una candidata a
      medias. Pasa a ser una pestaña propia, **Progreso**, primera de la fila y
      visible **sólo mientras el perfil esté incompleto**; con el perfil
      terminado no existe y la ficha abre en Información personal. La barra de
      "Perfil incompleto · N%" se queda fuera de las pestañas: es el titular del
      estado, no un contenido que haya que ir a buscar
- [x] 8.2 Verificado en el navegador con los dos casos: Laura (93%, con pestaña
      Progreso activa por defecto) y Dani (100%, sin pestaña Progreso, abre en
      Información personal)
- [ ] 7.7 Avisar a la clienta antes de desplegar: la pantalla que usa a diario para revisar candidatas cambia de forma, y algunos porcentajes van a bajar porque pasan a ser ciertos
- [ ] 7.8 Desplegar con `bash deploy/desplegar-codigo.sh` — sin migraciones, este change no toca la base
- [ ] 7.9 Verificar en producción y actualizar `docs/rutas-y-acceso.md` y la bitácora del cronograma
