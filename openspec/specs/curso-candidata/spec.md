# curso-candidata Specification

## Purpose
TBD - created by archiving change recursos-por-video. Update Purpose after archive.
## Requirements
### Requirement: Cada sesión del curso muestra sus recursos descargables

En `/dashboard/curso`, la sesión que se está viendo SHALL mostrar, debajo de su resumen, la lista de recursos que el equipo le adjuntó, con su nombre, su tipo y su tamaño, y un botón para descargar cada uno. Si la sesión no tiene recursos, la sección NO SHALL mostrarse.

#### Scenario: Sesión con recursos

- **WHEN** la candidata abre en el curso una sesión a la que el admin adjuntó dos PDF
- **THEN** ve debajo del resumen la sección de recursos con los dos archivos, su tipo y su tamaño

#### Scenario: Descargar un recurso

- **WHEN** la candidata pulsa descargar en uno de ellos
- **THEN** el navegador descarga el archivo con su nombre, en lugar de abrirlo en la pestaña

#### Scenario: Sesión sin recursos

- **WHEN** la candidata abre una sesión sin recursos
- **THEN** no ve ninguna sección de recursos

#### Scenario: Archivo que ya no está en el servidor

- **WHEN** un recurso de la sesión tiene su archivo perdido del almacenamiento
- **THEN** aparece marcado como no disponible, sin botón de descarga, y el resto de la lista se muestra normal

### Requirement: Los recursos de una sesión bloqueada no se exponen

El sistema SHALL entregar la lista de recursos sólo de las sesiones que la usuaria puede ver (disponibles o completadas), con la misma regla de desbloqueo secuencial que gobierna los videos. La regla SHALL estar definida en un único lugar, compartido por la lista de sesiones y por la descarga.

#### Scenario: Sesión bloqueada

- **WHEN** la candidata consulta el curso y la sesión 3 está bloqueada para ella
- **THEN** la respuesta no incluye los recursos de la sesión 3

