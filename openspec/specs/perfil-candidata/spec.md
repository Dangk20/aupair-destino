# perfil-candidata Specification

## Purpose
TBD - created by archiving change cierre-sprint-0-flujo-candidata. Update Purpose after archive.
## Requirements
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

### Requirement: El formulario impide avanzar con campos obligatorios sin diligenciar

El sistema NO SHALL permitir avanzar a la siguiente sección, saltar a otra sección desde el navegador lateral, ni dar por terminado el formulario mientras haya campos obligatorios vacíos en la sección activa. El trabajo parcial SHALL poder guardarse sin bloquear a la candidata.

#### Scenario: Intento de avanzar con campos vacíos

- **WHEN** la candidata pulsa "Guardar y continuar" con campos obligatorios vacíos
- **THEN** el sistema no avanza de sección
- **AND** muestra la alerta indicando que faltan campos por diligenciar

#### Scenario: Intento de saltar a otra sección con campos vacíos

- **WHEN** la candidata intenta ir a otra sección desde el navegador lateral dejando campos obligatorios vacíos
- **THEN** el sistema no cambia de sección y señala los campos que faltan

#### Scenario: Guardado parcial permitido

- **WHEN** la candidata pulsa "Guardar" sin avanzar y quedan campos obligatorios vacíos
- **THEN** el sistema guarda lo diligenciado hasta el momento
- **AND** le indica qué campos siguen pendientes sin impedirle salir

#### Scenario: Sección final

- **WHEN** la candidata completa la última sección con todos sus campos obligatorios
- **THEN** el sistema guarda y la devuelve al resumen de su perfil

### Requirement: Cada campo faltante se señala en rojo con su mensaje

El sistema SHALL marcar visualmente en rojo cada campo obligatorio vacío al validar, SHALL mostrar junto a él un mensaje que indique qué falta, SHALL presentar un resumen de los campos pendientes por su nombre visible y SHALL llevar el foco al primer campo con error. La marca de error de un campo SHALL desaparecer en cuanto la candidata lo diligencia.

#### Scenario: Validación fallida en una sección

- **WHEN** la validación falla por tres campos vacíos
- **THEN** los tres campos aparecen con borde rojo y su mensaje
- **AND** el resumen nombra los tres campos pendientes con la etiqueta que la candidata ve en pantalla
- **AND** el foco se ubica en el primero de ellos

#### Scenario: Corrección de un campo marcado

- **WHEN** la candidata diligencia un campo que estaba marcado en rojo
- **THEN** ese campo deja de mostrarse en error y sale del resumen de pendientes

#### Scenario: Campos obligatorios señalizados antes de validar

- **WHEN** la candidata abre una sección del formulario
- **THEN** los campos obligatorios se distinguen de los opcionales en su etiqueta

### Requirement: El servidor valida el perfil antes de darlo por completo

El sistema SHALL validar en el servidor los campos obligatorios al guardar el perfil y SHALL rechazar con detalle de los campos faltantes cualquier intento de marcar el perfil como completo sin cumplirlos, de modo que el estado que ve la agencia no dependa de la validación del navegador.

#### Scenario: Petición que pretende completar el perfil sin cumplir requisitos

- **WHEN** llega una petición de guardado que marcaría el perfil como completo con campos obligatorios vacíos
- **THEN** el servidor responde con error indicando la lista de campos faltantes
- **AND** el perfil no queda marcado como completo

#### Scenario: Guardado parcial legítimo

- **WHEN** llega una petición de guardado parcial con campos obligatorios aún vacíos
- **THEN** el servidor guarda los datos recibidos y responde indicando qué campos siguen pendientes

### Requirement: La Parte 2 se valida con el mismo criterio que la Parte 1

El sistema SHALL aplicar al perfil de agencia (Parte 2) las mismas reglas de bloqueo, marcado en rojo y resumen de pendientes que a la Parte 1, y SHALL considerar una sección completa sólo cuando todos sus campos obligatorios estén diligenciados.

#### Scenario: Avance bloqueado en el perfil de agencia

- **WHEN** la candidata intenta avanzar en el perfil de agencia con campos obligatorios vacíos
- **THEN** el sistema la bloquea y señala los campos igual que en la Parte 1

#### Scenario: Sección parcialmente diligenciada

- **WHEN** una sección del perfil de agencia tiene la mitad de sus campos obligatorios diligenciados
- **THEN** esa sección NO se considera completa para el progreso ni para el estado del perfil

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

### Requirement: La candidata puede ver su perfil completo en una sola vista

Cuando el perfil está diligenciado, el sistema SHALL ofrecer a la candidata una vista de **sólo lectura** con toda su información: sus datos principales y las secciones de **ambas partes** del perfil, sin obligarla a entrar a un formulario de edición.

La vista SHALL construirse a partir de la misma declaración de secciones y campos que usan los formularios y la validación, de modo que un campo nuevo aparezca en ella sin trabajo adicional y no puedan discrepar.

#### Scenario: Perfil completo

- **WHEN** una candidata con las dos partes del perfil diligenciadas abre la revisión de su perfil
- **THEN** ve sus datos principales y todas las secciones de las dos partes, con el valor de cada campo
- **AND** no necesita abrir ningún formulario para leerlos

#### Scenario: Un campo se añade al formulario

- **WHEN** se añade un campo a una sección en la declaración de campos del perfil
- **THEN** ese campo aparece en la vista consolidada con su etiqueta, sin tocar la vista

#### Scenario: Campo sin diligenciar

- **WHEN** una sección tiene un campo opcional que la candidata no llenó
- **THEN** el campo aparece igualmente, señalado como vacío
- **AND** NO se omite de la vista

#### Scenario: Perfil sin completar

- **WHEN** una candidata que aún no ha completado su perfil abre la vista de su perfil
- **THEN** ve sus datos principales igualmente
- **AND** ve el recorrido de todas las secciones, cuáles están completas y **qué campos le faltan** en las que no
- **AND** cada sección pendiente le ofrece continuar por ella

### Requirement: Cada acción del perfil lleva a donde dice que lleva

Ningún control del módulo de perfil SHALL prometer un destino y abrir otro. En particular, la acción que ofrece revisar **el perfil** SHALL mostrar el perfil completo, y la que ofrece una **sección concreta** SHALL abrir esa sección.

#### Scenario: Revisar el perfil

- **WHEN** la candidata usa la acción de revisar su perfil estando completo
- **THEN** ve las dos partes, no una sola

#### Scenario: Abrir una sección concreta

- **WHEN** la candidata elige una sección determinada —por ejemplo Salud—
- **THEN** llega a esa sección
- **AND** no al principio del formulario

#### Scenario: Editar desde la vista consolidada

- **WHEN** la candidata usa la acción de editar de una sección de la vista consolidada
- **THEN** se abre el formulario que contiene esa sección, posicionado en ella
- **AND** al guardar, sus cambios se reflejan en la vista consolidada

### Requirement: El salto directo a una sección no evade la validación por pasos

El sistema SHALL admitir abrir un formulario del perfil directamente en una sección determinada, y esa entrada NO SHALL permitir dejar atrás secciones incompletas. Si alguna sección anterior a la solicitada tiene obligatorios sin diligenciar, el formulario SHALL abrir en la primera que falte, no en la pedida.

#### Scenario: Sección solicitada que no existe

- **WHEN** se pide una sección con un identificador que no corresponde a ninguna
- **THEN** el formulario abre en su primera sección, sin error

#### Scenario: Se pide una sección con anteriores incompletas

- **WHEN** se pide abrir una sección y alguna anterior tiene obligatorios sin diligenciar
- **THEN** el formulario abre en la primera sección incompleta
- **AND** la candidata sigue sin poder avanzar dejando obligatorios vacíos

#### Scenario: Se pide una sección alcanzable

- **WHEN** se pide una sección cuyas anteriores están todas completas
- **THEN** el formulario abre en la sección pedida

### Requirement: La candidata ve si su perfil fue aprobado

El sistema SHALL mostrar a la candidata si el equipo ya aprobó su perfil. Mientras no lo haya hecho, SHALL decir que está en revisión, y NO SHALL mostrar calificación, puntaje ni ningún estado que el sistema no tenga registrado de verdad.

Hoy lo único que el sistema registra sobre la evaluación es si está aprobada o no: no existe ningún lugar donde el equipo escriba una observación dirigida a la candidata.

#### Scenario: Perfil aprobado

- **WHEN** el equipo aprueba el perfil de una candidata
- **AND** la candidata abre su perfil
- **THEN** ve que quedó aprobado

#### Scenario: Perfil aún sin aprobar

- **WHEN** la candidata completó su perfil y el equipo todavía no lo ha aprobado
- **THEN** ve que está en revisión
- **AND** no ve calificación ni puntaje alguno

#### Scenario: Aprobación retirada

- **WHEN** el equipo retira la aprobación de un perfil
- **THEN** la candidata vuelve a ver que está en revisión

### Requirement: El perfil que se entrega al navegador no incluye credenciales

La consulta del perfil SHALL devolver únicamente los campos que la candidata necesita ver o editar. NO SHALL incluir la contraseña —ni siquiera cifrada—, los tokens de recuperación, ni la valoración interna que el equipo registra sobre ella.

#### Scenario: Consulta del perfil propio

- **WHEN** una candidata consulta su perfil
- **THEN** recibe los campos de todas las secciones del perfil
- **AND** no recibe su contraseña ni sus tokens de recuperación

#### Scenario: Candidata con recuperación de contraseña en curso

- **WHEN** una candidata ha solicitado recuperar su contraseña y tiene un token vigente
- **AND** consulta su perfil
- **THEN** ese token no viaja en la respuesta

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

### Requirement: El lápiz de edición de la ficha propia respeta el envío

En la ficha propia, una sección de una parte ya enviada NO SHALL mostrar el acceso "Editar"; si tiene una observación abierta, SHALL mostrar en su lugar "Corregir", que lleva a la corrección en el perfil. Las secciones de una parte no enviada conservan "Editar".

#### Scenario: Sección de una parte enviada sin observaciones

- **WHEN** la candidata ve en su perfil una sección de la Parte 1 ya enviada
- **THEN** no ve el botón "Editar"

#### Scenario: Sección con observación

- **WHEN** esa sección tiene una observación abierta
- **THEN** ve "Corregir"

