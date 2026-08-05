## ADDED Requirements

### Requirement: La documentación se consulta también desde la ficha de la candidata

El sistema SHALL permitir consultar la documentación de una candidata desde su
ficha, además de desde el módulo de documentos. Esa consulta SHALL regirse por las
mismas reglas de acceso que ya gobiernan la descarga: la candidata ve la suya, el
personal autorizado ve la de cualquiera, y nadie más ve ninguna.

La lista de documentos requeridos SHALL declararse en un módulo propio, para que
la ficha no dependa de importar desde una ruta de API.

#### Scenario: La candidata consulta su documentación desde la ficha

- **WHEN** una candidata con acceso a documentos abre la pestaña Documentos de su ficha
- **THEN** ve la misma lista de documentos requeridos y los mismos estados que en `/dashboard/documentos`
- **AND** puede subir un documento pendiente desde ahí

#### Scenario: El personal revisa desde la ficha

- **WHEN** un admin abre la pestaña Documentos de la ficha de una candidata
- **THEN** ve los documentos que ella cargó y puede aprobarlos, rechazarlos y anotarlos
- **AND** al abrir un archivo, la descarga pasa por la ruta autenticada de siempre

#### Scenario: Candidata sin el permiso de documentos

- **WHEN** una candidata sin el permiso de documentos abre la pestaña Documentos de su ficha
- **THEN** se le comunica que esa sección se abre al completar el pago
- **AND** el servidor no devuelve ningún dato de documentos en esa petición

#### Scenario: Una candidata no ve la documentación de otra

- **WHEN** una candidata manipula la petición para pedir la documentación de otra usuaria
- **THEN** el sistema responde 403 y no devuelve dato alguno

#### Scenario: Un archivo perdido se comunica igual en los dos sitios

- **WHEN** un documento está registrado pero su archivo no está en el servidor
- **THEN** la pestaña de la ficha lo muestra como no disponible, con el mismo criterio que el módulo de documentos
- **AND** ese documento no cuenta como cargado en el avance
