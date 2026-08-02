## 1. Inventario y guards

- [ ] 1.1 Levantar el inventario de las 82 rutas de `app/api/**` con su nivel de acceso (pública / con sesión / por rol / por permiso) y la página que consume cada una; dejarlo en `docs/rutas-y-acceso.md`
- [ ] 1.2 `lib/session-aupair.js`: añadir `requiereRol(req, rol)`, `requierePermiso(req, seccion)` — leyendo el permiso de la base, no del JWT — y `requiereDueño(req, usuarioId)`
- [ ] 1.3 `scripts/pruebas-humo.mjs`: Node puro, sin dependencias; sesiones de prueba por rol y una aserción por regla del inventario; sale distinto de cero si algo falla
- [ ] 1.4 Integrar las pruebas de humo en `deploy/desplegar-codigo.sh` y `deploy/desplegar.sh`, de modo que un fallo detenga el despliegue

## 2. Barrido de control de acceso

- [ ] 2.1 Rutas `/api/admin/**` (30): guard de rol admin en todas; verificar que ninguna quede sin él
- [ ] 2.2 Rutas `/api/asociada/**`: guard de rol asociada y verificación de propiedad donde se reciba un id
- [ ] 2.3 Rutas `/api/agencia/**`: guard de rol agencia y verificación de propiedad donde se reciba un id
- [ ] 2.4 Rutas `/api/dashboard/**`: sesión + permiso de sección leído de la base (documentos, mensajes, recursos, reuniones, comunidad)
- [ ] 2.5 Revisar las rutas que reciben id por parámetro y añadir `requiereDueño` donde falte
- [ ] 2.6 Confirmar que las únicas rutas sin sesión son las públicas declaradas en el inventario

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

## 5. Saneamiento de la arquitectura heredada

- [ ] 5.1 Comprobar que ninguna pantalla viva importa `lib/db.js`, `lib/session.js` ni nada bajo `/app/app/` o `/app/api/app/`
- [ ] 5.2 Eliminar `/app/app/*`, `/app/api/app/*` (10 rutas), `lib/db.js` y `lib/session.js`
- [ ] 5.3 `middleware.js`: retirar la rama de Project Center (segundo JWT, mapa de roles y prefijos protegidos), dejando sólo la lógica de Destino Au Pair — commit aislado
- [ ] 5.4 Eliminar `saasly-nextjs-1.0.0/` y reemplazar el `README.md` de la raíz (hoy es el de la plantilla)
- [ ] 5.5 Migración: eliminar de `usuarios` las columnas `experiencia_ninos`, `fecha_salida`, `estado_proceso`, `tiene_visa`, `fotos_perfil`
- [ ] 5.6 Actualizar `CLAUDE.md`: ya no conviven dos aplicaciones; documentar las familias de columnas de `usuarios`

## 6. Respaldo de archivos

- [ ] 6.1 Script de respaldo en el VPS: empaqueta el volumen, rota con retención de 14 días, fuera del árbol público y con permisos restringidos
- [ ] 6.2 Programarlo en cron a diario y verificar que deja registro de éxito o fallo
- [ ] 6.3 **Probar una restauración real** sobre un respaldo y dejar constancia de la prueba con su fecha
- [ ] 6.4 Documentar el procedimiento de restauración en `deploy/`
- [ ] 6.5 Comprobar que los archivos de respaldo no se sirven por web

## 7. Verificación y cierre

- [ ] 7.1 Pruebas de humo en verde contra el entorno local
- [ ] 7.2 Recorrido manual por rol: admin, candidata, asociada y agencia entran y usan su área sin bloqueos indebidos
- [ ] 7.3 Recorrido de permisos: confirmar un pago con la sesión de la candidata abierta y comprobar que la sección se habilita sin volver a ingresar; anular y comprobar lo inverso
- [ ] 7.4 Recorrido de comisiones: venta con código → comisión pendiente → marcarla pagada → anular otra venta y comprobar que su comisión queda anulada y fuera de los totales
- [ ] 7.5 `npm run build` sin errores
- [ ] 7.6 Desplegar con `deploy/desplegar.sh` (hay migración) y verificar en producción con las pruebas de humo
- [ ] 7.7 Actualizar la bitácora de `tech/cronograma-sprints-aupair.md` y la auditoría de arquitectura con lo retirado
- [ ] 7.8 Reporte de avance para la clienta (compromiso contractual del viernes)
