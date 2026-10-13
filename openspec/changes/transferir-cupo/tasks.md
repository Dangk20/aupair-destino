## 1. Base

- [x] 1.1 `migrations/013_transferencias_cupo.sql` y su condición en `deploy/desplegar.sh`

## 2. Lógica

- [x] 2.1 `lib/ventas-aupair.js`: `transferirCupo(origenId, destinoId)`
- [x] 2.2 `lib/notificaciones-aupair.js`: `enviarInvitacionCupo()`
- [x] 2.3 `lib/transferencias-aupair.js`: crear / reenviar, cancelar, pendienteDe, validar y usar (reclamo atómico)
- [x] 2.4 Hechos del historial: invitación enviada y cancelada (internos), cupo transferido y cupo heredado

## 3. Rutas

- [x] 3.1 Declarar `/api/admin/usuarias/[id]/transferir` y `/api/auth/invitacion` en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs`
- [x] 3.2 `app/api/admin/usuarias/[id]/transferir/route.js` (GET, POST, DELETE)
- [x] 3.3 `app/api/auth/invitacion/route.js` (GET)
- [x] 3.4 `POST /api/auth/register` con `invitacion`

## 4. Pantallas

- [x] 4.1 `/admin/usuarias`: acción «Transferir cupo» con su modal (enviar, reenviar, cancelar)
- [x] 4.2 `/register?invitacion=`: correo fijo, aviso de cupo pago; link inválido lo dice

## 5. Verificación

- [x] 5.1 Invitar desde una candidata con acceso: correo registrado en `notificaciones`, origen conserva acceso
- [x] 5.2 Errores: correo existente, segunda pendiente, origen sin acceso
- [x] 5.3 Reenviar invalida el link anterior; cancelar invalida el link
- [x] 5.4 Registrarse con el link: entra con acceso; origen sin acceso (403 en documentos); la venta pasa sin venta nueva; comisión intacta
- [x] 5.5 Link usado / vencido / cancelado: lo dice y no registra
- [x] 5.6 Historial de las dos cuentas
- [x] 5.7 `npm run build` y `node scripts/pruebas-humo.mjs`

### Resultado de la verificación (2026-10-13, local, API + Playwright)

- #27 (venta 14, código TATI0626, comisión 6) invita a `delivered+cupo@resend.dev`: aviso en `notificaciones`, #27 conserva acceso, hecho interno en su historial.
- Errores: correo existente → 409; segunda pendiente a otro correo → 409; #7 sin acceso → 409; candidata pidiendo la ruta → 403.
- Reenviar: el link anterior dice «no es válida… usa el link más reciente», el nuevo sirve. Cancelar: «fue cancelada»; cancelar dos veces → 404. Vencida (forzada en la base): lo dice y el registro responde 410.
- Registro con el link (correo distinto en el cuerpo, se ignora; edad 36 → rechazada; con 22 años → entra): #34 con los 7 permisos; #27 sin ellos (403 en documentos); venta 14 a nombre de #34, 8 ventas antes y después, comisión 6 intacta, uso del código movido; reusar el link → «ya se usó».
- Historial: #27 «Transfirió su cupo a Ana Cupo»; #34 «Heredó el cupo de Modo Local».
- Pantalla: el icono «Transferir cupo» sólo en candidatas con acceso; el modal muestra la pendiente con «Reenviar» y «Cancelar». `/register?invitacion=` con el correo fijo, sin código de referido y con el aviso de cupo pago; registro por formulario de #35 → `/dashboard` con documentos 200 y la venta 13 traspasada. Token inválido: el mensaje sin formulario.
- `npm run build` bien; `pruebas-humo.mjs` 662 en verde.

## 6. Despliegue

- [ ] 6.1 Junto con `historial-usuario` (`deploy/desplegar.sh`)
