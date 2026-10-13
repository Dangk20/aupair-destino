# divisa-y-precio Specification

## Purpose
TBD - created by archiving change divisa-cop. Update Purpose after archive.
## Requirements
### Requirement: El precio del cupo se configura en pesos

El precio del cupo SHALL leerse de la configuración (`precio_cupo_cop`), editable por el admin en `/admin/configuracion`, en pesos colombianos. Ninguna pantalla ni ruta SHALL fijar el precio en el código. Si no está configurado, `/pago` NO SHALL mostrar un precio y una venta sin código SHALL rechazarse con un mensaje que lo explique.

#### Scenario: El admin cambia el precio

- **WHEN** el admin guarda 150000 como precio del cupo
- **THEN** `/pago` muestra «$ 150.000 COP» y la siguiente venta sin código se registra por 150000 en COP

#### Scenario: Precio sin configurar

- **WHEN** no hay precio configurado y una candidata abre `/pago`
- **THEN** ve que el precio está por confirmar y puede escribir por WhatsApp, sin un monto inventado

### Requirement: Cada monto se guarda y se muestra con su moneda

Las ventas, comisiones y códigos promo SHALL guardar su moneda. Las nuevas ventas, comisiones y códigos SHALL ir en COP. Lo registrado antes de este cambio SHALL conservarse en USD, sin convertirse. Todas las pantallas SHALL mostrar los montos con un formateador único que escribe la moneda de cada uno.

#### Scenario: Venta histórica

- **WHEN** el admin abre Ventas después del cambio
- **THEN** las ventas anteriores se ven en USD con su monto original y las nuevas en COP

#### Scenario: Comisión de una venta en COP

- **WHEN** se confirma una venta en COP con el código de una asociada
- **THEN** la comisión queda en COP

### Requirement: Un cupón es un porcentaje de descuento sobre el precio del cupo

Un cupón SHALL definirse por su porcentaje de descuento (0 a 100) sobre el precio del cupo configurado, no por un precio. Lo que paga quien lo usa SHALL calcularse con el precio vigente, redondeado al peso: si el admin cambia el precio del cupo, todos los cupones SHALL seguirlo. La venta SHALL congelar el monto calculado en el momento en que se registra.

#### Scenario: Cambia el precio del cupo

- **WHEN** hay un cupón de 15 % y el admin sube el precio del cupo de 150000 a 200000
- **THEN** quien use el cupón paga 170000 COP en vez de 127500

#### Scenario: El código de una asociada nueva

- **WHEN** el admin crea una asociada
- **THEN** su código nace con 0 % de descuento y la comisión por defecto; quien lo usa paga el precio del cupo

### Requirement: La comisión es un porcentaje de lo pagado

La comisión de la asociada SHALL ser su porcentaje sobre el valor que pagó la candidata, con el descuento del cupón ya aplicado, en la moneda de la venta.

#### Scenario: Venta con cupón de asociada

- **WHEN** el cupo cuesta 200000, el cupón de la asociada da 10 % y su comisión es 20 %
- **THEN** la venta es de 180000 COP y la comisión, de 36000 COP

### Requirement: Los cupones de precio fijo se señalan hasta pasarlos a porcentaje

Un cupón anterior a este cambio, de precio fijo (en USD), SHALL seguir cobrando ese precio y SHALL mostrarse en el admin con el aviso «Precio fijo: ponle un % de descuento». Al ponerle un porcentaje SHALL quedar atado al precio del cupo, en COP. Editar otros campos SHALL conservar su precio fijo.

#### Scenario: El admin convierte un cupón viejo

- **WHEN** el admin le pone 10 % a un cupón de 29 USD
- **THEN** el cupón deja de tener precio fijo y quien lo usa paga el 90 % del precio del cupo, en COP

