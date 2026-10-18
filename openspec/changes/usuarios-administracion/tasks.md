## 1. Base y seguridad
- [x] 1.1 Migración `014_cuenta_activa.sql` (idempotente)
- [x] 1.2 Login: sin logs de secretos, columnas explícitas, rechaza cuenta desactivada
- [x] 1.3 `/api/auth/me` y `requierePermiso` respetan `cuenta_activa`

## 2. API
- [x] 2.1 `GET /api/admin/usuarias`: sólo datos de cuenta, sin tablas heredadas; `POST` crea con rol e invita por correo; se retira `PUT`
- [x] 2.2 `PUT /api/admin/usuarias/[id]`: sólo nombre, apellido, correo (único) y teléfono
- [x] 2.3 `POST /api/admin/usuarias/[id]/restablecer` y `PUT /api/admin/usuarias/[id]/estado`
- [x] 2.4 `cambiar-rol`: roles válidos, sin `referidos`, sin auto-cambio ni quedar sin admins
- [x] 2.5 `toggle-acceso`: sólo secciones; sin libro heredado; se retira `PUT`
- [x] 2.6 `POST /api/admin/ventas/registrar` (vía `confirmarAccesoUsuario`)
- [x] 2.7 Se retiran `usuarios/stats`, `usuarios/actividad`, `usuarios/top-referentes`
- [x] 2.8 `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` al día

## 3. Pantallas
- [x] 3.1 Usuarios reescrita (administración de cuentas)
- [x] 3.2 Ventas: «Registrar pago» y «Transferir cupo»
- [x] 3.3 Se retira `/admin/cambiar-roles`; `CLAUDE.md` al día

## 4. Verificación
- [x] 4.1 `npm run build` y humo sin rojos — build en verde; humo 615 en verde, 0 en rojo (10 aserciones menos: rutas retiradas)
- [x] 4.2 Recorrido: crear con rol, editar, cambiar rol, accesos, restablecer, desactivar (no entra) y reactivar; cifras = pestañas; registrar pago y transferir en Ventas; último admin protegido — 25 comprobaciones por API en verde (crear agencia → link → crea su contraseña → entra a /agencia; correo repetido 409; editar sin `tiene_acceso`; rol; sin auto-cambio ni auto-desactivar; toggle-acceso rechaza `tiene_acceso`; restablecer; desactivada no entra (403) y su sesión abierta sale (`/me` 401); reactivada entra; registrar pago → acceso, anular → sin acceso; no a una no-candidata). Pantallas sin errores de consola. «Último admin» cubierto por código (`adminsActivosSin`); en local hay 5 admins. Datos de prueba borrados
