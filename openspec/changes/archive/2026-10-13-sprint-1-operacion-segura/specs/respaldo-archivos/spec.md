## ADDED Requirements

### Requirement: Los archivos subidos se respaldan de forma automática y periódica

El sistema SHALL respaldar diariamente el almacenamiento de documentos y recursos, sin intervención manual, conservando varias copias para poder volver a un punto anterior y no sólo al último día.

#### Scenario: Respaldo diario

- **WHEN** transcurre un día con el servidor operando
- **THEN** existe un respaldo nuevo del almacenamiento, fechado

#### Scenario: Rotación

- **WHEN** se acumulan respaldos más allá del período de retención definido
- **THEN** los más antiguos se eliminan y los recientes se conservan

#### Scenario: El respaldo falla

- **WHEN** un respaldo no se completa
- **THEN** queda registro del fallo, y el último respaldo válido no se sobrescribe ni se borra

### Requirement: La restauración está probada, no supuesta

El sistema SHALL contar con un procedimiento de restauración escrito y **verificado al menos una vez** sobre un respaldo real. Un respaldo que nunca se ha restaurado no cuenta como respaldo.

#### Scenario: Restauración de prueba

- **WHEN** se ejecuta el procedimiento de restauración sobre un respaldo
- **THEN** los documentos vuelven a estar accesibles por su ruta autenticada
- **AND** el resultado de esa prueba queda registrado con su fecha

#### Scenario: Pérdida del volumen

- **WHEN** el volumen de archivos se pierde por completo
- **THEN** el procedimiento permite recuperar el estado del último respaldo válido

### Requirement: Los respaldos no quedan expuestos

Los archivos de respaldo contienen documentos de identidad de las candidatas. NO SHALL quedar accesibles por vía pública ni dentro del árbol servido por la aplicación.

#### Scenario: Ubicación del respaldo

- **WHEN** se crea un respaldo
- **THEN** queda fuera del directorio público de la aplicación y con permisos restringidos al administrador del servidor

#### Scenario: Intento de acceso por web

- **WHEN** se solicita la ruta de un archivo de respaldo desde internet
- **THEN** el servidor no lo entrega
