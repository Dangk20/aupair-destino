## MODIFIED Requirements

### Requirement: Un tablero muestra a todas las candidatas por etapa

El admin SHALL tener un tablero con una columna por etapa y una tarjeta por candidata, con su foto o inicial, su nombre, su score, su agencia y los días que lleva en la etapa; la tarjeta SHALL llevar a la ficha. Las salidas SHALL verse aparte. El admin SHALL poder arrastrar cualquier tarjeta a cualquier columna, y las de etapas de la agencia también SHALL moverse con una acción "Mover a". Entre etapas de la agencia, soltar SHALL moverla. Hacia una etapa calculada, soltar SHALL abrir la decisión que la produce (aprobar con agencia, No califica con motivo, revertir) o explicar por qué no aplica; nunca SHALL cambiar la etapa sin esa decisión.

#### Scenario: Ver el tablero
- **WHEN** el admin abre el tablero
- **THEN** ve cada candidata en la columna de su etapa

#### Scenario: Mover una tarjeta
- **WHEN** el admin arrastra una candidata de Visa a Completada
- **THEN** la candidata queda en Completada y el cambio queda en su historial

#### Scenario: Aprobar arrastrando
- **WHEN** el admin arrastra una candidata de En revisión a Evaluación de la agencia y elige la agencia
- **THEN** queda aprobada y enviada a esa agencia, igual que desde la ficha

#### Scenario: Etapa que marca la candidata
- **WHEN** el admin arrastra una candidata de Diligenciando a En revisión
- **THEN** el tablero explica que esa etapa la marca la candidata al enviar su perfil y no cambia nada
