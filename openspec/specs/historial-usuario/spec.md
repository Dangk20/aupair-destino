# historial-usuario Specification

## Purpose
TBD - created by archiving change historial-usuario. Update Purpose after archive.
## Requirements
### Requirement: El historial registra el curso, los documentos y el pago

El sistema SHALL registrar en el historial de la candidata, con fecha y autor:
cada sesión del curso que marque como completada (con su título), el curso
terminado, cada documento cargado, reemplazado o retirado (con su tipo), y cada
pago confirmado o anulado. Un hecho con la misma referencia NO SHALL
registrarse dos veces. Un fallo al registrar NO SHALL tumbar la operación que
lo originó.

#### Scenario: Completa una sesión

- **WHEN** la candidata marca una sesión como completada
- **THEN** su historial dice «Completó la sesión «<título>»» con la fecha; si la marca otra vez, no se repite

#### Scenario: Termina el curso

- **WHEN** la candidata completa la última sesión
- **THEN** el historial registra «Terminó el curso» una sola vez

#### Scenario: Carga y reemplaza un documento

- **WHEN** la candidata carga su pasaporte y después lo reemplaza
- **THEN** el historial dice «Cargó Pasaporte» y luego «Reemplazó Pasaporte»

#### Scenario: El pago

- **WHEN** el admin confirma la venta de la candidata y luego la anula
- **THEN** el historial dice «Pagó su cupo en Destino Au Pair» y luego «Se anuló el pago de su cupo: perdió el acceso»

### Requirement: Lo que ya pasó aparece con su fecha real

Al desplegar, el historial SHALL rellenarse con las sesiones completadas, los
documentos vigentes y las ventas confirmadas, cada uno con la fecha en que
ocurrió. Correr el relleno dos veces NO SHALL duplicarlos.

#### Scenario: Una candidata antigua

- **WHEN** el admin abre el historial de una candidata que completó 3 sesiones y cargó 5 documentos antes del cambio
- **THEN** ve esos 8 hechos con sus fechas originales

### Requirement: El admin ve el historial desde «Ver» en Usuarios

El modal «Ver» de Usuarios SHALL mostrar la línea de tiempo de la candidata
—la misma de su ficha, con autor y hechos internos— y un enlace «Ver perfil» a
la ficha. La candidata SHALL seguir viendo la suya sin autor ni hechos internos.

#### Scenario: El admin abre «Ver»

- **WHEN** el admin pulsa «Ver» en una candidata de Usuarios
- **THEN** ve su etapa, su recorrido y la lista de hechos con fecha y autor, y «Ver perfil» lo lleva a su ficha

