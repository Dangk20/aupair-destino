## ADDED Requirements

### Requirement: Las notas de la ficha dicen quién las ve

La ficha de revisión SHALL presentar dos notas con su visibilidad explícita: "Presentación para la agencia", que ve la agencia, y "Notas internas", que sólo ve el equipo. NO SHALL presentar como interno un dato que vea la agencia.

#### Scenario: El admin escribe una nota interna

- **WHEN** el admin escribe en "Notas internas"
- **THEN** la nota no le llega ni a la candidata ni a la agencia

### Requirement: La ficha de revisión muestra la etapa, el score y la línea de tiempo

La ficha de revisión SHALL mostrar en su encabezado la etapa actual, la agencia si la tiene y el score, y SHALL incluir la línea de tiempo de la candidata.

#### Scenario: Abrir la ficha de una candidata en Visa

- **WHEN** el admin abre la ficha de una candidata en Visa
- **THEN** ve "Visa", su agencia, su score y su línea de tiempo
