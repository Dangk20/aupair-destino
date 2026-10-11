## ADDED Requirements

### Requirement: El lápiz de edición de la ficha propia respeta el envío

En la ficha propia, una sección de una parte ya enviada NO SHALL mostrar el acceso "Editar"; si tiene una observación abierta, SHALL mostrar en su lugar "Corregir", que lleva a la corrección en el perfil. Las secciones de una parte no enviada conservan "Editar".

#### Scenario: Sección de una parte enviada sin observaciones

- **WHEN** la candidata ve en su perfil una sección de la Parte 1 ya enviada
- **THEN** no ve el botón "Editar"

#### Scenario: Sección con observación

- **WHEN** esa sección tiene una observación abierta
- **THEN** ve "Corregir"
