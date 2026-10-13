## Why

R11 (reunión del 2026-08-05, adicional cotizado): Destino Au Pair **no
reembolsa**; lo que ofrece es que la candidata **venda su cupo** a otra
persona. Hoy no hay forma de hacerlo: el acceso pagado es de la cuenta
(`usuarios.tiene_acceso` y los `acceso_*`, encendidos por
`lib/ventas-aupair.js` al confirmar la venta), y lo único que el admin puede
hacer es anular la venta de una y crear otra a mano, que cuenta como un pago
nuevo y descuadra ventas y comisiones.

Decisiones de Daniel (2026-10-13):
- la cuenta de origen **pierde el acceso**, no se desactiva;
- la cuenta nueva **arranca de cero**: hereda sólo el cupo;
- el link **vence a los 30 días**;
- DAP **no cobra** la transferencia.

## What Changes

- **«Transferir cupo» en Usuarios** (sólo para quien tiene acceso). El admin
  escribe un correo y a ese correo llega un link para registrarse con el cupo.
  - Mientras no se use, el cupo sigue en la cuenta de origen.
  - El admin puede **reenviar** el link (renueva los 30 días) o **cancelar**
    la transferencia.
  - Una sola transferencia pendiente por cuenta; el correo no puede ser de una
    cuenta existente.
- **Registro por invitación** (`/register?invitacion=…`):
  - el correo viene fijo;
  - aplica la misma regla de edad que cualquier registro;
  - al crear la cuenta queda con acceso, sin pasar por `/pago`.
- **El traspaso**, de una vez y en la librería de ventas:
  - la venta confirmada pasa a la cuenta nueva (sin venta ni comisión nueva;
    la comisión de la asociada sigue siendo la misma);
  - la cuenta de origen pierde los permisos de pago; la nueva los recibe.
- **Historial de las dos cuentas** (R10): «Transfirió su cupo a <nombre>» y
  «Heredó el cupo de <nombre>». El envío y la cancelación de la invitación
  quedan como hechos internos de la cuenta de origen.
- **Correo:** aviso nuevo «Te transfirieron un cupo», por el dueño único del
  correo.

## Capabilities

### New Capabilities

- `transferir-cupo`: cómo se transfiere un cupo pagado de una cuenta a una
  persona nueva.

### Modified Capabilities

Ninguna archivada.

## Impact

- **Migración `013_transferencias_cupo.sql`:** tabla `transferencias_cupo`.
- **Librerías:**
  - `lib/transferencias-aupair.js` (nueva): crear, reenviar, cancelar,
    validar el token y usarlo;
  - `lib/ventas-aupair.js`: `transferirCupo(origenId, destinoId)`;
  - `lib/notificaciones-aupair.js`: `enviarInvitacionCupo()`;
  - `lib/historial-aupair.js`: hechos nuevos.
- **Rutas:**
  - `GET/POST/DELETE /api/admin/usuarias/[id]/transferir` (nueva, admin);
  - `GET /api/auth/invitacion` (nueva, pública: valida el token);
  - `POST /api/auth/register` acepta `invitacion`.
- **Pantallas:**
  - `/admin/usuarias`: acción «Transferir cupo» y su modal;
  - `/register`: modo invitación.
- **Depende de `historial-usuario`** (R10).
