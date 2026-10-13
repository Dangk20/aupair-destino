## Context

El acceso pagado son 7 columnas de `usuarios` (`PERMISOS_AL_PAGAR`), que sólo
enciende y apaga `lib/ventas-aupair.js`. `requierePermiso()` las lee de la base
en cada petición, así que quitarlas surte efecto sin cerrar la sesión de la
cuenta de origen. Todo sobre la capa de Destino Au Pair.

## Goals / Non-Goals

**Goals:** invitación por correo con vencimiento, registro por invitación,
traspaso de la venta y de los permisos, historial en las dos cuentas.

**Non-Goals:** cobrar la transferencia; heredar perfil, documentos o progreso;
transferir a una cuenta que ya existe; que la candidata la pida desde su panel.

## Decisions

### Tabla `transferencias_cupo` con el token hasheado

`id, origen_id, email, token_hash (SHA-256, único), estado
(pendiente|usada|cancelada), destino_id, venta_id, creada_por, vence_at,
created_at, usada_at`. El link lleva el token en claro; la base sólo su hash,
como debería hacer `reset_token`. Vencida = `pendiente` con `vence_at` pasada
(no hace falta un proceso que la cambie).
*Descartado:* columnas en `usuarios` como `reset_token`: no guardan quién
recibió el cupo ni el historial de invitaciones, y `usuarios` ya es ancha.

### El traspaso mueve la venta, no crea otra

`transferirCupo(origenId, destinoId)` en `lib/ventas-aupair.js`: mueve la
venta confirmada más reciente (`ventas.usuario_id`) y su fila de
`codigos_promo_usos`, apaga los permisos del origen y enciende los del destino.
Si el origen tenía acceso sin venta (activaciones viejas a mano), traspasa sólo
los permisos. Anular después esa venta le quita el acceso a la cuenta nueva,
que es quien tiene el cupo.
*Descartado:* anular la venta del origen y crear otra confirmada: suma un
ingreso que no existió y vuelve a contar el uso del código y la comisión.

### Reclamo atómico del token

`usar()` hace `UPDATE … SET estado='usada' WHERE id=? AND estado='pendiente'
AND vence_at > NOW()` antes de crear nada; si no afecta filas, la invitación ya
no vale. Si después falla la creación de la cuenta, vuelve a `pendiente`.
*Descartado:* validar y luego marcar: dos envíos del formulario crearían dos
cuentas con el mismo cupo.

### El registro por invitación es el mismo `POST /api/auth/register`

Con `invitacion`, exige que el correo sea el de la invitación, crea la cuenta
igual que siempre y luego llama a `usar()`. El JWT sale con `tiene_acceso`.
*Descartado:* una ruta de registro aparte: duplicaría validaciones de edad,
correo y avisos.

### Rutas

- `GET/POST/DELETE /api/admin/usuarias/[id]/transferir` (admin): ver la
  pendiente, crear o reenviar, cancelar.
- `GET /api/auth/invitacion?token=` (pública): sólo dice si es válida y el
  correo; no revela quién transfiere.

## Risks / Trade-offs

- El correo de la invitación sale por Resend; si falla, queda en `notificaciones` como siempre y el admin puede reenviar.
- La cuenta de origen sigue entrando sin acceso: si vuelve a pagar, es una venta nueva normal.

## Migration Plan

`013_transferencias_cupo.sql` después de la 012, antes del código
(`deploy/desplegar.sh`).
