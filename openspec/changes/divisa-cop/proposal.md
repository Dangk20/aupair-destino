## Why

R9 de la reunión del 2026-08-05: todos los montos pasan de dólares a **pesos
colombianos**. Daniel lo cerró el 2026-10-12: **todo a COP y el precio del cupo
configurable desde Configuración**, sin fijarlo en el código.

Verificado en el código:

- El precio del cupo es una constante, `PRECIO_REGULAR = 35`, en `lib/ventas-aupair.js`
  y en `app/pago/page.jsx`. `toggle-acceso` también usa 35 por defecto.
- La moneda está escrita a mano, con dos formateadores distintos (`"en-US"` y `"es-CO"`),
  en ventas, comisiones, códigos promo, usuarios y `/pago`.
- Las tablas guardan el número sin moneda (`ventas.monto`, `comisiones.monto_comision`,
  `codigos_promo.precio_final`). Si solo se cambia la etiqueta, 35 dólares se leerían como 35 pesos.

En producción, al 2026-10-12, hay **5 ventas confirmadas (145 USD en total) y
4 códigos promo, a 25 y 29 USD**.

## What Changes

- **La moneda se guarda.** Columna `moneda` en `ventas`, `comisiones` y
  `codigos_promo`:
  - lo existente queda en `USD`, porque eso fue lo que se cobró, y no se convierte con una tasa inventada;
  - lo nuevo va en `COP`.
- **El precio del cupo se configura.** Va en `configuracion.precio_cupo_cop` y
  se edita en `/admin/configuracion`. Mientras no esté configurado:
  - `/pago` no muestra un precio inventado;
  - registrar una venta sin código responde con un error claro.
- **Un solo formateador** (`lib/moneda.js`), usado en ventas, comisiones,
  códigos promo, usuarios y `/pago`. Cada monto sale con su moneda: los
  históricos siguen diciendo USD.
- **Cupones = % de descuento sobre el precio del cupo** (decisión de Daniel,
  2026-10-12). Si el precio cambia en Configuración, todos los cupones lo
  siguen. Los 4 cupones de precio fijo en USD siguen cobrando eso, marcados
  «Precio fijo: ponle un % de descuento», hasta que el admin les ponga uno.
  El código que nace con cada asociada arranca en 0 %.
- **Comisiones:** el % de la asociada sobre lo pagado (con el descuento), en
  la moneda de la venta.
- **Usuarios:**
  - la columna «Pago» lee la venta confirmada (monto y moneda), en lugar del
    registro heredado de referidos;
  - activar el acceso a mano propone el precio configurado, en COP.

**Fuera de este change:** las pantallas heredadas `/admin/pagos` y
`/admin/referidos` (sin entrada en el menú, con datos de muestra) y el libro
heredado `referido_registros`. Quedan como deuda.

## Capabilities

### New Capabilities

- `divisa-y-precio`: en qué moneda se cobra, cuál es el precio del cupo y cómo se muestran los montos.

### Modified Capabilities

Ninguna archivada.

## Impact

- **Base:** migración `011_moneda_cop.sql` (columna `moneda` y lo existente en USD), registrada en `deploy/desplegar.sh`.
- **Librerías:** `lib/moneda.js` (nueva) y `lib/ventas-aupair.js` (`precioCupo()`, la moneda en ventas y comisiones).
- **Rutas:**
  - `GET /api/pago/precio` (nueva; se declara antes del handler);
  - `/api/ventas`, `/api/admin/toggle-acceso`, `/api/admin/codigos-promo`, `/api/admin/usuarias`, `/api/codigos-promo/validar`.
- **Pantallas:** `/pago`, `/admin/configuracion`, `/admin/ventas`, `/admin/comisiones`, `/admin/codigos-promo` y `/admin/usuarias`.
- **Al desplegar:** configurar el precio en COP antes de que entre una venta nueva sin código.
