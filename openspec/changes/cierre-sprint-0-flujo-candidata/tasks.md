## 1. Códigos promo: conteo real y camino único

- [x] 1.1 Migración: índice único sobre `codigos_promo_usos (codigo_id, usuario_id)` y columna `estado` en `comisiones` que admita `anulada`
- [x] 1.2 `lib/ventas-aupair.js`: extraer `consumirCodigo(venta)` y `liberarCodigo(venta)` como operaciones internas de `confirmarVenta`
- [x] 1.3 `lib/ventas-aupair.js`: implementar `anularVenta(ventaId)` — revierte estado, libera cupo, anula comisión y apaga los permisos concedidos
- [x] 1.4 `lib/ventas-aupair.js`: implementar `confirmarAccesoUsuario(usuarioId, { monto })` — resuelve la venta pendiente de la candidata, o crea una atribuyendo `usuarios.codigo_promo_usado` si existe, y delega en `confirmarVenta`
- [x] 1.5 `app/api/admin/toggle-acceso/route.js`: al activar acceso, delegar en `confirmarAccesoUsuario` y eliminar su conteo propio de códigos; al desactivar, delegar en `anularVenta`
- [x] 1.6 `app/api/admin/confirmar-pago/route.js` y `app/api/admin/ventas/[id]/{confirmar,anular}/route.js`: reducirlos a envoltorios de las funciones de `lib/ventas-aupair.js`
- [x] 1.7 Script reejecutable `scripts/reconciliar-usos-codigos.js` que iguale `codigos_promo.usos_actuales` al conteo real de `codigos_promo_usos` y reporte las diferencias corregidas
- [x] 1.8 `app/api/admin/codigos-promo/route.js`: exponer usos confirmados y aplicaciones pendientes por código
- [x] 1.9 `app/admin/codigos-promo/page.jsx`: mostrar ambos números y evaluar el agotamiento sólo contra los confirmados

## 2. Documentos: almacenamiento fuera de `public/` y acceso autenticado

- [ ] 2.1 (requiere acceso al VPS — procedimiento listo en `deploy/MIGRAR-DOCUMENTOS.md`) Inventariar en el VPS qué archivos existen bajo el volumen `uploads` y dejar constancia del resultado en las notas técnicas privadas
- [x] 2.2 `lib/almacenamiento-archivos.js`: resolver `UPLOADS_DIR` (por defecto `<cwd>/almacenamiento`), guardar archivos, resolver referencias y verificar que la ruta resuelta no escape del directorio
- [x] 2.3 `app/api/dashboard/documentos/route.js`: escribir mediante el nuevo módulo y guardar en `documentos_usuario.url` la referencia relativa
- [x] 2.4 `app/api/documentos/[id]/route.js`: descarga autenticada — 401 sin sesión, 403 si no es la dueña ni rol administrativo, 404 con cuerpo identificable si el archivo no está en el almacenamiento
- [x] 2.5 Endpoints de listado (dashboard y admin): incluir por documento si su archivo está disponible
- [x] 2.6 `app/admin/perfiles/[id]/page.jsx` y `app/dashboard/documentos/page.jsx`: apuntar el "ver" a la nueva ruta y mostrar el estado "archivo no disponible" con la acción de recarga para la candidata
- [x] 2.7 Migración de datos: normalizar `documentos_usuario.url` al formato de referencia relativa, y procedimiento de movimiento de archivos al nuevo directorio documentado en `deploy/`
- [x] 2.8 `docker-compose.yml` y `Dockerfile`: montar el volumen en la nueva ruta de datos y declarar `UPLOADS_DIR`
- [x] 2.9 Confirmar que ninguna ruta `/uploads/...` sigue sirviendo documentos y retirar los archivos residuales de `public/uploads`
- [x] 2.10 Recursos del curso: el volumen reapuntado los dejaba sin persistencia, así que migran al mismo almacenamiento — `lib/almacenamiento-archivos.js` (renombrado y generalizado), `app/api/admin/recursos/route.js` y la ruta autenticada `app/api/sesion-recursos/[id]/archivo/route.js` con permiso `acceso_recursos` leído de la BD

## 3. Validación de campos obligatorios del perfil

- [x] 3.1 `lib/campos-perfil.js`: declarar por sección y por parte los campos obligatorios con su etiqueta visible y su condición `requeridoSi`
- [x] 3.2 `lib/campos-perfil.js`: exponer `validarSeccion`, `camposFaltantes` y `perfilCompleto` derivados de esa declaración
- [x] 3.3 `app/dashboard/perfil/evaluacion/page.jsx`: usar la fuente única, bloquear el avance y el salto de sección, marcar cada campo en rojo con su mensaje, mostrar el resumen de pendientes y llevar el foco al primero
- [x] 3.4 `app/dashboard/perfil/evaluacion/page.jsx`: permitir el guardado parcial informando lo que falta, y limpiar la marca de error de un campo al diligenciarlo
- [x] 3.5 `app/dashboard/perfil/agencia/page.jsx`: aplicar las mismas reglas y reemplazar el criterio de "la mitad de los campos" por la exigencia completa
- [x] 3.6 `app/api/dashboard/perfil/route.js`: validar en servidor, aceptar guardados parciales y devolver la lista de campos faltantes; impedir marcar el perfil como completo sin cumplirlos
- [x] 3.7 Unificar el cálculo de progreso de `app/dashboard/perfil/page.jsx` y del panel admin sobre la misma fuente, para que progreso y validación no discrepen
- [x] 3.8 Distinguir en pantalla los campos obligatorios de los opcionales antes de validar
- [x] 3.9 Medir cuántos perfiles existentes quedan incompletos bajo el criterio nuevo y reportar el número

## 4. Verificación y cierre

- [x] 4.1 Recorrido de códigos: aplicar código → venta pendiente (no cuenta) → confirmar (cuenta y comisiona) → anular (libera) → reconfirmar, verificando la base en cada paso
- [x] 4.2 Recorrido de los tres caminos de activación de acceso, comprobando que los tres producen el mismo efecto
- [x] 4.3 Recorrido de documentos: subir, ver como candidata, ver como admin, intentar ver con otra sesión (403), sin sesión (401) y con el archivo ausente
- [x] 4.4 Recorrido del formulario campo por campo en ambas partes: bloqueo, marcado en rojo, resumen, foco, guardado parcial y validación de servidor
- [x] 4.5 `npm run build` sin errores. `npm run lint` está roto de antes (llama a `next lint`, retirado en Next 16) — anotado como deuda, no se arregla en este change
- [x] 4.6 Corregir los dos defectos colaterales detectados: `resto is not defined` en `app/api/admin/stats/route.js` (500 que rompe el Resumen del admin) y la `foto_url` corrupta (`data:img`) que dispara `ERR_INVALID_URL`
- [ ] 4.7 (pendiente: lo ejecuta Daniel con acceso al VPS) Desplegar siguiendo el plan de migración y verificar en producción los recorridos 4.1 y 4.3
- [x] 4.8 Actualizar las notas técnicas privadas con la deuda registrada (almacenamiento de objetos, ausencia de pruebas automatizadas, secretos JWT con valor por defecto en código)
