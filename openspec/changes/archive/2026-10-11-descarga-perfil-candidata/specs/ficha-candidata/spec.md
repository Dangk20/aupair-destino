## ADDED Requirements

### Requirement: Aprobar el perfil se decide desde la ficha

El sistema SHALL ofrecer la aprobación del perfil como una **acción propia dentro
de la ficha**, en el bloque de valoración interna, junto a la acción de guardar.
La acción SHALL declarar qué va a hacer —aprobar o quitar la aprobación— y SHALL
surtir efecto por sí sola, sin arrastrar los demás campos del bloque.

El sistema NO SHALL permitir aprobar un perfil que no esté completo.

La aprobación SHALL tener un único dueño en el servidor: la ruta de aprobación.
Ninguna otra ruta SHALL escribir `evaluacion_aprobada`.

#### Scenario: El admin aprueba desde la ficha

- **WHEN** un admin abre la ficha de una candidata con el perfil completo y sin
  aprobar, y pulsa la acción de aprobar
- **THEN** el perfil queda aprobado
- **AND** la ficha lo refleja de inmediato, sin recargar
- **AND** los demás campos del bloque de valoración interna quedan como estaban

#### Scenario: El admin quita la aprobación

- **WHEN** un admin abre la ficha de una candidata ya aprobada y pulsa la acción
- **THEN** la aprobación se retira
- **AND** la ficha vuelve a mostrar el perfil como en revisión

#### Scenario: Perfil incompleto

- **WHEN** un admin abre la ficha de una candidata a la que le faltan campos
  obligatorios
- **THEN** la acción de aprobar no está disponible y explica por qué

#### Scenario: La candidata ve el resultado

- **WHEN** un admin aprueba el perfil de una candidata y ella abre el suyo
- **THEN** ve que su perfil fue aprobado

#### Scenario: Guardar la valoración no cambia la aprobación

- **WHEN** un admin edita la nota interna de una candidata aprobada y guarda el
  bloque de valoración
- **THEN** la aprobación no cambia

### Requirement: El listado de candidatas ofrece editar, ver y descargar

La fila de cada candidata en el listado SHALL ofrecer, en este orden, **editar**,
**ver** y **descargar**. El listado NO SHALL ofrecer la aprobación: esa decisión
se toma en la ficha, que es donde está la información para tomarla.

#### Scenario: Las acciones de una fila

- **WHEN** un admin abre `/admin/perfiles`
- **THEN** cada fila ofrece editar, ver y descargar, en ese orden
- **AND** ninguna fila ofrece aprobar

#### Scenario: Editar lleva al formulario

- **WHEN** un admin pulsa editar en una fila
- **THEN** llega al formulario de edición de esa candidata

#### Scenario: Ver lleva a la ficha

- **WHEN** un admin pulsa ver en una fila
- **THEN** llega a la ficha de esa candidata

#### Scenario: Las dos pestañas del listado llevan al mismo sitio

- **WHEN** un admin usa ver o editar desde cualquiera de las dos pestañas del
  listado
- **THEN** llega a la ficha única, y no a una pantalla que no existe

## MODIFIED Requirements

### Requirement: Los datos internos de valoración sólo los ve el personal

El sistema SHALL mantener los campos de valoración interna —`estado_agencia`,
`notas_agencia`, `score_dap`, `calificacion_dap`, `nota_dap`— y el control de
Estado admin en un bloque visible únicamente para el admin, y NO SHALL enviarlos
al navegador de la candidata.

La aprobación del perfil NO SHALL ser uno de esos campos: es una acción con su
propio control, junto a guardar, y no una opción más dentro del bloque.

#### Scenario: La candidata pide su propio perfil

- **WHEN** una candidata solicita `GET /api/dashboard/perfil`
- **THEN** la respuesta NO contiene `notas_agencia`, `score_dap`,
  `calificacion_dap` ni `nota_dap`
- **AND** sí contiene `evaluacion_aprobada`, que es lo que su ficha le muestra

#### Scenario: La ficha de la candidata no dibuja el bloque interno

- **WHEN** la candidata abre su ficha
- **THEN** no aparece el selector de Estado admin, ni las notas de agencia, ni
  ninguna calificación interna, ni la acción de aprobar

#### Scenario: El admin sí lo ve

- **WHEN** un admin abre la ficha de una candidata
- **THEN** ve el bloque de valoración interna y puede cambiar el estado admin

#### Scenario: La aprobación no es un campo del bloque

- **WHEN** un admin abre el bloque de valoración interna
- **THEN** no hay ningún selector que cambie la aprobación del perfil
- **AND** la aprobación se decide con su propia acción, junto a guardar
