## MODIFIED Requirements

### Requirement: La fecha de nacimiento tiene que ser posible y de una candidata en edad del programa

El sistema NO SHALL aceptar como fecha de nacimiento una fecha futura, ni una que corresponda a una persona menor de la edad mínima del programa (18 años), ni una tan antigua que no pueda ser real.

El sistema NO SHALL aceptar una fecha que corresponda a una persona mayor de la edad máxima del programa (27 años) **en la fecha en que se registró**. Este tope SHALL aplicarse sólo a las cuentas creadas desde que entró en vigor; las cuentas anteriores conservan únicamente la edad mínima.

La edad mínima, la edad máxima y la fecha desde la que rige el tope SHALL estar declaradas en un único lugar del código.

#### Scenario: Fecha en el futuro

- **WHEN** una candidata indica una fecha de nacimiento posterior a hoy
- **THEN** el sistema la rechaza indicando que la fecha no puede estar en el futuro

#### Scenario: Menor de la edad mínima

- **WHEN** la fecha indicada corresponde a una persona menor que la edad mínima del programa
- **THEN** el sistema la rechaza indicando cuál es la edad mínima

#### Scenario: Cuenta nueva con más de la edad máxima

- **WHEN** una candidata registrada después de la entrada en vigor del tope cambia su fecha de nacimiento a una que le daba más de 27 años al registrarse
- **THEN** el sistema la rechaza indicando el rango del programa

#### Scenario: Cuenta nueva que cumple 28 durante el proceso

- **WHEN** una candidata se registró con 27 años y hoy ya tiene 28
- **THEN** su fecha de nacimiento sigue siendo válida y su perfil no retrocede

#### Scenario: Cuenta anterior al tope

- **WHEN** una candidata registrada antes de la entrada en vigor del tope tiene hoy más de 27 años
- **THEN** su fecha de nacimiento sigue siendo válida y su perfil no retrocede

#### Scenario: Fecha válida

- **WHEN** la fecha corresponde a una persona dentro del rango que le aplica
- **THEN** el sistema la acepta

#### Scenario: Perfil ya guardado con una fecha imposible

- **WHEN** un perfil guardado antes de esta regla tiene una fecha que ahora se rechaza
- **THEN** deja de figurar como completo
- **AND** la candidata ve qué corregir al abrir esa sección

## ADDED Requirements

### Requirement: Ninguna ruta guarda una fecha de nacimiento inválida

Toda ruta que escriba `fecha_nacimiento` —el perfil de la candidata, su pantalla de configuración y la edición del perfil desde el admin— SHALL aplicar la regla de la fecha de nacimiento y, si el valor no la cumple, SHALL responder 400 con el motivo y NO SHALL guardar ningún dato de esa petición.

#### Scenario: Fecha imposible desde Configuración

- **WHEN** la candidata cambia su fecha de nacimiento en `/dashboard/configuracion` por una que le da 15 años
- **THEN** la pantalla muestra el motivo y la fecha guardada no cambia

#### Scenario: Fecha imposible desde la edición del admin

- **WHEN** el admin edita el perfil de una candidata y guarda una fecha en el futuro
- **THEN** el guardado se rechaza con el motivo y la fecha guardada no cambia

#### Scenario: Petición directa al perfil con fecha inválida

- **WHEN** llega a `PUT /api/dashboard/perfil` un cuerpo con una fecha de nacimiento que la regla rechaza
- **THEN** el servidor responde 400 indicando el campo y el motivo
- **AND** no guarda ningún campo de esa petición

### Requirement: Una parte con valores inválidos no cuenta como completa en el servidor

El servidor SHALL considerar completa una parte del perfil sólo si cada una de sus secciones está completa con el mismo criterio que usa el formulario: sin obligatorios vacíos **y sin valores que incumplan su regla**. Ese criterio SHALL gobernar `perfil_completo`, el progreso de la Parte 2 y la aprobación del perfil por el admin.

#### Scenario: Aprobar un perfil con la fecha inválida

- **WHEN** el admin intenta aprobar un perfil cuya fecha de nacimiento incumple la regla
- **THEN** la aprobación se rechaza indicando qué hay que corregir

#### Scenario: Recalcular al guardar

- **WHEN** se guarda un perfil cuya Parte 1 tiene todos los campos llenos pero uno con un valor que su regla rechaza
- **THEN** `perfil_completo` queda en 0

### Requirement: Al terminar cada parte del perfil, la candidata sabe cuál es su siguiente paso

Al pulsar "Finalizar" en la última sección de la Parte 1 o de la Parte 2, y una vez guardado, el sistema SHALL mostrar un aviso que le pregunte si quiere cargar sus documentos ahora, con un acceso directo al módulo de documentos. Al terminar la Parte 1, si la Parte 2 está incompleta, el aviso SHALL ofrecer también continuar con la Parte 2. El aviso SHALL dejar elegir hacerlo más tarde, que lleva a su perfil.

El acceso a documentos SHALL ofrecerse sólo si a la candidata le falta algún documento obligatorio y tiene habilitado el módulo de documentos. Si no hay nada que ofrecer, el sistema SHALL llevarla a su perfil como hasta ahora.

#### Scenario: Termina la Parte 1 con documentos pendientes

- **WHEN** una candidata con el módulo de documentos habilitado y documentos obligatorios pendientes pulsa "Finalizar" en la Parte 1
- **THEN** ve un aviso que le pregunta si quiere cargar sus documentos ahora
- **AND** el aviso ofrece "Cargar documentos", "Continuar con la Parte 2" y "Más tarde"

#### Scenario: Elige cargar documentos

- **WHEN** la candidata elige "Cargar documentos" en el aviso
- **THEN** llega a `/dashboard/documentos`

#### Scenario: Termina la Parte 2 con documentos pendientes

- **WHEN** la candidata pulsa "Finalizar" en la Parte 2 y le faltan documentos obligatorios
- **THEN** ve el aviso con "Cargar documentos" y "Más tarde"

#### Scenario: Sin documentos pendientes

- **WHEN** la candidata termina la Parte 2 y ya cargó todos sus documentos obligatorios
- **THEN** no ve el aviso y llega a su perfil

#### Scenario: Sin el módulo de documentos habilitado

- **WHEN** la candidata no tiene habilitado el módulo de documentos y termina la Parte 1
- **THEN** el aviso no le ofrece cargar documentos, sólo continuar con la Parte 2 o ir a su perfil
