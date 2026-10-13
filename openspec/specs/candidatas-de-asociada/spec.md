# candidatas-de-asociada Specification

## Purpose
TBD - created by archiving change candidatas-por-cupon. Update Purpose after archive.
## Requirements
### Requirement: Las candidatas de una asociada son las que llegaron por su cupón

El sistema SHALL considerar que una candidata es de una asociada cuando tiene
una venta no anulada pagada con un cupón de esa asociada, o cuando se registró
con el código de un cupón de esa asociada y no pagó con el cupón de otra. El
pago MUST mandar sobre el registro. No existe asignación manual.

#### Scenario: Pagó con su cupón
- **WHEN** una candidata tiene una venta confirmada cuyo cupón tiene `asociada_id` = A
- **THEN** la candidata aparece en el tablero de la asociada A marcada como «Pagó con <código>»

#### Scenario: Sólo se registró con su código
- **WHEN** una candidata escribió al registrarse el código de un cupón de A y no tiene venta con cupón
- **THEN** aparece en el tablero de A marcada como «Se registró con <código>»

#### Scenario: Se registró con un código y pagó con el de otra
- **WHEN** una candidata se registró con el código de A pero pagó con un cupón de B
- **THEN** aparece sólo en el tablero de B

#### Scenario: Venta anulada
- **WHEN** la única venta con el cupón de A está anulada y la candidata no se registró con su código
- **THEN** no aparece en el tablero de A

#### Scenario: Cupón sin asociada
- **WHEN** una candidata pagó con un cupón sin `asociada_id`
- **THEN** no aparece en el tablero de ninguna asociada

### Requirement: La asociada ve el avance de sus candidatas, no sus datos

El panel de la asociada SHALL mostrar sus candidatas en el mismo tablero de
etapas que usan el admin y la agencia, en sólo lectura: nombre, ciudad, etapa,
tiempo en la etapa, porcentaje diligenciado y el cupón por el que llegó. La
respuesta de la API MUST NOT incluir teléfono, correo, fecha de nacimiento ni
datos del perfil, y el tablero MUST NOT ofrecer chat ni enlace al perfil.

#### Scenario: Inicio de la asociada
- **WHEN** la asociada entra a `/asociada`
- **THEN** ve el tablero con sus candidatas por etapa y un resumen de cuántas tiene y cuántas pagaron

#### Scenario: Sin candidatas
- **WHEN** la asociada no tiene cupón o nadie ha llegado por él
- **THEN** ve un mensaje que explica que aparecerán cuando alguien se registre o pague con su código

#### Scenario: Sin datos de contacto
- **WHEN** se consulta `GET /api/asociada/tablero`
- **THEN** ninguna candidata trae `telefono`, `email` ni `fecha_nacimiento`

#### Scenario: Enlace viejo
- **WHEN** la asociada abre `/asociada/usuarias`
- **THEN** la lleva a `/asociada`

### Requirement: El admin ve las candidatas de cada asociada

La lista de asociadas del admin SHALL contar candidatas y pagos con la misma
regla, y la ficha de una asociada SHALL listar sus candidatas con su etapa. El
admin MUST poder borrar una asociada.

#### Scenario: Ficha de la asociada
- **WHEN** el admin abre `/admin/asociadas/<id>`
- **THEN** ve las candidatas de esa asociada con su etapa y su cupón, sin botón de asignar

#### Scenario: Borrar asociada
- **WHEN** el admin borra una asociada
- **THEN** la operación responde 200 y la asociada desaparece de la lista

#### Scenario: Módulo visible
- **WHEN** el admin abre su menú
- **THEN** «Asociadas» está disponible

### Requirement: El registro no asigna asesora

El registro SHALL guardar el código escrito en `usuarios.codigo_referido` y
MUST NOT intentar asignar una asesora.

#### Scenario: Registro con código
- **WHEN** una candidata se registra con el código de un cupón de A
- **THEN** el registro responde sin errores en el log y la candidata aparece en el tablero de A

