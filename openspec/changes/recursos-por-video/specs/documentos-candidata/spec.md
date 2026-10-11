## MODIFIED Requirements

### Requirement: Los recursos del curso comparten el almacenamiento y quedan protegidos

Los archivos que el equipo sube a las sesiones del curso SHALL guardarse en el mismo directorio de datos que los documentos y servirse por una ruta de API que exija sesión. Un usuario administrativo SHALL poder descargarlos siempre; cualquier otra usuaria, únicamente si la sesión a la que pertenece el recurso está desbloqueada para ella (disponible o completada), verificado contra la base de datos. El archivo SHALL entregarse como descarga, con su nombre.

Al subir, el servidor SHALL aceptar sólo PDF y Word (`.pdf`, `.doc`, `.docx`) de hasta 20 MB, y rechazar el resto con el motivo.

#### Scenario: El admin sube un recurso a una sesión

- **WHEN** el admin sube un archivo a una sesión
- **THEN** el archivo se guarda en el directorio de datos, fuera de `public/`
- **AND** el registro guarda una referencia interna, no una URL pública

#### Scenario: El admin sube un archivo no permitido

- **WHEN** llega a `POST /api/admin/recursos` un archivo `.exe`, o un PDF de más de 20 MB
- **THEN** el servidor responde 400 con el motivo y no guarda nada

#### Scenario: Candidata que puede ver la sesión

- **WHEN** una candidata solicita un recurso de una sesión disponible o completada para ella, tenga o no `acceso_recursos`
- **THEN** el sistema responde con el archivo como descarga

#### Scenario: Candidata con la sesión bloqueada

- **WHEN** una candidata solicita un recurso de una sesión que para ella está bloqueada
- **THEN** el sistema responde 403 y no entrega el archivo

#### Scenario: Recurso cuyo archivo no está disponible

- **WHEN** se solicita un recurso cuyo archivo no está en el almacenamiento
- **THEN** el sistema lo informa como condición conocida y el panel lo muestra como no disponible
