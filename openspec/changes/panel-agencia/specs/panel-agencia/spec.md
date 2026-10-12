## ADDED Requirements

### Requirement: La agencia ve sólo a sus candidatas

Una agencia SHALL ver únicamente a las candidatas que el equipo aprobó y le envió (las que tienen relación con ella en `candidata_agencia`). Toda ruta de la agencia SHALL verificarlo en el servidor; pedir a una candidata ajena SHALL responder 404.

#### Scenario: Candidata de otra agencia

- **WHEN** una agencia pide por URL la ficha de una candidata enviada a otra agencia
- **THEN** recibe 404 y no ve ningún dato

#### Scenario: Candidata sin aprobar

- **WHEN** una candidata todavía está En revisión
- **THEN** no aparece en el tablero de ninguna agencia

### Requirement: La agencia trabaja en el mismo tablero, con sus etapas

La agencia SHALL entrar a un tablero con el mismo componente que el del admin, con las columnas Evaluación de la agencia, Elección de plan, Pago confirmado, Visa, Completada y No continúa. SHALL poder mover a sus candidatas entre esas etapas arrastrando o desde el menú de la tarjeta, y cada movimiento SHALL quedar en el historial con la agencia como autora.

#### Scenario: La agencia confirma un pago

- **WHEN** la agencia mueve a una candidata de Elección de plan a Pago confirmado
- **THEN** la candidata queda en Pago confirmado y su línea de tiempo lo muestra, con la fecha

#### Scenario: Las salidas van al final del camino

- **WHEN** la agencia (o el admin) abre el tablero
- **THEN** «No continúa» (y «No califica», en el del admin) aparece como la última columna de la misma fila, después de «Completada»

### Requirement: El tablero también se ve como lista

El tablero SHALL ofrecer dos vistas de las mismas candidatas, «Tablero» y «Lista», con el mismo componente para el admin y la agencia. La lista SHALL mostrar por candidata: nombre, etapa, tiempo en la etapa, teléfono, correo, ciudad y porcentaje diligenciado (y la agencia, en la del admin), ordenada por etapa, con el mismo menú para moverla y un acceso a su ficha. La vista elegida SHALL recordarse en el navegador.

#### Scenario: La agencia cambia a la lista

- **WHEN** la agencia pulsa «Lista» en «Mis candidatas»
- **THEN** ve sus candidatas en filas, ordenadas por etapa, y puede moverlas desde el menú ⋯ de cada fila

### Requirement: La agencia abre la misma ficha, con sus permisos

La agencia SHALL ver la ficha de su candidata con el mismo componente que la candidata y el equipo: perfil, documentos, línea de tiempo y la presentación del equipo. SHALL poder mover la etapa y descargar el perfil (hoja de vida en PDF y documentos). NO SHALL poder editar el perfil, escribir observaciones, gestionar documentos, ni ver las notas internas o el motivo de una decisión.

#### Scenario: La agencia abre una ficha

- **WHEN** la agencia abre la ficha de una de sus candidatas
- **THEN** ve las secciones del perfil, los documentos (sin aprobar, rechazar ni quitar), la línea de tiempo y la presentación del equipo, sin botones de editar ni de observar

#### Scenario: Las notas internas no llegan a la agencia

- **WHEN** la agencia pide la ficha de su candidata
- **THEN** la respuesta no trae las notas internas del equipo ni el motivo de una decisión

#### Scenario: Descargar el perfil

- **WHEN** la agencia descarga el perfil de su candidata
- **THEN** recibe el ZIP con la hoja de vida en PDF y los documentos

### Requirement: El panel heredado de la agencia se retira

Las pantallas y rutas del panel heredado de la agencia SHALL retirarse. NO SHALL quedar en el menú ninguna entrada que lleve a una pantalla rota.

#### Scenario: Menú de la agencia

- **WHEN** la agencia entra a su panel
- **THEN** ve su tablero, y cada entrada del menú lleva a una pantalla que funciona
