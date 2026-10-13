## 1. Regla y datos

- [x] 1.1 `lib/asociada-aupair.js`: `candidatasDeAsociadas()` (mapa candidata → asociada, código y si pagó) con las dos consultas y la precedencia del pago
- [x] 1.2 `lib/tablero-aupair.js`: parámetro `asociadaId` que filtra con el mapa y añade `cupon` y `pago`

## 2. Panel de la asociada

- [x] 2.1 Declarar `GET /api/asociada/tablero` (rol asociada) en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs`; retirar de ambos `stats`, `usuarias-asignadas`, `usuarias/[id]` y sus entradas de «rotas»
- [x] 2.2 `app/api/asociada/tablero/route.js`: tablero filtrado sin `telefono`, `email`, `fecha_nacimiento` ni `no_leidos`
- [x] 2.3 `components/panel/TableroEtapas.jsx`: prop `soloLectura` (sin vista rápida, sin ficha, sin contacto) y píldora del cupón
- [x] 2.4 `app/asociada/page.jsx`: «Mis candidatas» con las tres cifras y el tablero; `app/asociada/usuarias/page.jsx` redirige a `/asociada`; menú sin la entrada duplicada
- [x] 2.5 Retirar `app/api/asociada/stats`, `app/api/asociada/usuarias-asignadas`, `app/api/asociada/usuarias/[id]` y `app/asociada/usuarias/[id]/page.jsx`

## 3. Admin

- [x] 3.1 `GET /api/admin/asociadas`: `candidatas` y `pagaron` por la regla, sin `referidos`; ajustar `/admin/asociadas` a esos campos
- [x] 3.2 `GET /api/admin/asociadas/[id]`: candidatas con `tablero({ asociadaId })`; `DELETE` sin la columna y con los cupones de la asociada en `asociada_id = NULL`
- [x] 3.3 `/admin/asociadas/[id]`: lista de sus candidatas en lugar de asignar/desasignar — y la lista `/admin/asociadas` lleva a ella (nombre y ojo); se retira el modal viejo «Detalle de la asesora», que nunca enlazaba a la página. Lo encontró Daniel al probar
- [x] 3.4 Retirar `app/api/admin/asociadas/asignar` (y declararlo en docs y humo); encender «Asociadas» en `app/admin/layout.jsx`

## 4. Registro

- [x] 4.1 `app/api/auth/register/route.js`: quitar la asignación de asesora (por código y por turno); conservar el guardado de `codigo_referido` y el enlace viejo a `referidos`

## 5. Verificación

- [x] 5.1 `grep asesora_asignada_id` en `app/`, `lib/` y `scripts/` sin resultados — sólo quedan dos comentarios que explican por qué se retiró
- [x] 5.2 `npm run build` y `node scripts/pruebas-humo.mjs` sin rojos y sin rutas «rotas» de la asociada — build bien; humo 634 en verde, 0 en rojo; sólo queda `/admin/reuniones` como rota
- [x] 5.3 Por API, con datos locales (Tati = asociada 10, cupón TATI0626): aparecen las que pagaron con su cupón; una registrada con su código sin pagar aparece como «Se registró»; una registrada con su código que paga con otro cupón sale; una venta anulada no cuenta; la respuesta no trae teléfono ni correo — verificado: #35 con `tati0626` en minúsculas sale «Se registró»; #15 registrada con TATI0626 y pagada con PRUE8451 sólo aparece en la asociada 33; la venta 11 anulada con el cupón de Tati no cuenta; claves de la respuesta: id, nombre, ciudad, foto_url, etapa, score, agencia, desde, cupon, pago. Datos de prueba revertidos
- [x] 5.4 Playwright como asociada 10: `/asociada` muestra cifras y tablero, sin chat ni enlace a perfil, en tablero y en lista; `/asociada/usuarias` redirige — 6 candidatas / 4 pagaron / 2 registradas; tocar la tarjeta no abre nada; lista sin TELÉFONO ni CORREO y con CUPÓN; 0 botones de chat y 0 enlaces a perfil; menú: Mis candidatas, Mis comisiones, Calendario, Configuración; sin errores de consola
- [x] 5.5 Playwright como admin: «Asociadas» en el menú, la lista cuenta por cupón, la ficha de Tati lista sus candidatas; borrar una asociada de prueba responde 200 y su cupón queda sin asociada — el primer borrado dio 500 por otra columna inexistente (`reuniones.asesora_id`); se corrigió para borrar sus horarios (`disponibilidad.asesora_id`) y las reuniones agendadas en ellos, y respondió 200. La ficha ya no devuelve `password` (antes era `SELECT *`)
- [x] 5.6 Registro nuevo con `TATI0626`: sin errores en el log del servidor y aparece en el tablero de Tati — cuenta de prueba «Cami Cupon» (`delivered+cami@resend.dev`)

## 6. Despliegue

- [ ] 6.1 Sin migración: `deploy/desplegar-codigo.sh` (o junto con el siguiente lote)
