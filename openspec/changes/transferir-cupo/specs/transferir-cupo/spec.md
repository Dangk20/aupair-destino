## ADDED Requirements

### Requirement: El admin invita a una persona nueva a recibir el cupo

El admin SHALL poder transferir el cupo de una candidata con acceso escribiendo
un correo. El sistema SHALL enviar a ese correo un link de registro que vence a
los 30 días. NO SHALL aceptar un correo de una cuenta existente, ni una segunda
transferencia pendiente para la misma cuenta, ni transferir desde una cuenta
sin acceso. Mientras la invitación no se use, la cuenta de origen SHALL
conservar su acceso. El admin SHALL poder reenviar la invitación (renueva el
vencimiento y deja sin efecto el link anterior) o cancelarla.

#### Scenario: Envía la invitación

- **WHEN** el admin transfiere el cupo de una candidata con acceso a `nueva@correo.com`
- **THEN** sale el correo con el link, la candidata conserva su acceso y su historial registra (interno) la invitación

#### Scenario: Correo de una cuenta existente

- **WHEN** el admin escribe el correo de una cuenta que ya existe
- **THEN** recibe un error y no se crea la invitación

#### Scenario: Cancela

- **WHEN** el admin cancela una invitación pendiente
- **THEN** el link deja de servir y la candidata conserva su acceso

### Requirement: La persona invitada se registra con el cupo

Con un link vigente, `/register` SHALL mostrar el correo de la invitación fijo
y el aviso de que el cupo ya está pago. Al registrarse, la cuenta nueva SHALL
quedar con los permisos de pago, sin pasar por `/pago`, y arrancar de cero
(sin perfil, documentos ni progreso de la cuenta de origen). La regla de edad
SHALL ser la de cualquier registro. Un link vencido, cancelado o ya usado
SHALL decirlo y no SHALL dar acceso.

#### Scenario: Se registra

- **WHEN** la persona abre el link vigente y completa el registro
- **THEN** entra a su panel con acceso, y la cuenta de origen ya no tiene acceso

#### Scenario: Link vencido o usado

- **WHEN** alguien abre un link vencido, cancelado o ya usado
- **THEN** ve que la invitación ya no es válida y no puede registrarse con ella

### Requirement: El cupo se traspasa sin crear un pago nuevo

Al usarse la invitación, la venta confirmada de la cuenta de origen SHALL pasar
a la cuenta nueva, con su monto, moneda, código y comisión intactos. NO SHALL
crearse una venta ni una comisión nueva. La cuenta de origen SHALL perder los
permisos de pago y seguir pudiendo entrar. El historial de la cuenta de origen
SHALL decir «Transfirió su cupo a <nombre>» y el de la nueva «Heredó el cupo
de <nombre>».

#### Scenario: Ventas después del traspaso

- **WHEN** se usa la invitación de una candidata con una venta confirmada de $150.000 COP
- **THEN** Ventas muestra esa misma venta a nombre de la cuenta nueva, sin ventas nuevas, y la comisión de la asociada no cambia

#### Scenario: Historial de las dos cuentas

- **WHEN** el admin abre «Ver» de cada una
- **THEN** la de origen dice «Transfirió su cupo a <nueva>» y la nueva «Heredó el cupo de <origen>»
