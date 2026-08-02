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

- [x] 3.1 `app/api/auth/register/route.js`: no emitir cookie cuando la petición trae sesión de admin; el autorregistro de candidata sigue igual
- [x] 3.2 Verificar que crear un usuario desde `/admin/usuarias` ya no expulsa al admin
     *(Reproducido y corregido. El admin no se redirigía, pero la cookie ya había cambiado: su siguiente petición salía con rol usuaria y `/api/admin/**` respondía 403. Verificado que la respuesta ya no trae `Set-Cookie` y que el admin sigue entrando a `/api/admin/usuarias` (200). Regresión comprobada: el autorregistro público sigue iniciando sesión y devolviendo `/dashboard`.)*
- [x] 3.3 Revisar el mismo síntoma en el flujo de la candidata (el contrato dice "y de candidatas") y corregir si aparece
     *(Revisado, no aparece. `/api/auth/me` y `/api/dashboard/acceso` ya leen de la base, no del JWT, así que un cambio de permiso surte efecto sin volver a ingresar. El autorregistro es el único punto donde la candidata recibe cookie y es correcto que la reciba.)*
- [ ] 3.4 Corregir el botón de ingresar que no responde tras cerrar sesión
     *(**No reproducido.** Se intentó el ciclo completo —entrar, salir, volver a entrar— en desarrollo y con build de producción: funciona en ambos. Se cambió igual `router.push` por navegación de documento en ingreso, registro y las cuatro salidas, que es el patrón correcto con sesión en cookie y descarta esa clase de fallo, pero no está confirmado que sea la causa. **Hace falta preguntarle a la clienta los pasos exactos**: navegador, si pasa siempre, y qué hace el botón (nada, o muestra error).)*
- [x] 3.5 Cerrar sesión debe llevar a la pantalla de ingreso, no a la landing
     *(Reproducido y corregido. `app/dashboard/layout.jsx` era el único de los cuatro paneles que hacía `router.push("/")`. Verificado en el navegador: antes caía en la landing, ahora en `/login`.)*

## 4. Comisiones

- [x] 4.1 `app/api/admin/comisiones/route.js`: listado con asociada, candidata, código, montos, porcentaje, estado y fecha; filtros por asociada y estado; totales excluyendo las anuladas
- [x] 4.2 `app/api/admin/comisiones/[id]/pagar/route.js`: marcar como pagada con fecha; idempotente; rechazar si la comisión está anulada
     *(Verificado: pagar responde 200 con fecha; volver a pagarla devuelve `yaPagada` sin mover la fecha original; una comisión anulada responde 409.)*
- [x] 4.3 `app/admin/comisiones/page.jsx`: vista siguiendo el patrón de `/admin/ventas`, con estado vacío explicativo
- [x] 4.4 Añadir "Comisiones" al menú del panel
- [x] 4.5 Verificar que los totales cuadran con las ventas confirmadas del módulo de ventas
     *(Recorrido completo contra la base local: 2 ventas confirmadas con código × 20% = 11.60, y el histórico de comisiones da 11.60. Anular la venta 1 dejó su comisión en `anulada`, la sacó de los totales y su pago pasó a rechazarse con 409; reconfirmarla la devolvió a `pendiente` y a los totales. La base quedó como estaba.)*

## 5. Resumen del panel

> Va después del grupo 4: los accesos directos deben incluir ya la pantalla de comisiones.

- [x] 5.1 `app/admin/page.jsx`: retirar la tabla "Referidos y comisiones", el modal "Nuevo referente", las gráficas decorativas y los controles que no responden ("Rango de fechas", "Comparar con: mes anterior", "Exportar reporte"); la página deja de llamar a `/api/admin/referidos`
     *(La pantalla pasó de 548 líneas a 97.)*
- [x] 5.2 Poner el aviso de rediseño y las tarjetas de acceso a Ventas, Comisiones, Códigos promo, Usuarios, Perfiles y Sesiones
- [x] 5.3 El saludo lee el nombre de la sesión (`/api/auth/me`), en vez del `¡Bienvenida, Jenni!` quemado (`app/admin/page.jsx:271`)
- [x] 5.3b **También el pie de la barra lateral**: `app/admin/layout.jsx:104` muestra `Jenni Salgado` / `Admin CEO` quemados, y eso se ve en TODAS las pantallas del panel, no sólo en el Resumen
     *(Verificado en el navegador: entrando con `admin@destinoaupair.com` el panel saluda "¡Hola, Admin!" y el pie muestra "Admin Destino · admin@destinoaupair.com". Antes decía "Jenni Salgado" a los tres admins por igual.)*
- [x] 5.4 Comprobar que `/admin/referidos`, `/admin/pagos` y `/admin/sesiones` siguen funcionando: comparten las rutas que el Resumen deja de usar
     *(Las seis rutas implicadas responden 200 con sesión de admin: `/auth/me`, `/admin/referidos`, `/admin/stats`, `/admin/pagos/stats`, `/admin/pagos/movimientos` y `/admin/comisiones`.)*

## 6. Saneamiento de la arquitectura heredada

- [x] 6.1 Comprobar que ninguna pantalla viva importa `lib/db.js`, `lib/session.js` ni nada bajo `/app/app/` o `/app/api/app/`
     *(Sólo se importaban entre ellas. Ninguna pantalla enlaza a `/app/*` ni a `/api/app/*`.)*
- [x] 6.2 Eliminar `/app/app/*`, `/app/api/app/*` (10 rutas), `lib/db.js` y `lib/session.js`
     *(`app/app/*` ya no existía en el repositorio; sólo quedaban las 10 rutas de API, con 15 handlers.)*
- [x] 6.3 `middleware.js`: retirar la rama de Project Center (segundo JWT, mapa de roles y prefijos protegidos), dejando sólo la lógica de Destino Au Pair — commit aislado
     *(Commit `536ca06`, aislado. De 182 a 98 líneas. Verificados los 14 casos: sin sesión → `/login?from=…`; rol ajeno → `/dashboard`; rol correcto → 200; públicas → 200; `/app/dashboard` → 404.)*
- [x] 6.4 Eliminar `saasly-nextjs-1.0.0/` y reemplazar el `README.md` de la raíz (hoy es el de la plantilla)
     *(La carpeta no era la plantilla: contenía **un solo archivo**, `app/client/quotes/page.jsx`, otra página suelta de Project Center. README nuevo, y `package.json` deja de llamarse "saasly".)*
- [x] 6.5 Migración: eliminar de `usuarios` las columnas `experiencia_ninos`, `fecha_salida`, `estado_proceso`, `tiene_visa`, `fotos_perfil`
     *(`migrations/006`. Comprobado antes de borrar: 0 referencias con delimitador de palabra y ningún dato introducido por una usuaria —`estado_proceso` y `tiene_visa` sólo tenían su valor por defecto en las 13 filas—. Ojo: buscar `tiene_visa` a secas da 4 falsos positivos porque casa con `tiene_visa_j1`, que sí se usa. Aplicada en local; las columnas vivas siguen intactas. Reversión documentada en el propio archivo.)*
- [x] 6.6 Actualizar `CLAUDE.md`: ya no conviven dos aplicaciones; documentar las familias de columnas de `usuarios`
     *(También se corrigió la nota de la puerta de pago, que decía que un cambio de permiso surte efecto "en el siguiente ingreso" — ya no es cierto.)*

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
