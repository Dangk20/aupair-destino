## 1. Datos

- [x] 1.1 `migrations/008_observaciones_perfil.sql` (idempotente) y registro en `deploy/desplegar.sh`
- [x] 1.2 Aplicar en la base local

## 2. Reglas y consultas

- [x] 2.1 `lib/observaciones-perfil.js`: `ubicacionesDeCampo`, `cubre`, `cambiosBloqueados`, `observacionesAtendidas`, etiquetas de un elemento
- [x] 2.2 `lib/bloqueo-perfil.js`: `estadoBloqueo`, `atenderObservaciones`
- [x] 2.3 `avisarObservaciones()` en `lib/notificaciones-aupair.js` y en la tabla de avisos del `CLAUDE.md`

## 3. Rutas (declararlas en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` antes del handler)

- [x] 3.1 `POST /api/dashboard/perfil/enviar`
- [x] 3.2 `GET /api/dashboard/observaciones`
- [x] 3.3 `GET/POST/PATCH /api/admin/perfiles/[id]/observaciones`
- [x] 3.4 `PUT /api/dashboard/perfil`: rechazar cambios bloqueados (403), atender después de guardar
- [x] 3.5 `PUT /api/dashboard/configuracion`, `POST /api/dashboard/foto`, `POST /api/dashboard/documento`: lo mismo
- [x] 3.6 `POST/DELETE /api/dashboard/documentos`: documento cargado cerrado salvo observación; atender tras reemplazar
- [x] 3.7 `GET /api/dashboard/perfil` y `/api/admin/perfiles/[id]`: incluir `parte1_enviada_at`/`parte2_enviada_at` (ya salen con `SELECT *`; comprobar)

## 4. Interfaz de la candidata

- [x] 4.1 `components/perfil/CampoEditable.jsx` extraído; la edición del admin lo importa
- [x] 4.2 Parte 1 y 2: "Enviar Parte N" + confirmación + envío; pantalla de parte enviada
- [x] 4.3 Ficha propia: bloque "El equipo te pidió corregir" con controles y guardado; "Editar"/"Corregir" según envío y observación
- [x] 4.4 Documentos (`/dashboard/documentos` y pestaña de la ficha): sin "Quitar"/"Volver a subir" en cargados, salvo observación, que se muestra
- [x] 4.5 Configuración: mostrar el rechazo del servidor (ya muestra `error`; comprobar)

## 5. Interfaz del admin

- [x] 5.1 Ficha en revisión: "Observar" por campo y por sección, con texto
- [x] 5.2 Pestaña Documentos en revisión: "Pedir corrección"
- [x] 5.3 Listado de observaciones con estado, "Cerrar" y "Retirar"

## 6. Verificación

- [x] 6.1 `npm run build`
- [x] 6.2 `node scripts/pruebas-humo.mjs` contra local
- [x] 6.3 Playwright — candidata envía la Parte 1 (confirmación, aviso); al volver al formulario ve "Enviaste tu Parte 1"
- [x] 6.4 Con la Parte 1 enviada: cambio de ciudad por la API → 403; desde Configuración → rechazado; la Parte 2 sigue guardando
- [x] 6.5 Documento cargado: sin "Quitar"; `DELETE` por la API → 403
- [x] 6.6 Admin observa el campo Cédula, la sección Referencias y el documento Antecedentes; la candidata ve las tres en su perfil
- [x] 6.7 La candidata corrige la Cédula: se guarda, queda "atendida", un segundo cambio → 403; no puede cambiar la Ciudad
- [x] 6.8 Corrige la sección Referencias; reemplaza Antecedentes (vuelve a "pendiente"); las tres atendidas
- [x] 6.9 Admin ve las tres "atendidas", cierra una; retira una observación abierta y el elemento vuelve a cerrarse
- [x] 6.10 El aviso por correo queda registrado en `notificaciones` (local: `omitido` sin clave de Resend)
- [x] 6.11 Perfil terminado antes del cambio (sin `parte1_enviada_at`): sigue editable
- [x] 6.12 Limpiar los datos de prueba

### Resultado de la verificación (2026-10-10, local, Playwright)

- Envío: "Enviar Parte 1" → confirmación ("¿Enviar la Parte 1? … ya no podrás editarla") → aviso de siguiente paso. Al volver al formulario: "Enviaste tu Parte 1 · La enviaste el 10 de octubre de 2026". Enviar la Parte 2 incompleta por la API → 400 con lo que falta.
- Con la Parte 1 enviada: ciudad por la API → 403 «Ciudad» ya fue enviado…; teléfono desde Configuración → el mismo mensaje en pantalla; foto de cédula → 403; la base no cambia. La Parte 2 sigue guardando (200).
- **Hallazgo:** la Parte 2 recibía 403 por la fecha de nacimiento, que nadie había tocado. El pool lee las fechas como UTC (`timezone: "Z"`) y el código las convertía con la hora de Colombia: `2000-05-10` pasaba a `2000-05-09`. Corregido en `lib/observaciones-perfil.js` y en `lib/campos-perfil.js` (`aFecha`, `isoDe`), que tenía el mismo error en el cálculo de edad del change `edad-y-aviso-documentos`: ahora servidor y navegador dan el mismo día.
- Documentos: sin "Quitar" en los cargados; `DELETE` por la API → 403.
- Admin, desde la ficha: observa el campo Cédula, la sección Referencias y el documento Pasaporte (la candidata de prueba no tiene antecedentes cargados). Panel: "3 abiertas".
- Candidata: "El equipo te pidió corregir 3 cosas", cada una con su control. Corrige la Cédula (200) → atendida; un segundo cambio → 403; la Ciudad sigue en 403. Corrige Referencias (200). Reemplaza el pasaporte (200) → vuelve a "pendiente", la observación queda atendida y quitarlo da 403.
- La candidata veía "Jefe (valor guardado)", una marca para el equipo: `CampoEditable` gana `marcarHeredado` y la corrección la apaga.
- Admin: "0 abiertas · 3 atendidas por revisar"; "Dar por corregida" (200). Observa la Ciudad y la retira (200): la ciudad vuelve a dar 403.
- Aviso: con un correo entregable, fila en `notificaciones` con `observaciones_perfil · omitido · sin RESEND_API_KEY` (en local no hay clave). A los dominios `.local` el módulo no les escribe, por diseño.
- Sin `parte1_enviada_at` la candidata cambia la ciudad (200). Con la Parte 1 enviada, la ficha no muestra "Editar" en sus secciones y sí en las de la Parte 2.
- `npm run build` y `pruebas-humo.mjs`: 608 en verde, 0 en rojo (antes 586; las nuevas son las rutas de este change).

## 7. Despliegue

- [x] 7.1 `bash deploy/desplegar.sh` (lleva migración); comprobar `sha256` — desplegado el 12 oct (ver commit ac6c0df y la Bitácora del cronograma)
- [x] 7.2 Daniel recorre en producción: observar un campo de una candidata de prueba y corregirlo — Daniel confirmó el recorrido en producción el 13 oct
- [x] 7.3 Anotar en la bitácora como trabajo adicional (R3) — anotado en la Bitácora (fila del 12 oct, adicional R3)
