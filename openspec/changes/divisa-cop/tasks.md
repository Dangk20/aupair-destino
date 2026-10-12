## 1. Base y reglas

- [x] 1.1 `migrations/011_moneda_cop.sql` (idempotente) y registro en `deploy/desplegar.sh`
- [x] 1.2 `lib/moneda.js · formatoMoneda()`
- [x] 1.3 `lib/ventas-aupair.js`: `precioCupo()`; la venta toma la moneda del código o COP; la comisión, la de su venta; sin precio configurado → error

## 2. Rutas (la nueva, declarada en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` antes del handler)

- [x] 2.1 `GET /api/pago/precio`
- [x] 2.2 `/api/ventas` y `/api/admin/toggle-acceso` con `precioCupo()`
- [x] 2.3 `/api/admin/codigos-promo`: crear y editar el precio dejan el código en COP; `/api/codigos-promo/validar` devuelve la moneda
- [x] 2.4 `/api/admin/usuarias`: pago y comisión desde `ventas` y `comisiones`

## 3. Pantallas

- [x] 3.1 `/admin/configuracion`: precio del cupo en COP
- [x] 3.2 `/pago`: precio de la API, con su moneda; sin precio, «por confirmar»
- [x] 3.3 `/admin/ventas`, `/admin/comisiones`, `/admin/codigos-promo` (aviso de USD), `/admin/usuarias` (sin «Corregir monto»; activar propone el precio) con `formatoMoneda`

## 3b. Cupones y comisiones conectados al precio (pedido de Daniel, 2026-10-12)

- [x] 3b.1 Migración 011: `codigos_promo.descuento_porcentaje`; `precio_final` admite NULL
- [x] 3b.2 `precioConCodigo()`; ventas, validar, usar y la lista del admin calculan el precio del cupón con el precio vigente
- [x] 3b.3 Admin de cupones: crear y editar por % (0–100), con la vista previa de lo que paga; aviso en los de precio fijo; editarlos sin % conserva su precio
- [x] 3b.4 El código de una asociada nueva nace con 0 %

## 4. Verificación

- [x] 4.1 `npm run build` y `node scripts/pruebas-humo.mjs`
- [x] 4.2 Migración aplicada dos veces en local: lo existente en USD, defaults en COP
- [x] 4.3 Sin precio: `/pago` dice «por confirmar»; venta sin código → error claro
- [x] 4.4 Con precio 150000: `/pago` lo muestra; activar el acceso de una candidata crea la venta en COP; Ventas muestra las viejas en USD y la nueva en COP
- [x] 4.5 Código viejo en USD marcado; al editarlo queda en COP; venta con código de asociada → comisión en COP

### Resultado de la verificación (2026-10-12, local, API + Playwright)

- Migración 011 aplicada dos veces: las 5 ventas, 2 comisiones y 3 cupones existentes quedaron en USD; los defaults, en COP; `descuento_porcentaje` NULL en los heredados.
- Sin precio: `GET /api/pago/precio` → `null`; venta sin código → 409 «El precio del cupo todavía no está configurado…». Precio «12.5» → 400.
- Precio 150000: activar a mano el acceso de la candidata 26 crea la venta en 150000 COP.
- Cupón PRUEBA15 (15 %): con el cupo en 150000 paga 127500; al subirlo a 200000, paga 170000 (validar y `/pago`, que tacha 200000).
- TATI0626 (asociada, 20 % de comisión) pasa de 29 USD fijo a 10 %: venta de 180000 COP y comisión de 36000 COP. Editar los usos de un cupón heredado sin % conserva sus 29 USD.
- Asociada nueva: su código nace con 0 % y 20 % de comisión, sin depender del precio.
- Ventas, Comisiones y Cupones muestran cada monto en su moneda y los totales separados («$ 450.000 COP · $128 USD»). Usuarios lee el pago de la venta real.
- `npm run build` bien; `pruebas-humo.mjs` en verde (incluye `/pago/precio`).

## 5. Despliegue

- [ ] 5.1 `deploy/desplegar.sh`; configurar el precio en producción en cuanto suba
