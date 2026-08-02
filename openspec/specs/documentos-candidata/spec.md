# documentos-candidata Specification

## Purpose
TBD - created by archiving change cierre-sprint-0-flujo-candidata. Update Purpose after archive.
## Requirements
### Requirement: Los documentos se almacenan fuera del árbol público

El sistema SHALL guardar los archivos de los documentos en un directorio de datos fuera de `public/`, persistido por volumen en producción. Ningún documento SHALL quedar accesible como archivo estático servido directamente por el framework.

#### Scenario: La candidata sube un documento

- **WHEN** una candidata con acceso a documentos sube un archivo válido
- **THEN** el archivo se escribe en el directorio de datos configurado, fuera de `public/`
- **AND** el registro en `documentos_usuario` guarda una referencia interna al archivo, no una URL pública

#### Scenario: Intento de acceso directo por ruta estática

- **WHEN** alguien solicita una ruta bajo `/uploads/documentos/...`
- **THEN** el servidor no entrega ningún archivo de candidata

### Requirement: Sólo pueden descargar un documento su dueña y el personal autorizado

El sistema SHALL servir los documentos por una ruta de API que exija sesión válida y SHALL autorizar la descarga únicamente a la candidata dueña del documento y a los roles administrativos. Cualquier otra solicitud SHALL ser rechazada.

#### Scenario: La candidata descarga su propio documento

- **WHEN** la candidata dueña solicita su documento
- **THEN** el sistema responde con el archivo y su tipo de contenido correcto

#### Scenario: El admin revisa el documento de una candidata

- **WHEN** un usuario con rol admin solicita el documento de cualquier candidata
- **THEN** el sistema responde con el archivo

#### Scenario: Otra candidata intenta abrir un documento ajeno

- **WHEN** una candidata solicita un documento cuyo `usuario_id` no es el suyo
- **THEN** el sistema responde 403 y no entrega el archivo

#### Scenario: Solicitud sin sesión

- **WHEN** se solicita un documento sin sesión válida
- **THEN** el sistema responde 401 y no entrega el archivo

#### Scenario: Intento de salir del directorio de datos

- **WHEN** la referencia solicitada contiene segmentos de recorrido de rutas (`..`) o una ruta absoluta
- **THEN** el sistema rechaza la solicitud sin leer del disco

### Requirement: Un documento cuyo archivo no está disponible se comunica de forma explícita

Cuando el registro existe en base de datos pero el archivo físico no está en el almacenamiento, el sistema SHALL informarlo como una condición conocida ("archivo no disponible") en lugar de producir una página de error del navegador, tanto en el panel del admin como en el dashboard de la candidata.

#### Scenario: Admin abre un documento cuyo archivo se perdió

- **WHEN** el admin usa el botón de ver sobre un documento cuyo archivo no está en el almacenamiento
- **THEN** la interfaz muestra el estado "archivo no disponible" con la indicación de pedir a la candidata que lo vuelva a cargar
- **AND** no se muestra una pantalla 404 del navegador

#### Scenario: La candidata ve su documento perdido en su lista

- **WHEN** la candidata abre su sección de documentos y uno de sus archivos no está disponible
- **THEN** ese documento aparece marcado como "vuelve a subirlo" y habilita la recarga sobre el mismo tipo de documento

### Requirement: Los documentos ya registrados siguen siendo accesibles tras el cambio

El sistema SHALL migrar los registros existentes de `documentos_usuario` al nuevo esquema de referencia, de modo que un documento cargado antes del cambio se abra por la nueva ruta autenticada sin que la candidata tenga que volver a subirlo, siempre que su archivo exista en el almacenamiento.

#### Scenario: Documento cargado antes del cambio con archivo presente

- **WHEN** el admin abre un documento cuyo registro fue creado con el esquema anterior y su archivo está en el almacenamiento
- **THEN** el documento se descarga correctamente por la ruta autenticada

#### Scenario: Documento cargado antes del cambio con archivo ausente

- **WHEN** el archivo correspondiente no está en el almacenamiento
- **THEN** el documento se muestra con el estado "archivo no disponible" y no rompe la carga del resto de la lista

### Requirement: Los recursos del curso comparten el almacenamiento y quedan protegidos

Los archivos que el equipo sube a las sesiones del curso SHALL guardarse en el mismo directorio de datos que los documentos y servirse por una ruta de API que exija sesión. Un usuario administrativo SHALL poder descargarlos siempre; una candidata, únicamente con su permiso de recursos activo, verificado contra la base de datos.

#### Scenario: El admin sube un recurso a una sesión

- **WHEN** el admin sube un archivo a una sesión
- **THEN** el archivo se guarda en el directorio de datos, fuera de `public/`
- **AND** el registro guarda una referencia interna, no una URL pública

#### Scenario: Candidata con acceso a recursos

- **WHEN** una candidata con `acceso_recursos` activo solicita un recurso
- **THEN** el sistema responde con el archivo

#### Scenario: Candidata sin acceso a recursos

- **WHEN** una candidata sin ese permiso solicita el mismo recurso
- **THEN** el sistema responde 403 y no entrega el archivo

#### Scenario: Recurso cuyo archivo no está disponible

- **WHEN** se solicita un recurso cuyo archivo no está en el almacenamiento
- **THEN** el sistema lo informa como condición conocida y el panel lo muestra como no disponible

### Requirement: La revisión de documentos del admin conserva su comportamiento

El sistema SHALL mantener para el admin la capacidad de listar los documentos de una candidata, aprobarlos, rechazarlos, dejar una nota visible para ella y eliminarlos, sobre la nueva forma de almacenamiento.

#### Scenario: Aprobación de un documento

- **WHEN** el admin aprueba un documento desde el perfil de la candidata
- **THEN** el documento queda en estado `aprobado` y la candidata lo ve así en su dashboard

#### Scenario: Eliminación de un documento

- **WHEN** el admin elimina un documento
- **THEN** el registro deja de listarse y su archivo deja de ser accesible por la ruta autenticada

