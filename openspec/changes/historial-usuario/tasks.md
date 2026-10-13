## 1. Base

- [x] 1.1 `migrations/012_historial_referencia.sql`: columna `referencia`, índice único y relleno (sesiones, documentos, ventas confirmadas); idempotente
- [x] 1.2 Registrar la 012 en `deploy/desplegar.sh` con su condición

## 2. Registrar los hechos

- [x] 2.1 `lib/historial-aupair.js`: `referencia` en `registrarHecho()` (INSERT IGNORE) y los hechos nuevos en `HECHOS`
- [x] 2.2 Sesión completada y curso terminado en `POST /api/dashboard/completar`
- [x] 2.3 Documento cargado / reemplazado / retirado en `/api/dashboard/documentos` y retirado por el equipo en `/api/admin/perfiles/[id]/documentos`
- [x] 2.4 Pago confirmado y anulado en `lib/ventas-aupair.js`

## 3. Pantalla

- [x] 3.1 Modal «Ver» de `/admin/usuarias`: `LineaDeTiempo` en modo revisión y «Ver perfil»

## 4. Verificación

- [x] 4.1 Aplicar la 012 en local dos veces: el relleno no duplica
- [x] 4.2 Completar una sesión dos veces → un solo hecho; completar todas → «Terminó el curso» una vez
- [x] 4.3 Cargar, reemplazar y retirar un documento → tres hechos
- [x] 4.4 Confirmar y anular una venta → «Pagó su cupo» y «Se anuló el pago de su cupo» (no se confunde con la etapa «Pago confirmado» de la agencia)
- [x] 4.5 «Ver» en Usuarios muestra el historial; la candidata ve el suyo sin autor ni internos
- [x] 4.6 `npm run build` y `node scripts/pruebas-humo.mjs`

### Resultado de la verificación (2026-10-13, local, API + Playwright)

- 012 aplicada dos veces: 93 hechos las dos veces (73 del relleno: 40 sesiones, 4 cursos, 22 documentos, 7 pagos).
- Candidata #34: las 8 sesiones (la 1 y la 8 marcadas dos veces) → 8 hechos y un solo «Terminó el curso».
- Cargó Pasaporte → «Cargó Pasaporte»; el segundo intento lo bloquea la regla de documento cerrado (el reemplazo se registra cuando una observación lo reabre); el admin lo retiró → «Se retiró Pasaporte (Revision Admin)».
- Anular y reconfirmar la venta 14 → «Se anuló el pago de su cupo» y «Pagó su cupo en Destino Au Pair», con «$ 120.000 COP» en el detalle del admin. Se renombró de «Pago confirmado» para no confundirlo con la etapa de la agencia.
- «Ver» en Usuarios muestra etapa, recorrido e historial con autor, y «Ver perfil». `/api/dashboard/historial` (candidata) sin autor ni detalle.
- `npm run build` bien; `pruebas-humo.mjs` 662 en verde.

## 5. Despliegue

- [ ] 5.1 Junto con `transferir-cupo` (`deploy/desplegar.sh`; la 012 antes que la 013)
