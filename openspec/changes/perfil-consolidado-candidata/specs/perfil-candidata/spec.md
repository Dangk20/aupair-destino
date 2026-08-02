## ADDED Requirements

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
