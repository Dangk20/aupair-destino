# codigos-promo Specification

## Purpose
TBD - created by archiving change cierre-sprint-0-flujo-candidata. Update Purpose after archive.
## Requirements
### Requirement: Un código sólo consume cupo cuando se confirma el pago

El sistema SHALL contabilizar el uso de un código de descuento en un único momento del ciclo de vida: cuando la venta asociada pasa a estado `confirmado`. Aplicar un código en la página de pago NO SHALL incrementar `codigos_promo.usos_actuales` ni crear un registro en `codigos_promo_usos`.

#### Scenario: La candidata aplica el código pero aún no paga

- **WHEN** una candidata aplica un código válido en `/pago` y continúa a WhatsApp
- **THEN** se registra una venta en estado `pendiente` anclada a ese código
- **AND** `usos_actuales` del código permanece sin cambios
- **AND** no se crea registro en `codigos_promo_usos`

#### Scenario: El admin confirma el pago

- **WHEN** el admin confirma la venta de esa candidata
- **THEN** `usos_actuales` del código se incrementa en 1
- **AND** se crea un registro en `codigos_promo_usos` con el monto pagado
- **AND** si el código tiene asociada dueña con porcentaje mayor a cero, se genera la comisión congelada

#### Scenario: Confirmación repetida de la misma venta

- **WHEN** el admin confirma dos veces la misma venta
- **THEN** `usos_actuales` se incrementa una sola vez
- **AND** no se duplica el registro en `codigos_promo_usos` ni la comisión

### Requirement: Todo camino que activa el acceso pasa por la confirmación de venta

El sistema SHALL exponer una única función de confirmación de venta, y todos los caminos administrativos que otorgan acceso a una candidata (confirmar venta, activar acceso desde el listado de usuarias, confirmar pago) SHALL delegar en ella. Ningún camino SHALL encender permisos, contar usos o generar comisiones por su cuenta.

#### Scenario: El admin activa el acceso desde el listado de usuarias

- **WHEN** el admin activa el acceso de una candidata que tenía una venta pendiente con código
- **THEN** esa venta pasa a `confirmado`
- **AND** se cuenta el uso del código y se genera la comisión, igual que si hubiera usado el módulo de ventas

#### Scenario: El admin activa el acceso de una candidata sin venta registrada

- **WHEN** el admin activa el acceso de una candidata que no tiene ninguna venta
- **THEN** el sistema crea una venta confirmada por el monto indicado, atribuyéndole el código que la candidata haya aplicado si existe
- **AND** el resto del flujo (permisos, uso del código, comisión) se comporta igual que en una confirmación normal

### Requirement: Anular una venta confirmada libera el cupo del código

El sistema SHALL revertir el consumo del código cuando una venta confirmada se anula: decrementar `usos_actuales` sin bajar de cero, eliminar el registro de `codigos_promo_usos` de esa candidata para ese código y dejar la comisión asociada en estado anulado.

#### Scenario: Anulación de una venta con código

- **WHEN** el admin anula una venta confirmada que había consumido un código
- **THEN** `usos_actuales` del código disminuye en 1
- **AND** el cupo liberado vuelve a estar disponible para otra candidata
- **AND** la comisión de la asociada queda anulada y deja de contar como por pagar

#### Scenario: Anulación de una venta sin código

- **WHEN** el admin anula una venta confirmada que no tenía código
- **THEN** la operación sucede sin error y ningún contador de códigos se modifica

### Requirement: El módulo admin distingue usos confirmados de aplicaciones pendientes

El módulo `/admin/codigos-promo` SHALL mostrar, por cada código, los usos confirmados (ventas pagadas) y por separado las aplicaciones pendientes (candidatas que aplicaron el código y aún no tienen venta confirmada). El límite de usos SHALL evaluarse únicamente contra los usos confirmados.

#### Scenario: Código aplicado por dos candidatas, una pagó

- **WHEN** dos candidatas aplican el mismo código y sólo una tiene su venta confirmada
- **THEN** el módulo muestra 1 uso confirmado y 1 aplicación pendiente
- **AND** el consumo del límite de usos refleja únicamente el uso confirmado

#### Scenario: Código que alcanzó su límite

- **WHEN** un código con límite de 5 usos llega a 5 usos confirmados
- **THEN** el módulo lo marca como agotado
- **AND** una nueva candidata que intente aplicarlo recibe el mensaje de que alcanzó su límite de usos

### Requirement: Cada asociada tiene un código propio desde su creación

El sistema SHALL crear, al dar de alta una asociada, un código de descuento en `codigos_promo` anclado a ella con su porcentaje de comisión, y SHALL registrar ese mismo código en el usuario para la atribución de registros por referido.

#### Scenario: Alta de una asociada

- **WHEN** el admin crea una asociada
- **THEN** queda creado un código activo con `asociada_id` apuntando a ella y su porcentaje de comisión
- **AND** el código aparece en `/admin/codigos-promo` asociado a su nombre

#### Scenario: Reasignación de la dueña de un código

- **WHEN** el admin cambia la asociada dueña o el porcentaje de comisión de un código existente
- **THEN** las ventas confirmadas a partir de ese momento generan comisión para la nueva dueña con el nuevo porcentaje
- **AND** las comisiones ya generadas conservan el porcentaje y el monto con que fueron congeladas

