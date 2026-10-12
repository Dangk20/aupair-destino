## Why

R18 (reunión del 2026-08-05, dentro del contrato, Sprint 3): **la asociada ve
sus ventas y el balance de sus comisiones.** Hoy no tiene cómo: su panel
(`/asociada`) tiene Inicio, Mis candidatas, Calendario y Configuración, y
ninguna pantalla ni ruta le muestra una venta o una comisión. Sólo el admin las
ve, en `/admin/comisiones`.

Los datos ya existen y son correctos: `lib/ventas-aupair.js` genera una
comisión por cada venta confirmada con el código de una asociada
(`comisiones.asociada_id`), con su moneda desde `divisa-cop`.

Regla del proyecto: una interfaz, permisos por rol. La asociada ve **la misma
pantalla de Comisiones** del admin, con sus permisos.

## What Changes

- **«Mis comisiones» en el menú de la asociada.** Es la misma pantalla que la
  del admin:
  - los mismos totales: por pagar, pagado e histórico, por moneda;
  - la misma lista, filtrada a lo suyo.
- **Lo que no ve la asociada:**
  - el botón «Pagar»;
  - el filtro por asociada;
  - las comisiones de otras;
  - el correo de las candidatas.
- **Sus códigos, arriba de la lista.** Por cada código: el descuento, cuánto
  paga hoy quien lo usa, su porcentaje de comisión, los usos y lo recaudado.
- **Una sola lectura.** La consulta de comisiones pasa a `lib/comisiones-aupair.js`,
  que la usan la ruta del admin y la nueva de la asociada.
- **Rutas:** `GET /api/asociada/comisiones` es nueva y exige el rol asociada;
  siempre devuelve solo lo suyo.

## Capabilities

### New Capabilities

- `comisiones-asociada`: qué ve la asociada de sus ventas, sus comisiones y sus códigos.

### Modified Capabilities

Ninguna archivada.

## Impact

- **Librería:** `lib/comisiones-aupair.js` (nueva).
- **Rutas:** `app/api/admin/comisiones/route.js` usa la librería. `app/api/asociada/comisiones/route.js` es nueva.
- **Pantallas:**
  - `components/panel/PanelComisiones.jsx` (nueva, sale de `/admin/comisiones`);
  - `/admin/comisiones` y `/asociada/comisiones`;
  - el menú de la asociada.
- **Sin migración.**
- **Fuera de este change:** el Inicio de la asociada y «Mis candidatas» siguen
  rotos por `usuarios.asesora_asignada_id`, que no existe. Es deuda declarada
  en `docs/rutas-y-acceso.md`.
