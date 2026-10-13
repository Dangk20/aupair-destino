## ADDED Requirements

### Requirement: El admin consulta las comisiones generadas

El sistema SHALL ofrecer al admin una vista de las comisiones con, por cada una: la asociada, la candidata que originó la venta, el código usado, el monto de la venta, el porcentaje aplicado, el monto de la comisión, su estado y la fecha. La vista SHALL poder filtrarse por asociada y por estado.

#### Scenario: Venta confirmada con código de asociada

- **WHEN** se confirma una venta con un código que tiene asociada dueña y porcentaje mayor que cero
- **THEN** la comisión aparece en la vista con estado pendiente

#### Scenario: Venta sin código

- **WHEN** se confirma una venta sin código
- **THEN** no aparece ninguna comisión asociada a esa venta

#### Scenario: Filtro por asociada

- **WHEN** el admin filtra por una asociada
- **THEN** la vista muestra únicamente las comisiones de esa asociada y el total que se le adeuda

### Requirement: El admin marca una comisión como pagada

El sistema SHALL permitir al admin registrar el pago de una comisión, dejando constancia de la fecha. Una comisión pagada NO SHALL volver a contarse como pendiente.

#### Scenario: Registrar el pago

- **WHEN** el admin marca una comisión pendiente como pagada
- **THEN** su estado cambia a pagada y queda registrada la fecha
- **AND** deja de sumar en el total por pagar de esa asociada

#### Scenario: Marcar dos veces

- **WHEN** el admin marca como pagada una comisión que ya lo estaba
- **THEN** el sistema no duplica el registro ni altera la fecha original

#### Scenario: Comisión de una venta anulada

- **WHEN** se anula la venta que originó una comisión
- **THEN** la comisión queda anulada y no puede marcarse como pagada

### Requirement: Los totales de comisiones son consistentes con las ventas

El sistema SHALL calcular los totales —por pagar, pagado e histórico— sobre las comisiones vivas, excluyendo las anuladas, de modo que lo que ve el admin cuadre con las ventas confirmadas.

#### Scenario: Total por pagar de una asociada

- **WHEN** una asociada tiene tres comisiones: una pagada, una pendiente y una anulada
- **THEN** su total por pagar refleja únicamente la pendiente
- **AND** la anulada no aparece en ningún total

#### Scenario: Sin comisiones

- **WHEN** una asociada no tiene comisiones generadas
- **THEN** la vista lo indica explícitamente en lugar de mostrar una tabla vacía sin contexto
