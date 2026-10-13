## ADDED Requirements

### Requirement: La asociada ve sus comisiones y su balance

La asociada SHALL ver, en «Mis comisiones», la misma pantalla de comisiones del admin con sólo sus comisiones: por cada venta hecha con su código, la candidata (sin su correo), el valor de la venta, el porcentaje, la comisión, su estado y la fecha; y los totales por pagar, pagado e histórico, separados por moneda. NO SHALL ver comisiones de otras asociadas, el botón para marcarlas como pagadas ni el filtro por asociada.

#### Scenario: La asociada abre sus comisiones

- **WHEN** una asociada con dos ventas confirmadas con su código abre «Mis comisiones»
- **THEN** ve las dos comisiones con su estado y el total por pagar, sin el botón «Pagar»

#### Scenario: No ve las de otras

- **WHEN** la asociada pide `GET /api/asociada/comisiones`
- **THEN** la respuesta trae sólo comisiones con su `asociada_id`, sin correos de candidatas; otro rol recibe 403

### Requirement: La asociada ve sus códigos con el precio vigente

Arriba de la lista SHALL ver sus códigos: el descuento, lo que paga hoy quien lo usa con el precio del cupo configurado, su porcentaje de comisión, los usos y lo recaudado por moneda.

#### Scenario: Cambia el precio del cupo

- **WHEN** el admin cambia el precio del cupo
- **THEN** la asociada ve el nuevo valor que paga quien use su código
