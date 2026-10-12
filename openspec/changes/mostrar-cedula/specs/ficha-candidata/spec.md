## ADDED Requirements

### Requirement: La ficha muestra las fotos de la cédula

En la sección "Información personal" de la Parte 1, la ficha SHALL mostrar, debajo de sus campos, las fotos de la cédula de la candidata, lado frontal y lado posterior, tanto a la candidata como al personal que la revisa. Una foto que falte SHALL señalarse como "Sin cargar", no esconderse. Cada foto SHALL poder verse en tamaño completo.

#### Scenario: Candidata con las dos fotos cargadas

- **WHEN** la candidata o el admin abren la sección "Información personal" de una candidata que subió frente y reverso
- **THEN** ven el bloque "Cédula" con las dos fotos, rotuladas como lado frontal y lado posterior

#### Scenario: Falta una de las fotos

- **WHEN** la candidata sólo subió el lado frontal
- **THEN** el lado posterior aparece como "Sin cargar"

#### Scenario: Ver una foto en grande

- **WHEN** se hace clic sobre una de las fotos
- **THEN** se abre en tamaño completo
