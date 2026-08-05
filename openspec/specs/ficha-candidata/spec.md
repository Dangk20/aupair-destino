# ficha-candidata Specification

## Purpose
TBD - created by archiving change perfil-unico-candidata. Update Purpose after archive.
## Requirements
### Requirement: La ficha de una candidata es una sola vista

El sistema SHALL presentar la información de una candidata en una única ficha,
con la misma estructura y la misma línea gráfica, sea quien sea que la mire: la
propia candidata en `/dashboard/perfil` o el personal de Destino Au Pair en
`/admin/perfiles/<id>`.

Lo que cambia entre una y otra es **qué se puede hacer**, no **cómo se ve**: quién
la mira determina las acciones disponibles y qué bloques adicionales aparecen,
nunca el diseño ni la organización de la información.

#### Scenario: La candidata abre su perfil terminado

- **WHEN** una candidata con el perfil completo abre `/dashboard/perfil`
- **THEN** ve su tarjeta de identidad —foto, nombre, lugar, edad y correo—,
  el estado de su evaluación, y una fila de pestañas con una por cada sección
  declarada más una de Documentos al final
- **AND** la sección activa se muestra en sólo lectura, con el label de cada campo
  y su valor
- **AND** cada sección ofrece un botón de editar que abre su formulario anclado a
  esa sección

#### Scenario: El admin abre el perfil de esa misma candidata

- **WHEN** un admin abre `/admin/perfiles/<id>` de esa candidata
- **THEN** ve **la misma ficha**: la misma tarjeta de identidad, el mismo estado
  de evaluación, las mismas pestañas en el mismo orden y los mismos valores
- **AND** cada sección ofrece el mismo botón de editar, que abre el formulario
  anclado a esa sección
- **AND** NO ve un asistente por pasos, ni un contador de "página N de M", ni un
  botón global de guardar

#### Scenario: El progreso es el mismo número para las dos

- **WHEN** se comparan el porcentaje de avance que ve la candidata y el que ve el
  admin sobre el mismo perfil
- **THEN** ambos son idénticos, porque los dos se derivan de la misma declaración
  de campos
- **AND** un perfil al que le faltan campos obligatorios NO se muestra como
  completo en ninguna de las dos vistas

#### Scenario: Perfil a medias

- **WHEN** se abre la ficha de una candidata que aún no ha terminado su perfil
- **THEN** además de las pestañas se muestra el recorrido de las secciones, con
  cuáles están completas y qué campos faltan en cada una
- **AND** ese recorrido se muestra igual a la candidata y al admin
- **AND** la pestaña de Documentos sigue alcanzable, porque la documentación de
  una candidata que aún no termina su perfil es justo lo que hay que revisar

### Requirement: Lo que la ficha muestra se deriva de una declaración única

El sistema SHALL derivar de `lib/campos-perfil.js` las secciones de la ficha, el
label de cada campo, cuáles son obligatorios y el cálculo de avance. Ninguna
pantalla puede declarar su propia lista de secciones, su propia lista de campos ni
su propia regla de "sección completa".

#### Scenario: Se añade un campo nuevo al perfil

- **WHEN** se declara un campo nuevo en una sección de `lib/campos-perfil.js`
- **THEN** ese campo aparece en el formulario de la candidata, en la ficha que ella
  ve y en la ficha que ve el admin, sin tocar ninguna de esas tres pantallas

#### Scenario: Ninguna pantalla mantiene su propia copia

- **WHEN** se revisan `app/dashboard/perfil/page.jsx` y
  `app/admin/perfiles/<id>/page.jsx`
- **THEN** ninguna de las dos contiene una lista de secciones, una lista de campos
  ni una función propia de cálculo de avance
- **AND** ninguna contiene un label de campo escrito a mano

#### Scenario: El listado dice el mismo porcentaje que la ficha

- **WHEN** se compara el avance de una candidata en el listado de
  `/admin/perfiles` con el de su ficha
- **THEN** los dos números coinciden, porque el listado también deriva su cálculo
  de la declaración única
- **AND** lo mismo vale para el listado que ve la agencia

#### Scenario: Los campos que sólo mostraba el admin siguen visibles

- **WHEN** se abre la ficha de una candidata que tiene valor en `religion`,
  `estado_civil`, `numero_pasaporte`, `carrera_graduada`, `tiene_visa_j1`,
  `fumadora`, `acepta_mascotas` o `video_presentacion_url`
- **THEN** esos valores se muestran en su sección correspondiente
- **AND** esos campos son opcionales: un perfil que los tenga vacíos sigue
  contando como completo si sus campos obligatorios lo están

### Requirement: La documentación forma parte de la ficha

El sistema SHALL incluir en la ficha una pestaña de Documentos, al final de la
fila de pestañas, que muestre cada documento requerido y su estado. La pestaña
refleja el módulo de documentos; no lo reemplaza.

#### Scenario: La candidata consulta sus documentos desde su ficha

- **WHEN** una candidata con acceso a documentos abre la pestaña Documentos de su
  ficha
- **THEN** ve la lista de documentos requeridos, cuáles ha cargado y cuáles no
- **AND** puede subir uno pendiente sin salir de la ficha
- **AND** un documento cuyo archivo se perdió del servidor se muestra como tal, y
  no como cargado

#### Scenario: El admin revisa documentos desde la ficha

- **WHEN** un admin abre la pestaña Documentos de la ficha de una candidata
- **THEN** ve los documentos que ella cargó, con su estado de revisión
- **AND** puede aprobar, rechazar y dejar una nota sobre cada uno
- **AND** puede abrir el archivo para revisarlo

#### Scenario: La candidata sin acceso a documentos

- **WHEN** una candidata sin el permiso de documentos abre la pestaña Documentos
- **THEN** se le comunica que esa sección se abre al completar el pago, con el
  mismo mensaje que ya usa el módulo de documentos
- **AND** no se filtra ningún dato de documentos en la respuesta

#### Scenario: El módulo de documentos sigue existiendo

- **WHEN** una candidata abre `/dashboard/documentos`
- **THEN** el módulo funciona como antes de este cambio

### Requirement: Los datos internos de valoración sólo los ve el personal

El sistema SHALL mantener los campos de valoración interna —`estado_agencia`,
`notas_agencia`, `score_dap`, `calificacion_dap`, `nota_dap`— y el control de
Estado admin en un bloque visible únicamente para el admin, y NO SHALL enviarlos
al navegador de la candidata.

#### Scenario: La candidata pide su propio perfil

- **WHEN** una candidata solicita `GET /api/dashboard/perfil`
- **THEN** la respuesta NO contiene `notas_agencia`, `score_dap`,
  `calificacion_dap` ni `nota_dap`
- **AND** sí contiene `evaluacion_aprobada`, que es lo que su ficha le muestra

#### Scenario: La ficha de la candidata no dibuja el bloque interno

- **WHEN** la candidata abre su ficha
- **THEN** no aparece el selector de Estado admin, ni las notas de agencia, ni
  ninguna calificación interna

#### Scenario: El admin sí lo ve

- **WHEN** un admin abre la ficha de una candidata
- **THEN** ve el bloque de valoración interna y puede cambiar el estado admin

### Requirement: El perfil que devuelve el admin no expone credenciales

El sistema SHALL excluir de `GET /api/admin/perfiles/<id>` las mismas columnas
sensibles que ya excluye la ruta de la candidata: el hash de la contraseña y los
testigos de recuperación.

#### Scenario: Un admin abre la ficha de una candidata

- **WHEN** un admin solicita `GET /api/admin/perfiles/<id>`
- **THEN** la respuesta NO contiene `password`, `reset_token` ni
  `reset_token_expiry`

#### Scenario: Candidata con recuperación de contraseña en curso

- **WHEN** un admin abre la ficha de una candidata que tiene un `reset_token`
  vigente
- **THEN** ese testigo no viaja al navegador, de forma que quien pueda leer la
  respuesta no pueda cambiarle la contraseña

