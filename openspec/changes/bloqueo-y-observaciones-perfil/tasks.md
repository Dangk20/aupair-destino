## 1. Datos

- [ ] 1.1 `migrations/008_observaciones_perfil.sql` (idempotente) y registro en `deploy/desplegar.sh`
- [ ] 1.2 Aplicar en la base local

## 2. Reglas y consultas

- [ ] 2.1 `lib/observaciones-perfil.js`: `ubicacionesDeCampo`, `cubre`, `cambiosBloqueados`, `observacionesAtendidas`, etiquetas de un elemento
- [ ] 2.2 `lib/bloqueo-perfil.js`: `estadoBloqueo`, `atenderObservaciones`
- [ ] 2.3 `avisarObservaciones()` en `lib/notificaciones-aupair.js` y en la tabla de avisos del `CLAUDE.md`

## 3. Rutas (declararlas en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` antes del handler)

- [ ] 3.1 `POST /api/dashboard/perfil/enviar`
- [ ] 3.2 `GET /api/dashboard/observaciones`
- [ ] 3.3 `GET/POST/PATCH /api/admin/perfiles/[id]/observaciones`
- [ ] 3.4 `PUT /api/dashboard/perfil`: rechazar cambios bloqueados (403), atender después de guardar
- [ ] 3.5 `PUT /api/dashboard/configuracion`, `POST /api/dashboard/foto`, `POST /api/dashboard/documento`: lo mismo
- [ ] 3.6 `POST/DELETE /api/dashboard/documentos`: documento cargado cerrado salvo observación; atender tras reemplazar
- [ ] 3.7 `GET /api/dashboard/perfil` y `/api/admin/perfiles/[id]`: incluir `parte1_enviada_at`/`parte2_enviada_at` (ya salen con `SELECT *`; comprobar)

## 4. Interfaz de la candidata

- [ ] 4.1 `components/perfil/CampoEditable.jsx` extraído; la edición del admin lo importa
- [ ] 4.2 Parte 1 y 2: "Enviar Parte N" + confirmación + envío; pantalla de parte enviada
- [ ] 4.3 Ficha propia: bloque "El equipo te pidió corregir" con controles y guardado; "Editar"/"Corregir" según envío y observación
- [ ] 4.4 Documentos (`/dashboard/documentos` y pestaña de la ficha): sin "Quitar"/"Volver a subir" en cargados, salvo observación, que se muestra
- [ ] 4.5 Configuración: mostrar el rechazo del servidor (ya muestra `error`; comprobar)

## 5. Interfaz del admin

- [ ] 5.1 Ficha en revisión: "Observar" por campo y por sección, con texto
- [ ] 5.2 Pestaña Documentos en revisión: "Pedir corrección"
- [ ] 5.3 Listado de observaciones con estado, "Cerrar" y "Retirar"

## 6. Verificación

- [ ] 6.1 `npm run build`
- [ ] 6.2 `node scripts/pruebas-humo.mjs` contra local
- [ ] 6.3 Playwright — candidata envía la Parte 1 (confirmación, aviso); al volver al formulario ve "Enviaste tu Parte 1"
- [ ] 6.4 Con la Parte 1 enviada: cambio de ciudad por la API → 403; desde Configuración → rechazado; la Parte 2 sigue guardando
- [ ] 6.5 Documento cargado: sin "Quitar"; `DELETE` por la API → 403
- [ ] 6.6 Admin observa el campo Cédula, la sección Referencias y el documento Antecedentes; la candidata ve las tres en su perfil
- [ ] 6.7 La candidata corrige la Cédula: se guarda, queda "atendida", un segundo cambio → 403; no puede cambiar la Ciudad
- [ ] 6.8 Corrige la sección Referencias; reemplaza Antecedentes (vuelve a "pendiente"); las tres atendidas
- [ ] 6.9 Admin ve las tres "atendidas", cierra una; retira una observación abierta y el elemento vuelve a cerrarse
- [ ] 6.10 El aviso por correo queda registrado en `notificaciones` (local: `omitido` sin clave de Resend)
- [ ] 6.11 Perfil terminado antes del cambio (sin `parte1_enviada_at`): sigue editable
- [ ] 6.12 Limpiar los datos de prueba

## 7. Despliegue

- [ ] 7.1 `bash deploy/desplegar.sh` (lleva migración); comprobar `sha256`
- [ ] 7.2 Daniel recorre en producción: observar un campo de una candidata de prueba y corregirlo
- [ ] 7.3 Anotar en la bitácora como trabajo adicional (R3)
