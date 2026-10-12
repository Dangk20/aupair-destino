## ADDED Requirements

### Requirement: Cada candidata está en una etapa de un recorrido único

El sistema SHALL ubicar a cada candidata en exactamente una de estas etapas: Diligenciando, En revisión, Con correcciones, Evaluación de la agencia, Elección de plan, Pago confirmado, Visa, Completada; o en una de dos salidas: No califica, No continúa. El vocabulario SHALL declararse en un único lugar y usarse en todas las vistas.

Las cuatro primeras SHALL calcularse de los datos, en este orden de precedencia: No califica si el equipo lo decidió; la etapa de la agencia si tiene una; Evaluación de la agencia si el equipo la aprobó; Con correcciones si tiene observaciones abiertas; En revisión si envió la Parte 1 (o la terminó antes de que existiera el envío); Diligenciando en otro caso.

#### Scenario: Candidata que envía la Parte 1

- **WHEN** una candidata en Diligenciando envía la Parte 1
- **THEN** pasa a En revisión

#### Scenario: El equipo le pide correcciones

- **WHEN** el admin escribe una observación a una candidata En revisión
- **THEN** pasa a Con correcciones, y vuelve a En revisión cuando ya no tiene observaciones abiertas

#### Scenario: El equipo la aprueba

- **WHEN** el admin aprueba a la candidata y elige la agencia
- **THEN** pasa a Evaluación de la agencia con esa agencia

### Requirement: La decisión del equipo son tres acciones

En la ficha, el admin SHALL decidir con tres acciones: "Aprobar y enviar a la agencia", "Pedir correcciones" (que lleva a las observaciones) y "No califica". Aprobar SHALL exigir la Parte 1 completa y una agencia; No califica SHALL exigir un motivo, que es interno: la candidata NO SHALL verlo. Una decisión SHALL poder revertirse, y revertir SHALL quedar en el historial.

#### Scenario: Aprobar sin la Parte 1 completa

- **WHEN** el admin intenta aprobar a una candidata con la Parte 1 incompleta
- **THEN** la aprobación se rechaza con lo que falta

#### Scenario: No califica sin motivo

- **WHEN** el admin marca No califica sin escribir el motivo
- **THEN** no se registra y se le pide el motivo

#### Scenario: La candidata no ve el motivo

- **WHEN** la candidata marcada No califica abre su línea de tiempo
- **THEN** ve que su proceso no continúa, sin el motivo interno

### Requirement: Una candidata aprobada tiene una agencia y su etapa con ella

Al aprobarla, el sistema SHALL relacionar a la candidata con una agencia (un usuario con rol agencia). Por ahora una candidata SHALL tener a lo sumo una agencia. Las etapas Evaluación de la agencia, Elección de plan, Pago confirmado, Visa, Completada y No continúa SHALL guardarse en esa relación, con la fecha y el autor de cada cambio. El admin SHALL poder moverlas a cualquiera de esas etapas.

#### Scenario: Mover a Pago confirmado

- **WHEN** el admin mueve a una candidata de Elección de plan a Pago confirmado
- **THEN** la etapa cambia y queda en el historial con la fecha y quién la movió

#### Scenario: Ver qué agencia la tiene

- **WHEN** se abre la ficha o la línea de tiempo de una candidata aprobada
- **THEN** se ve el nombre de su agencia

### Requirement: Cada hecho del recorrido queda en un historial con fecha

El sistema SHALL registrar, con fecha y autor: registro, envío de la Parte 1 y de la Parte 2, correcciones pedidas, aprobación (con agencia), No califica, reversión de una decisión y cada cambio de etapa con la agencia. Los hechos anteriores a este cambio que no tienen fecha SHALL entrar con la fecha de la migración, señalados como tales.

#### Scenario: Línea de tiempo de una candidata aprobada

- **WHEN** se abre la línea de tiempo de una candidata que se registró, envió su Parte 1, recibió correcciones y fue aprobada
- **THEN** se ven esos cuatro hechos en orden, cada uno con su fecha

### Requirement: Una sola línea de tiempo en todas las vistas de la candidata

La línea de tiempo SHALL ser un único componente que muestra las ocho etapas —las cumplidas, la actual y las que faltan— y los hechos del historial. La candidata SHALL verla en "Mi Destino" y en su perfil; el admin, en la ficha. La candidata NO SHALL ver detalles internos (el motivo de No califica, el autor).

`GET /api/dashboard/proceso` SHALL derivar sus pasos de las etapas, sin depender de tablas que no existen.

#### Scenario: La candidata en Mi Destino

- **WHEN** una candidata en Elección de plan abre "Mi Destino"
- **THEN** ve cumplidas las etapas anteriores, con sus fechas, Elección de plan como la actual y su agencia

#### Scenario: El admin en la ficha

- **WHEN** el admin abre la ficha de la misma candidata
- **THEN** ve la misma línea de tiempo, más el autor de cada hecho

### Requirement: El score es el porcentaje de la información diligenciada

El score SHALL calcularse solo: el porcentaje de los campos del perfil que le aplican a la candidata —obligatorios y opcionales; los condicionales sólo si su condición se cumple— diligenciados con un valor válido, más los 12 documentos del programa cargados. NO SHALL escribirse a mano.

#### Scenario: Perfil a la mitad

- **WHEN** una candidata tiene diligenciada la mitad de la información que le aplica
- **THEN** su score es 50%

### Requirement: Un tablero muestra a todas las candidatas por etapa

El admin SHALL tener un tablero con una columna por etapa y una tarjeta por candidata, con su foto o inicial, su nombre, su score, su agencia y los días que lleva en la etapa; la tarjeta SHALL llevar a la ficha. Las salidas SHALL verse aparte. Las tarjetas en etapas de la agencia SHALL poder moverse a otra etapa de la agencia arrastrándolas o con una acción "Mover a"; las etapas que se calculan NO SHALL moverse desde el tablero.

#### Scenario: Ver el tablero

- **WHEN** el admin abre el tablero
- **THEN** ve cada candidata en la columna de su etapa

#### Scenario: Mover una tarjeta

- **WHEN** el admin arrastra una candidata de Visa a Completada
- **THEN** la candidata queda en Completada y el cambio queda en su historial

#### Scenario: Intentar mover una etapa calculada

- **WHEN** el admin intenta mover una tarjeta de En revisión a Evaluación de la agencia
- **THEN** el tablero no lo permite: eso se decide en la ficha
