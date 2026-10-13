## 1. La regla, en un solo lugar

- [x] 1.1 `lib/curso-aupair.js` con `CURSO_LIBRE`, `estadosDeSesiones()` (el bucle de la ruta, sin cambios de comportamiento) y `sesionVisible()`
- [x] 1.2 `GET /api/dashboard/sesiones` usa `estadosDeSesiones()`

## 2. Servidor

- [x] 2.1 `GET /api/dashboard/sesiones` adjunta `recursos` (con `disponible` y la URL autenticada) sólo a las sesiones no bloqueadas
- [x] 2.2 `/api/sesion-recursos/[id]/archivo`: `sesionVisible` en vez de `acceso_recursos`; `Content-Disposition: attachment` con el nombre y la extensión
- [x] 2.3 `POST /api/admin/recursos`: rechazar con 400 lo que no sea PDF/Word o pase de 20 MB
- [x] 2.4 `docs/rutas-y-acceso.md`: actualizar el nivel de `/sesion-recursos/[id]/archivo`

## 3. Interfaz

- [x] 3.1 `/dashboard/curso`: sección "Recursos de esta clase" en la tarjeta de la sesión activa, con descarga y estado "No disponible"

## 4. Verificación

- [x] 4.1 `npm run build`
- [x] 4.2 `node scripts/pruebas-humo.mjs` contra local
- [x] 4.3 Playwright — admin sube dos PDF a la sesión 1 desde `/admin/sesiones`; intenta subir un `.txt` por la API → 400
- [x] 4.4 Playwright — candidata sin `acceso_recursos` abre `/dashboard/curso`: ve los dos recursos en la sesión 1, descarga uno y llega como adjunto con su nombre
- [x] 4.5 Una sesión sin recursos no muestra la sección
- [x] 4.6 La candidata pide por URL un recurso de una sesión bloqueada para ella → 403; la lista de sesiones no trae sus recursos
- [x] 4.7 Un recurso cuyo archivo se borró del almacenamiento sale como "No disponible"
- [x] 4.8 Limpiar los recursos y archivos de prueba

### Resultado de la verificación (2026-10-10, local, Playwright)

- Admin, desde `/admin/sesiones` → Editar → Recursos: dos PDF subidos a la sesión 1 (200). Un `.txt` por la API → 400 "Sólo se aceptan archivos PDF o Word." El panel mostraba "Error al subir." para cualquier fallo; ahora muestra el motivo del servidor.
- Candidata recién registrada, sin `acceso_recursos`: en `/dashboard/curso` ve "RECURSOS DE ESTA CLASE" con los dos archivos ("PDF · 1 KB"); la descarga llega como adjunto `Guía de entrevista.pdf` y empieza por `%PDF-1.4`.
- Con la sesión 1 completada, la sesión 2 (sin recursos) no muestra la sección. La sesión 3, bloqueada, llega con `recursos: []` y su recurso pedido por URL → 403.
- Archivo borrado del almacenamiento: aparece "No disponible" y sin botón de descarga; el otro recurso se descarga normal.
- `npm run build` y `pruebas-humo.mjs`: 586 en verde, 0 en rojo.

## 5. Despliegue

- [x] 5.1 `bash deploy/desplegar-codigo.sh`; comprobar `sha256` de los archivos tocados en el VPS — desplegado el 12 oct (ver commit ac6c0df y la Bitácora del cronograma)
- [x] 5.2 Daniel sube un recurso real en producción y lo descarga con una cuenta de candidata — Daniel confirmó el recorrido en producción el 13 oct
- [x] 5.3 Anotar en la bitácora como trabajo adicional (R7) y avisar a la clienta que el material del curso queda abierto a quien ve el video — anotado en la Bitácora (fila del 12 oct, adicional R7); el aviso a la clienta va en el reporte de avance
