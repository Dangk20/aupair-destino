## Context

Los montos viven en tres tablas sin moneda y en un libro heredado (`referido_registros`) que el proveedor dejó en paralelo a `ventas`. `configuracion` ya es una tabla clave-valor editable desde `/admin/configuracion`.

## Decisions

**1. No convertir lo histórico.** Se guardó lo que se cobró, en USD. Convertirlo exige una tasa que nadie fijó y falsea los reportes. Columna `moneda CHAR(3)`: se añade con `DEFAULT 'USD'` (así las filas existentes quedan en USD) y en la misma migración el default pasa a `'COP'`.

**2. El precio es `configuracion.precio_cupo_cop`, en pesos enteros.** No se siembra un valor: si se sembrara, sería un precio inventado. Mientras falte, la venta sin código se rechaza (409) y `/pago` lo dice. `precioCupo()` en `lib/ventas-aupair.js` es la única lectura.

**3. `GET /api/pago/precio` (sesión).** Lo necesita `/pago`, que es de la candidata y no puede leer la configuración del admin. Devuelve `{ precio, moneda }` o `{ precio: null }`.

**4. Un formateador, `lib/moneda.js · formatoMoneda(monto, moneda)`.** COP sin decimales con separador de miles (`$ 150.000 COP`); USD con hasta dos decimales (`$35 USD`). Reemplaza los cinco `money()` locales.

**5. Usuarios lee la venta, no el libro heredado.** La columna «Pago» y el detalle salen de la última venta confirmada (`ventas`) y su comisión (`comisiones`). El lápiz «Corregir monto» editaba `referido_registros`, que deja de mostrarse: se retira. Para corregir un monto se anula la venta y se confirma de nuevo en Ventas, que es el flujo dueño (`lib/ventas-aupair.js`).

**6. El cupón guarda un porcentaje, no un precio.** `codigos_promo.descuento_porcentaje` (0–100). `precioConCodigo(codigo, precioCupo)` en `lib/ventas-aupair.js` es la única regla: `round(cupo × (1 − %/100))` en COP; si el cupón no tiene porcentaje (heredado), su `precio_final` en su moneda. `precio_final` pasa a admitir NULL y sólo lo usan los heredados. La venta congela el monto: cambiar el precio del cupo no altera ventas ya registradas.

**7. La comisión no cambia de regla.** Ya era `% × monto de la venta`; con el cupón en %, sigue siendo sobre lo pagado. Sólo gana la moneda.

**8. La asociada nueva no depende del precio.** Su código nace con 0 % (antes, 29 USD fijo), así que crear una asociada no exige tener el precio configurado.

## Risks / Trade-offs

- **[Se despliega sin precio configurado]** → Las ventas sin código se rechazan hasta configurarlo. Es preferible a cobrar un precio inventado. Va en la lista del despliegue.
- **[Códigos en USD siguen activos]** → Funcionan en USD hasta que el admin los edite; el aviso en la lista lo hace visible.
- **[Pantallas heredadas en USD]** → `/admin/pagos` y `/admin/referidos` no están en el menú; quedan como deuda anotada.

## Migration Plan

`011_moneda_cop.sql`, idempotente; condición en `desplegar.sh`: «no existe `ventas.moneda`». Reversa: el código anterior ignora la columna.
