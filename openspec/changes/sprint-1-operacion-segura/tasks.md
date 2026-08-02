## 1. Inventario y guards

- [x] 1.1 Levantar el inventario de las 82 rutas de `app/api/**` con su nivel de acceso (pública / con sesión / por rol / por permiso) y la página que consume cada una; dejarlo en `docs/rutas-y-acceso.md`
- [x] 1.2 `lib/session-aupair.js`: añadir `requiereRol(req, rol)`, `requierePermiso(req, seccion)` — leyendo el permiso de la base, no del JWT — y `requiereDueño(req, usuarioId)`
      *(compilan; la verificación en ejecución llega con las pruebas de humo de 1.3)*
- [x] 1.3 `scripts/pruebas-humo.mjs`: Node puro, sin dependencias; sesiones de prueba por rol y una aserción por regla del inventario; sale distinto de cero si algo falla
      *(528 aserciones. Verificado en local: la línea base es 323 en verde y 205 en rojo, y los rojos son exactamente el trabajo de los grupos 2 y 3.)*
- [x] 1.4 Integrar las pruebas de humo en `deploy/desplegar-codigo.sh` y `deploy/desplegar.sh`, de modo que un fallo detenga el despliegue
      *(Corren dentro del contenedor, donde `JWT_AUPAIR_SECRET` ya vive, así que verifican rol y permiso sin sacar el secreto del VPS. El `Dockerfile` copia `scripts/` a la imagen. Pendiente de ejecutarse contra producción en la tarea 8.7.)*

## 2. Barrido de control de acceso

- [x] 2.1 Rutas `/api/admin/**` (30): guard de rol admin en todas; verificar que ninguna quede sin él
     *(67 handlers pasaron de resolver el rol a mano a `requiereAdmin`/`requiereRol`; se cerró `GET /admin/eventos`, que no verificaba rol alguno. Pruebas de humo: 226/226.)*
- [x] 2.2 Rutas `/api/asociada/**`: guard de rol asociada y verificación de propiedad donde se reciba un id
     *(6/6 con `requiereRol`. La propiedad ya estaba resuelta dentro del `WHERE` de cada consulta —`asesora_asignada_id = session.id` y la cadena de referidas—, por eso no se veía en el barrido.)*
- [ ] 2.3 Rutas `/api/agencia/**`: guard de rol agencia y verificación de propiedad donde se reciba un id
     *(Rol: 5/5 hecho. **Propiedad: no se puede hacer** — no existe modelo de asignación agencia↔candidata, así que `/agencia/candidatas` entrega todas las candidatas a cualquier agencia. Definirlo es el ítem 7 del alcance, que depende de los talleres y va en el Sprint 3. Hoy hay una sola cuenta de agencia, así que no hay exposición real. Detalle en `docs/rutas-y-acceso.md`.)*
- [x] 2.4 Rutas `/api/dashboard/**`: sesión + permiso de sección leído de la base (documentos, mensajes, recursos, reuniones, comunidad)
     *(10 handlers con `requierePermiso`, que lee la columna de la base. Comprobado en ambas direcciones con usuarias reales: la 6 recibe 200 en documentos y 403 en recursos con un token que declara ambos.)*
- [x] 2.5 Revisar las rutas que reciben id por parámetro y añadir `requiereDueño` donde falte
     *(5 revisadas. 3 ya estaban acotadas en el `WHERE` — `/asociada/usuarias/[id]`, `/asociada/reuniones/[id]/confirmar` y `/ventas`, que ni siquiera recibe id. Las 2 de agencia quedan bloqueadas por la falta de modelo de asignación; ver 2.3. `requiereDueño` queda disponible en la librería para cuando el Sprint 3 defina ese modelo.)*
- [x] 2.6 Confirmar que las únicas rutas sin sesión son las públicas declaradas en el inventario
     *(112/112 sin sesión → 401; las 7 públicas responden. Verificado por las pruebas de humo.)*

## 3. Sesiones

- [ ] 3.1 `app/api/auth/register/route.js`: no emitir cookie cuando la petición trae sesión de admin; el autorregistro de candidata sigue igual
- [ ] 3.2 Verificar que crear un usuario desde `/admin/usuarias` ya no expulsa al admin
- [ ] 3.3 Revisar el mismo síntoma en el flujo de la candidata (el contrato dice "y de candidatas") y corregir si aparece
- [ ] 3.4 Corregir el botón de ingresar que no responde tras cerrar sesión
- [ ] 3.5 Cerrar sesión debe llevar a la pantalla de ingreso, no a la landing

## 4. Comisiones

- [ ] 4.1 `app/api/admin/comisiones/route.js`: listado con asociada, candidata, código, montos, porcentaje, estado y fecha; filtros por asociada y estado; totales excluyendo las anuladas
- [ ] 4.2 `app/api/admin/comisiones/[id]/pagar/route.js`: marcar como pagada con fecha; idempotente; rechazar si la comisión está anulada
- [ ] 4.3 `app/admin/comisiones/page.jsx`: vista siguiendo el patrón de `/admin/ventas`, con estado vacío explicativo
- [ ] 4.4 Añadir "Comisiones" al menú del panel
- [ ] 4.5 Verificar que los totales cuadran con las ventas confirmadas del módulo de ventas

## 5. Resumen del panel

> Va después del grupo 4: los accesos directos deben incluir ya la pantalla de comisiones.

- [ ] 5.1 `app/admin/page.jsx`: retirar la tabla "Referidos y comisiones", el modal "Nuevo referente", las gráficas decorativas y los controles que no responden ("Rango de fechas", "Comparar con: mes anterior", "Exportar reporte"); la página deja de llamar a `/api/admin/referidos`
- [ ] 5.2 Poner el aviso de rediseño y las tarjetas de acceso a Ventas, Comisiones, Códigos promo, Usuarios, Perfiles y Sesiones
- [ ] 5.3 El saludo lee el nombre de la sesión (`/api/auth/me`), en vez del `¡Bienvenida, Jenni!` quemado
- [ ] 5.4 Comprobar que `/admin/referidos`, `/admin/pagos` y `/admin/sesiones` siguen funcionando: comparten las rutas que el Resumen deja de usar

## 6. Saneamiento de la arquitectura heredada

- [ ] 6.1 Comprobar que ninguna pantalla viva importa `lib/db.js`, `lib/session.js` ni nada bajo `/app/app/` o `/app/api/app/`
- [ ] 6.2 Eliminar `/app/app/*`, `/app/api/app/*` (10 rutas), `lib/db.js` y `lib/session.js`
- [ ] 6.3 `middleware.js`: retirar la rama de Project Center (segundo JWT, mapa de roles y prefijos protegidos), dejando sólo la lógica de Destino Au Pair — commit aislado
- [ ] 6.4 Eliminar `saasly-nextjs-1.0.0/` y reemplazar el `README.md` de la raíz (hoy es el de la plantilla)
- [ ] 6.5 Migración: eliminar de `usuarios` las columnas `experiencia_ninos`, `fecha_salida`, `estado_proceso`, `tiene_visa`, `fotos_perfil`
- [ ] 6.6 Actualizar `CLAUDE.md`: ya no conviven dos aplicaciones; documentar las familias de columnas de `usuarios`

## 7. Respaldo de archivos

- [ ] 7.1 Script de respaldo en el VPS: empaqueta el volumen, rota con retención de 14 días, fuera del árbol público y con permisos restringidos
- [ ] 7.2 Programarlo en cron a diario y verificar que deja registro de éxito o fallo
- [ ] 7.3 **Probar una restauración real** sobre un respaldo y dejar constancia de la prueba con su fecha
- [ ] 7.4 Documentar el procedimiento de restauración en `deploy/`
- [ ] 7.5 Comprobar que los archivos de respaldo no se sirven por web

## 8. Verificación y cierre

- [ ] 8.1 Pruebas de humo en verde contra el entorno local
- [ ] 8.2 Recorrido manual por rol: admin, candidata, asociada y agencia entran y usan su área sin bloqueos indebidos
- [ ] 8.3 Recorrido de permisos: confirmar un pago con la sesión de la candidata abierta y comprobar que la sección se habilita sin volver a ingresar; anular y comprobar lo inverso
- [ ] 8.4 Recorrido de comisiones: venta con código → comisión pendiente → marcarla pagada → anular otra venta y comprobar que su comisión queda anulada y fuera de los totales
- [ ] 8.5 Entrar como admin y comprobar que el Resumen saluda con el nombre real y que cada acceso directo lleva a su módulo
- [ ] 8.6 `npm run build` sin errores
- [ ] 8.7 Desplegar con `deploy/desplegar.sh` (hay migración) y verificar en producción con las pruebas de humo
- [ ] 8.8 Actualizar la bitácora de `tech/cronograma-sprints-aupair.md` y la auditoría de arquitectura con lo retirado
- [ ] 8.9 Reporte de avance para la clienta (compromiso contractual del viernes)
