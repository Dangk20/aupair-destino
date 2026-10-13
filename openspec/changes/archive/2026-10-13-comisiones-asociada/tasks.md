## 1. Lectura y ruta

- [x] 1.1 `lib/comisiones-aupair.js`: `listarComisiones()` y `codigosDeAsociada()`; la ruta del admin la usa sin cambiar su respuesta
- [x] 1.2 Declarar `GET /api/asociada/comisiones` en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs`; crear la ruta

## 2. Pantalla

- [x] 2.1 `components/panel/PanelComisiones.jsx` con `modo`; `/admin/comisiones` lo usa
- [x] 2.2 `/asociada/comisiones` y «Mis comisiones» en su menú

## 3. Verificación

- [x] 3.1 `npm run build` y `node scripts/pruebas-humo.mjs`
- [x] 3.2 La asociada dueña de TATI0626 ve sólo sus comisiones, sin «Pagar» ni correos; los totales por moneda; su código con el precio vigente
- [x] 3.3 Otra asociada no ve nada de ella; otro rol → 403
- [x] 3.4 El admin sigue viendo y pagando igual que antes

### Resultado de la verificación (2026-10-12, local, API + Playwright)

- Asociada #10 (dueña de TATI0626): «Mis comisiones» en su menú; ve sus 4 comisiones (2 en COP, 2 heredadas en USD), los totales por moneda («$ 60.000 COP · $11.6 USD» por pagar), su código con el 10 %, lo que paga hoy quien lo usa ($ 180.000 COP) y su 20 %; sin «Pagar», sin filtro por asociada, sin correos en la respuesta.
- Asociada #23: lista vacía; `?asociada=10` se ignora (el id sale de la sesión). Admin y agencia → 403 en `/api/asociada/comisiones`.
- El admin conserva su respuesta (con `asociadas` y correos) y su pantalla, ahora sobre `PanelComisiones`.
- `npm run build` bien; `pruebas-humo.mjs` en verde.

## 4. Despliegue

- [x] 4.1 Junto con `divisa-cop` (`deploy/desplegar.sh`) — desplegado el 2026-10-13
