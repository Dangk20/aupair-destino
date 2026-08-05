## MODIFIED Requirements

### Requirement: Los campos obligatorios del perfil se declaran en una fuente única

El sistema SHALL definir en un módulo único, compartido por el cliente, el servidor y el cálculo de progreso, qué campos del perfil son obligatorios en cada sección de la Parte 1 ("Cuéntanos de ti") y de la Parte 2 (perfil para la agencia), incluidos los campos que se vuelven obligatorios según la respuesta a otro campo.

Ese módulo SHALL ser además la única fuente de las **pantallas del personal**: las
secciones, los labels, la obligatoriedad y el cálculo de avance que ve el admin
salen de ahí y no de una lista propia. El módulo SHALL declarar también los campos
que sólo el personal diligencia o consulta, marcados como opcionales, de modo que
puedan mostrarse sin volverse exigibles para completar el perfil.

#### Scenario: Un campo condicional se vuelve obligatorio

- **WHEN** la candidata responde que sí le han negado una visa
- **THEN** el detalle de esa negación pasa a ser obligatorio para completar la sección

#### Scenario: Un campo condicional no aplica

- **WHEN** la candidata responde que no le han negado una visa
- **THEN** el detalle de esa negación no se exige y no bloquea el avance

#### Scenario: Coherencia entre progreso y validación

- **WHEN** una sección se muestra como completa en el indicador de progreso
- **THEN** esa misma sección pasa la validación al guardar, sin discrepancias entre ambos cálculos

#### Scenario: Coherencia entre lo que ve la candidata y lo que ve el personal

- **WHEN** se compara el avance del mismo perfil en la pantalla de la candidata y en la del admin
- **THEN** el porcentaje y el conteo de secciones completas coinciden exactamente
- **AND** una sección marcada como completa en una lo está también en la otra

#### Scenario: Un campo opcional no bloquea

- **WHEN** una candidata tiene sin diligenciar un campo declarado como opcional
- **THEN** su sección puede darse por completa y el perfil puede darse por terminado
- **AND** ese campo sigue mostrándose, vacío, en la ficha
