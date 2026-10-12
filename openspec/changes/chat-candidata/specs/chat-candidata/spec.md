## ADDED Requirements

### Requirement: Cada candidata tiene una conversación con el equipo y otra con su agencia

Cada candidata SHALL tener a lo sumo una conversación con el equipo de Destino Au Pair y a lo sumo una con cada agencia. La conversación con la agencia SHALL existir sólo si la agencia tiene a la candidata en `candidata_agencia`. Pueden escribir en ella la candidata y la agencia, y el admin una vez que entró. La candidata SHALL poder escribir al equipo en cualquier momento, con el permiso de mensajes.

#### Scenario: La agencia inicia la conversación

- **WHEN** la agencia abre la vista rápida de una candidata suya sin conversación y pulsa «Iniciar conversación»
- **THEN** se crea la conversación y la agencia puede escribir el primer mensaje

#### Scenario: Una agencia ajena no puede leer ni escribir

- **WHEN** una agencia pide la conversación de una candidata que no está en su `candidata_agencia`
- **THEN** recibe 404 y no se crea nada

#### Scenario: La candidata no inicia la conversación con la agencia

- **WHEN** la candidata tiene agencia pero la agencia no ha iniciado la conversación
- **THEN** en «Mensajes» ve sólo la conversación con el equipo

### Requirement: El admin supervisa las conversaciones de la agencia

El admin SHALL poder leer cualquier conversación sin que eso quede registrado. Para escribir en una conversación de agencia SHALL pulsar «Entrar a la conversación». Al entrar SHALL quedar en el hilo un evento visible para todos los participantes: «<nombre> del equipo de Destino Au Pair entró a la conversación». El evento SHALL registrarse una sola vez por admin y conversación. En la conversación con el equipo, el admin SHALL escribir directamente.

#### Scenario: El admin entra a una conversación de agencia

- **WHEN** el admin abre la conversación entre una agencia y una candidata y pulsa «Entrar a la conversación»
- **THEN** el hilo muestra, a la agencia, a la candidata y al admin, que entró, y se habilita su campo para escribir

#### Scenario: El admin solo lee

- **WHEN** el admin abre una conversación de agencia y no pulsa «Entrar»
- **THEN** no aparece ningún evento en el hilo y no puede escribir

### Requirement: Vista rápida de la candidata

Al hacer clic en una tarjeta del tablero o en el ícono de burbuja de chat de una fila de la lista, SHALL abrirse una vista rápida, con el mismo componente para la agencia y el admin:

- **A la izquierda, el chat:** la conversación o, si no existe, el botón «Iniciar conversación».
- **A la derecha, los datos generales básicos:** foto, nombre, etapa, tiempo en la etapa, porcentaje diligenciado, edad, ciudad, teléfono, correo y agencia.
- **Arriba, «Ver perfil»:** lleva a la ficha completa del rol.

En la lista, cada fila SHALL tener dos íconos: un ojo, que lleva directo al perfil completo, y una burbuja de chat, que abre la vista rápida.

El admin SHALL poder cambiar entre la conversación con el equipo y la de la agencia. La agencia SHALL ver sólo la suya.

#### Scenario: La agencia abre a una candidata desde el tablero

- **WHEN** la agencia hace clic en la tarjeta de una candidata
- **THEN** se abre la vista rápida con el chat y los datos básicos, y «Ver perfil» lleva a `/agencia/candidatas/<id>`

#### Scenario: La vista rápida no expone datos internos

- **WHEN** la agencia abre la vista rápida
- **THEN** la respuesta no trae notas internas, el motivo de una decisión ni el score del equipo

### Requirement: Mensajes sin leer

Cada participante SHALL ver qué conversaciones tienen mensajes que no ha leído:

- En el tablero y en la lista, con un punto en la candidata.
- En «Mensajes», con un conteo.

Abrir la conversación SHALL marcarla como leída para quien la abre, y solo para esa persona. Mientras la conversación esté abierta, los mensajes nuevos SHALL aparecer sin recargar la página, en pocos segundos.

#### Scenario: La agencia ve un mensaje nuevo de la candidata

- **WHEN** la candidata escribe en la conversación con su agencia
- **THEN** la tarjeta de la candidata en el tablero de la agencia muestra el punto de no leído, y desaparece cuando la agencia abre la conversación

### Requirement: Los mensajes anteriores se conservan

La migración SHALL llevar cada fila de `mensajes` a la conversación de la candidata con el equipo, con su fecha, su autor y si estaba leída. No SHALL borrar la tabla `mensajes`.

#### Scenario: Un mensaje viejo sigue visible

- **WHEN** se aplica la migración y el admin abre la conversación con el equipo de una candidata que tenía mensajes
- **THEN** los ve en orden y con su fecha original
