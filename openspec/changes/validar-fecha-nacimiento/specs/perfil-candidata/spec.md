## ADDED Requirements

### Requirement: Un campo del perfil puede exigir una forma válida, no sólo estar lleno

El sistema SHALL permitir que un campo del perfil declare, junto a su obligatoriedad, **qué valores acepta**. Un campo con un valor que incumple esa regla SHALL contar como no diligenciado a efectos de dar una sección o el perfil por completos, y SHALL señalarse con un mensaje que explique qué se espera.

La regla SHALL declararse en el mismo sitio que los campos obligatorios, de modo que el formulario, el cálculo de progreso y la validación del servidor la apliquen por igual.

#### Scenario: Campo lleno con un valor que la regla rechaza

- **WHEN** una candidata diligencia un campo con un valor que su regla no acepta
- **THEN** el sistema lo señala con el motivo
- **AND** no la deja avanzar a la sección siguiente
- **AND** la sección no cuenta como completa

#### Scenario: El servidor aplica la misma regla

- **WHEN** llega una petición que guarda un valor que la regla rechaza
- **THEN** el servidor no da el perfil por completo

### Requirement: La fecha de nacimiento tiene que ser posible y de una candidata en edad del programa

El sistema NO SHALL aceptar como fecha de nacimiento una fecha futura, ni una que corresponda a una persona menor de la edad mínima del programa, ni una tan antigua que no pueda ser real.

La edad mínima SHALL estar declarada en un único lugar del código.

#### Scenario: Fecha en el futuro

- **WHEN** una candidata indica una fecha de nacimiento posterior a hoy
- **THEN** el sistema la rechaza indicando que la fecha no puede estar en el futuro

#### Scenario: Menor de la edad mínima

- **WHEN** la fecha indicada corresponde a una persona menor que la edad mínima del programa
- **THEN** el sistema la rechaza indicando cuál es la edad mínima

#### Scenario: Fecha válida

- **WHEN** la fecha corresponde a una persona de la edad mínima o más
- **THEN** el sistema la acepta

#### Scenario: Perfil ya guardado con una fecha imposible

- **WHEN** un perfil guardado antes de esta regla tiene una fecha que ahora se rechaza
- **THEN** deja de figurar como completo
- **AND** la candidata ve qué corregir al abrir esa sección
